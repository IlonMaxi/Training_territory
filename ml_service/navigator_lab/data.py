"""Загрузка зафиксированной версии данных навигатора.

intents_clean_v2.csv собран в ЛР 6 из ml_service/intent_data.json коммита b973fb9:
314 запросов, 12 намерений, деление по группам: train 193, validation 63, test 58.
"""
import csv
import hashlib
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parent / 'data' / 'intents_clean_v2.csv'
DATA_VERSION = '60d80a7acb7eb7fa'
SOURCE_COMMIT = 'b973fb982ef23e57fb6dda4d19ca2ad0ee57fddf'
SPLITS = ('train', 'validation', 'test')


def data_hash(path=DATA_PATH):
    # хеш считается с переводами строк \n, как в ЛР 6: git на Windows может заменить их на \r\n
    raw = Path(path).read_bytes().replace(b'\r\n', b'\n')
    return hashlib.sha256(raw).hexdigest()[:16]


def load_clean(path=DATA_PATH, expected=DATA_VERSION):
    actual = data_hash(path)
    if actual != expected:
        raise ValueError(f'Файл данных изменился: хеш {actual}, ожидался {expected}')
    with open(path, encoding='utf-8', newline='') as f:
        return list(csv.DictReader(f))


def select(rows, split):
    return [row for row in rows if row['split'] == split]
