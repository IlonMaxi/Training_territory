"""Baseline навигатора: намерение самого похожего запроса из train.

Признак один - текст запроса. Текст переводится в нижний регистр, ё заменяется на е,
из него выделяются слова из букв и цифр. Стоп-слова, опечатки и формы слов не обрабатываются.
Вес слова: число повторов в запросе * (ln((1 + N) / (1 + df)) + 1), где N и df считаются
только по train. После нормирования скалярное произведение равно косинусному сходству.
"""
import math
import re
from collections import Counter

TOKEN = re.compile(r'[a-zа-я0-9]+')
SCORE_DIGITS = 6  # сходство округляется, чтобы одинаковые оценки сравнивались как равные


def tokenize(text):
    # явная ошибка контракта вместо AttributeError где-то внутри (найдено специальным тестом в ЛР 8)
    if not isinstance(text, str):
        raise TypeError(f'Запрос должен быть строкой, получено {type(text).__name__}')
    return TOKEN.findall(text.lower().replace('ё', 'е'))


class TfidfIndex:
    """TF-IDF по словам. Словарь и IDF строятся только по текстам, переданным в fit."""

    def fit(self, texts):
        docs = [set(tokenize(text)) for text in texts]
        df = Counter(word for doc in docs for word in doc)
        n = len(docs)
        self.idf = {word: math.log((1 + n) / (1 + count)) + 1 for word, count in sorted(df.items())}
        return self

    def known(self, text):
        return [word for word in tokenize(text) if word in self.idf]

    def unknown(self, text):
        return [word for word in tokenize(text) if word not in self.idf]

    def vector(self, text):
        # слов не из словаря train просто нет в векторе; если не осталось ни одного, вектор нулевой
        counts = Counter(self.known(text))
        weights = {word: count * self.idf[word] for word, count in counts.items()}
        norm = math.sqrt(sum(weight * weight for weight in weights.values()))
        return {word: weight / norm for word, weight in weights.items()} if norm else {}


def cosine(a, b):
    if len(a) > len(b):
        a, b = b, a
    return sum(weight * b.get(word, 0.0) for word, weight in a.items())


class NearestQueryBaseline:
    """Намерение ближайшего запроса train. Нулевой вектор запроса - нет ответа (None)."""

    name = 'nearest_query_tfidf'

    def __init__(self, k=3):
        self.k = k

    def fit(self, rows):
        self.index = TfidfIndex().fit([row['text'] for row in rows])
        self.items = [(row['query_id'], row['label'], row['text'], self.index.vector(row['text']))
                      for row in rows]
        return self

    def neighbors(self, text):
        query = self.index.vector(text)
        if not query:
            return []
        scored = []
        for query_id, label, train_text, vector in self.items:
            score = round(cosine(query, vector), SCORE_DIGITS)
            if score > 0:
                scored.append({'query_id': query_id, 'label': label, 'text': train_text, 'score': score})
        # по убыванию сходства, равные оценки - по возрастанию ID
        scored.sort(key=lambda item: (-item['score'], item['query_id']))
        return scored[:self.k]

    def predict(self, text):
        top = self.neighbors(text)
        return top[0]['label'] if top else None


class MajorityBaseline:
    """Нижняя точка отсчёта: всегда самое частое намерение train."""

    name = 'majority'

    def fit(self, rows):
        counts = Counter(row['label'] for row in rows)
        self.label = min(counts, key=lambda label: (-counts[label], label))
        return self

    def predict(self, text):
        return self.label
