from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any

import numpy as np
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.neural_network import MLPRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


@dataclass
class PreparedSeries:
    dates: list[datetime]
    x: np.ndarray
    y: np.ndarray


def build_forecast(series: list[Any], weeks: int) -> dict:
    prepared = _prepare_series(series)
    if len(prepared.y) < 2:
        raise ValueError("Not enough data points")

    weeks = max(1, min(int(weeks), 12))

    if len(prepared.y) < 6:
        return _linear_forecast(prepared, weeks, "linear_fallback", "too_few_points")

    ml_result = _ml_forecast(prepared, weeks)
    if ml_result:
        return ml_result

    return _linear_forecast(prepared, weeks, "linear_fallback", "not_enough_training_windows")


def _prepare_series(series: list[Any]) -> PreparedSeries:
    raw_points = []
    parsed_dates = []

    for point in series:
        value = _get_attr(point, "value")
        if value is None:
            continue

        value = float(value)
        if not np.isfinite(value):
            continue

        parsed_date = _parse_date(_get_attr(point, "date"))
        raw_points.append((parsed_date, value))
        parsed_dates.append(parsed_date)

    if len(raw_points) < 2:
        return PreparedSeries([], np.array([], dtype=float), np.array([], dtype=float))

    if all(date is not None for date in parsed_dates):
        grouped = {}
        for date, value in raw_points:
            day = date.date().isoformat()
            grouped.setdefault(day, []).append(value)

        dates = [datetime.fromisoformat(day) for day in sorted(grouped)]
        values = [float(np.mean(grouped[day.date().isoformat()])) for day in dates]
    else:
        today = datetime.utcnow()
        values = [value for _, value in raw_points]
        dates = [
            today - timedelta(days=7 * (len(values) - idx - 1))
            for idx in range(len(values))
        ]

    start = dates[0]
    x = np.array([(date - start).days for date in dates], dtype=float)
    y = np.array(values, dtype=float)
    return PreparedSeries(dates, x, y)


def _parse_date(value: Any) -> datetime | None:
    if not value:
        return None

    text = str(value)
    try:
        return datetime.fromisoformat(text)
    except ValueError:
        try:
            return datetime.strptime(text, "%Y-%m-%d")
        except ValueError:
            return None


def _get_attr(point: Any, field: str) -> Any:
    if isinstance(point, dict):
        return point.get(field)
    return getattr(point, field, None)


