from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
import numpy as np

app = FastAPI(title="Training Territory ML")

class SeriesPoint(BaseModel):
    date: str | None = None
    value: float

class PredictRequest(BaseModel):
    series: list[SeriesPoint]
    weeks: int = 4
    degree: int = 2

@app.post("/predict")
def predict(req: PredictRequest):
    if not req.series or len(req.series) < 2:
        raise HTTPException(status_code=400, detail="Not enough data points")

    weeks = max(1, min(req.weeks, 12))
    values = [p.value for p in req.series]

    dates = []
    for p in req.series:
        if p.date:
            try:
                dates.append(datetime.fromisoformat(p.date))
            except ValueError:
                try:
                    dates.append(datetime.strptime(p.date, "%Y-%m-%d"))
                except ValueError:
                    dates.append(None)
        else:
            dates.append(None)

    if all(d is not None for d in dates):
        paired = sorted(zip(dates, values), key=lambda item: item[0])
        dates = [item[0] for item in paired]
        values = [item[1] for item in paired]
        start = dates[0]
        x = np.array([(d - start).days for d in dates], dtype=float)
    else:
        x = np.arange(len(values), dtype=float)
        start = datetime.utcnow()

    y = np.array(values, dtype=float)

    last_n = min(len(values), 8)
    x = x[-last_n:]
    y = y[-last_n:]

    deg = 1
    coeffs = np.polyfit(x, y, deg)
    poly = np.poly1d(coeffs)

    days_ahead = weeks * 7
    step = 7
    future_x = np.arange(x[-1] + step, x[-1] + days_ahead + 1, step)
    future_values = poly(future_x)

    min_y = float(np.min(y))
    max_y = float(np.max(y))
    range_y = max_y - min_y
    pad = (range_y * 0.15) if range_y > 0 else max(abs(max_y), 1.0) * 0.15
    lower = min_y - pad
    upper = max_y + pad
    future_values = np.clip(future_values, lower, upper)

    future_points = []
    for idx, xv in enumerate(future_x):
        future_date = start + timedelta(days=int(xv))
        future_points.append({
            "date": future_date.date().isoformat(),
            "value": float(future_values[idx])
        })

    return {
        "weeks": weeks,
        "predicted": future_points[-1],
        "series": future_points
    }
