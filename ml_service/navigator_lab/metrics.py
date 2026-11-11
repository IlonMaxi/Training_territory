"""Метрики классификации намерений. Пустой ответ (None) считается ошибкой."""
import random


def per_class(y_true, y_pred, labels):
    rows = []
    for label in labels:
        tp = sum(t == label and p == label for t, p in zip(y_true, y_pred))
        fp = sum(t != label and p == label for t, p in zip(y_true, y_pred))
        fn = sum(t == label and p != label for t, p in zip(y_true, y_pred))
        precision = tp / (tp + fp) if tp + fp else 0.0
        recall = tp / (tp + fn) if tp + fn else 0.0
        f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
        rows.append({'label': label, 'support': tp + fn, 'predicted': tp + fp, 'correct': tp,
                     'precision': precision, 'recall': recall, 'f1': f1})
    return rows


def macro_f1(y_true, y_pred, labels):
    return sum(row['f1'] for row in per_class(y_true, y_pred, labels)) / len(labels)


def accuracy(y_true, y_pred):
    return sum(t == p for t, p in zip(y_true, y_pred)) / len(y_true)


def bootstrap_ci(y_true, y_pred, metric, samples=1000, seed=42):
    """95% интервал. Выборки берутся внутри каждого намерения, состав классов как в исходной выборке."""
    rng = random.Random(seed)
    groups = {}
    for i, label in enumerate(y_true):
        groups.setdefault(label, []).append(i)
    values = []
    for _ in range(samples):
        idx = [rng.choice(group) for _, group in sorted(groups.items()) for _ in group]
        values.append(metric([y_true[i] for i in idx], [y_pred[i] for i in idx]))
    values.sort()
    return values[round(0.025 * (samples - 1))], values[round(0.975 * (samples - 1))]