def _ml_forecast(prepared: PreparedSeries, weeks: int) -> dict | None:
    lag_count = min(4, max(2, len(prepared.y) // 3))
    train_x, train_y = _make_training_set(prepared.x, prepared.y, lag_count)

    if len(train_y) < 4:
        return None

    candidates = _candidate_models(len(train_y))
    scored_models = []

    for name, factory in candidates:
        mae = _rolling_mae(factory, train_x, train_y)
        if mae is None:
            continue
        scored_models.append((mae, name, factory))

    if not scored_models:
        return None

    mae, model_name, factory = min(scored_models, key=lambda item: item[0])
    model = factory()
    model.fit(train_x, train_y)

    future_points = _predict_future(model, prepared, weeks, lag_count)
    confidence = _confidence_score(prepared.y, mae, len(train_y))

    return {
        "weeks": weeks,
        "predicted": future_points[-1],
        "series": future_points,
        "model": model_name,
        "quality": {
            "mae": float(mae),
            "confidence": float(confidence),
            "training_windows": int(len(train_y)),
            "lag_count": int(lag_count),
            "fallback": False,
        },
    }


def _candidate_models(sample_count: int):
    models = [
        (
            "ridge_regression",
            lambda: Pipeline([
                ("scaler", StandardScaler()),
                ("model", Ridge(alpha=1.0)),
            ]),
        ),
        (
            "random_forest_regressor",
            lambda: RandomForestRegressor(
                n_estimators=120,
                min_samples_leaf=2,
                random_state=42,
            ),
        ),
    ]

    if sample_count >= 8:
        models.append((
            "gradient_boosting_regressor",
            lambda: GradientBoostingRegressor(random_state=42),
        ))

        # Нейросеть участвует наравне с остальными: лучшая модель выбирается
        # по ошибке на скользящей проверке в _rolling_mae, поэтому перцептрон
        # попадёт в прогноз только если реально точнее. Требует больше точек,
        # чем линейные модели, отсюда порог в 8 наблюдений.
        models.append((
            "neural_network_mlp",
            lambda: Pipeline([
                ("scaler", StandardScaler()),
                ("model", MLPRegressor(
                    hidden_layer_sizes=(32, 16),
                    activation="relu",
                    solver="lbfgs",
                    alpha=0.01,
                    max_iter=2000,
                    random_state=42,
                )),
            ]),
        ))

    return models


def _make_training_set(x_values: np.ndarray, y_values: np.ndarray, lag_count: int):
    features = []
    targets = []

    for target_idx in range(lag_count, len(y_values)):
        history_slice = slice(target_idx - lag_count, target_idx)
        horizon_days = max(float(x_values[target_idx] - x_values[target_idx - 1]), 1.0)
        features.append(_build_features(
            x_values[history_slice],
            y_values[history_slice],
            horizon_days,
        ))
        targets.append(float(y_values[target_idx]))

    return np.array(features, dtype=float), np.array(targets, dtype=float)


def _build_features(x_window: np.ndarray, y_window: np.ndarray, horizon_days: float):
    y_window = np.array(y_window, dtype=float)
    x_window = np.array(x_window, dtype=float)

    deltas = np.diff(y_window)
    day_gaps = np.diff(x_window)
    if len(deltas):
        mean_delta = float(np.mean(deltas))
        last_delta = float(deltas[-1])
    else:
        mean_delta = 0.0
        last_delta = 0.0

    if len(x_window) > 1 and len(set(x_window.tolist())) > 1:
        slope = float(np.polyfit(x_window - x_window[0], y_window, 1)[0])
    else:
        slope = 0.0

    return [
        *y_window.tolist(),
        float(y_window[-1]),
        float(np.mean(y_window)),
        float(np.std(y_window)),
        float(np.min(y_window)),
        float(np.max(y_window)),
        mean_delta,
        last_delta,
        slope,
        float(np.mean(day_gaps)) if len(day_gaps) else 7.0,
        float(horizon_days),
    ]


def _rolling_mae(factory, train_x: np.ndarray, train_y: np.ndarray) -> float | None:
    if len(train_y) < 4:
        return None

    first_validation_idx = max(2, len(train_y) // 2)
    errors = []

    for idx in range(first_validation_idx, len(train_y)):
        model = factory()
        model.fit(train_x[:idx], train_y[:idx])
        prediction = float(model.predict(train_x[idx:idx + 1])[0])
        errors.append(abs(prediction - float(train_y[idx])))

    if not errors:
        return None

    return float(np.mean(errors))


def _predict_future(model, prepared: PreparedSeries, weeks: int, lag_count: int):
    x_values = prepared.x.astype(float).tolist()
    y_values = prepared.y.astype(float).tolist()
    last_date = prepared.dates[-1]
    lower, upper = _prediction_bounds(prepared.y)
    future_points = []

    for week in range(1, weeks + 1):
        next_x = x_values[-1] + 7.0
        x_window = np.array(x_values[-lag_count:], dtype=float)
        y_window = np.array(y_values[-lag_count:], dtype=float)
        features = np.array([_build_features(x_window, y_window, 7.0)], dtype=float)
        prediction = float(model.predict(features)[0])
        prediction = float(np.clip(prediction, lower, upper))

        next_date = last_date + timedelta(days=7 * week)
        future_points.append({
            "date": next_date.date().isoformat(),
            "value": prediction,
        })

        x_values.append(next_x)
        y_values.append(prediction)

    return future_points


def _linear_forecast(prepared: PreparedSeries, weeks: int, model_name: str, reason: str):
    last_n = min(len(prepared.y), 8)
    x = prepared.x[-last_n:]
    y = prepared.y[-last_n:]

    coeffs = np.polyfit(x, y, 1)
    poly = np.poly1d(coeffs)
    lower, upper = _prediction_bounds(y)
    last_date = prepared.dates[-1]
    future_points = []

    for week in range(1, weeks + 1):
        next_x = x[-1] + (7 * week)
        prediction = float(np.clip(poly(next_x), lower, upper))
        future_points.append({
            "date": (last_date + timedelta(days=7 * week)).date().isoformat(),
            "value": prediction,
        })

    return {
        "weeks": weeks,
        "predicted": future_points[-1],
        "series": future_points,
        "model": model_name,
        "quality": {
            "mae": None,
            "confidence": float(min(0.45, len(prepared.y) / 12)),
            "training_windows": 0,
            "lag_count": 0,
            "fallback": True,
            "reason": reason,
        },
    }


def _prediction_bounds(y_values: np.ndarray):
    min_y = float(np.min(y_values))
    max_y = float(np.max(y_values))
    value_range = max_y - min_y
    scale = max(abs(float(y_values[-1])), abs(max_y), 1.0)
    pad = max(value_range * 0.75, scale * 0.2)

    lower = min_y - pad
    upper = max_y + pad
    if min_y >= 0:
        lower = max(0.0, lower)

    return lower, upper


def _confidence_score(y_values: np.ndarray, mae: float, sample_count: int) -> float:
    value_range = float(np.max(y_values) - np.min(y_values))
    scale = max(value_range, abs(float(np.mean(y_values))), 1.0)
    error_factor = 1.0 / (1.0 + (mae / scale))
    data_factor = min(1.0, sample_count / 10.0)
    return max(0.05, min(0.95, error_factor * data_factor))
