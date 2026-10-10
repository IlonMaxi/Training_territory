from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
import difflib
import json
import logging
import os
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neural_network import MLPClassifier

try:
    from .forecasting import build_forecast
except ImportError:
    from forecasting import build_forecast

logger = logging.getLogger("training_territory.ml")

app = FastAPI(title="Training Territory ML")

class SeriesPoint(BaseModel):
    date: str | None = None
    value: float

class PredictRequest(BaseModel):
    series: list[SeriesPoint]
    weeks: int = 4
    degree: int = 2

class IntentRequest(BaseModel):
    text: str

# Куда вести пользователя, решает фронтенд: там известны реальные маршруты
# и роль вошедшего (у тренера и клиента расписание живёт на разных страницах).
# Сервис отвечает только за классификацию.

# Ниже этого порога ответ считается неуверенным и чат переспрашивает
CONFIDENCE_THRESHOLD = 0.35

# Служебный класс для запросов не по теме приложения. Наружу не отдаётся:
# распознанный OTHER_INTENT превращается в "unknown".
OTHER_INTENT = "other"

# Слова-заполнители: они есть почти в любом запросе и одинаково похожи на все
# намерения. При символьных n-граммах они размывают вес ключевого слова —
# «мне нужно в настройки» давало 0.50 против 0.81 у одного слова «настройки».
STOPWORDS = {
    "а", "бы", "в", "во", "где", "да", "для", "до", "если", "есть", "ещё", "еще",
    "же", "и", "из", "или", "к", "как", "ко", "куда", "ли", "мне", "мной", "мог",
    "могу", "мои", "моих", "мой", "моя", "моё", "мое", "на", "надо", "не", "нет",
    "но", "нужен", "нужна", "нужно", "нужны", "о", "об", "от", "по", "пожалуйста",
    "при", "с", "со", "так", "тут", "у", "хотел", "хотела", "хочу", "чтобы",
    "что", "это", "я"
}

# Порог похожести при исправлении опечатки. На 0.75 «пресс» превращался
# в «прогресс», а «трицепс» в «бицепс» — разные слова склеивались.
# На 0.8 настоящие опечатки правятся, а близкие по написанию слова остаются.
TYPO_CUTOFF = 0.8
MIN_TYPO_LENGTH = 5


def _normalize(text: str) -> str:
    cleaned = text.lower().replace("ё", "е")
    cleaned = re.sub(r"[^a-zа-я0-9\s]+", " ", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned


def _drop_stopwords(text: str) -> str:
    tokens = [t for t in text.split() if t not in STOPWORDS]
    # Если от запроса ничего не осталось («что мне нужно?»), берём как было —
    # пусть лучше классификатор ответит неуверенно, чем на пустой строке
    return " ".join(tokens) if tokens else text


def _common_prefix(a: str, b: str) -> int:
    length = 0
    for x, y in zip(a, b):
        if x != y:
            break
        length += 1
    return length


def _best_match(token: str):
    """
    Ближайшее слово словаря. get_close_matches при равном счёте выбирает
    произвольно, и «тренирвока» уходила в «тренировок» (0.9000) вместо
    «тренировка» (тоже 0.9000) — запрос улетал в раздел подписки.
    Ничьи разрешаем по совпадению начала и конца слова: у опечатки они
    обычно те же, что у исходного слова.
    """
    best = None
    best_key = None

    for candidate in VOCABULARY:
        ratio = difflib.SequenceMatcher(None, token, candidate).ratio()
        if ratio < TYPO_CUTOFF:
            continue

        suffix = _common_prefix(token[::-1], candidate[::-1])
        key = (round(ratio, 4), _common_prefix(token, candidate), suffix)
        if best_key is None or key > best_key:
            best, best_key = candidate, key

    return best


def _fix_typos(text: str) -> str:
    if not VOCABULARY:
        return text

    fixed = []
    for token in text.split():
        if token in VOCABULARY_SET or len(token) < MIN_TYPO_LENGTH:
            fixed.append(token)
            continue
        match = _best_match(token)
        fixed.append(match or token)
    return " ".join(fixed)


def _prepare(text: str) -> str:
    """Приведение запроса к тому же виду, в каком обучалась модель."""
    return _drop_stopwords(_fix_typos(_normalize(text)))


def _load_intent_data():
    path = os.path.join(os.path.dirname(__file__), "intent_data.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def _train_intent_model():
    data = _load_intent_data()
    samples = []
    labels = []
    vocabulary = set()

    for intent, phrases in data.items():
        for phrase in phrases:
            normalized = _normalize(phrase)
            if not normalized:
                continue
            # Словарь для исправления опечаток — из слов обучающих фраз,
            # включая служебные: по ним тоже промахиваются
            vocabulary.update(normalized.split())
            sample = _drop_stopwords(normalized)
            if sample:
                samples.append(sample)
                labels.append(intent)

    if not samples or len(set(labels)) < 2:
        return None, None, []

    # analyzer="char_wb" по символьным n-граммам устойчив к опечаткам и
    # словоформам («расписание» / «расписании» / «распсание»), что важнее
    # словарного совпадения при коротких запросах.
    vectorizer = TfidfVectorizer(analyzer="char_wb", ngram_range=(3, 5), min_df=1)
    X = vectorizer.fit_transform(samples)

    # Многослойный перцептрон: один скрытый слой на 64 нейрона, обучение
    # обратным распространением ошибки, выход softmax по числу намерений.
    # На пятикратной перекрёстной проверке даёт 0.779 против 0.786 у
    # логистической регрессии — разница в пределах разброса (±0.04).
    # Архитектуру подбирал перебором: (128,64) и (256,128) оказались хуже,
    # данных для более глубокой сети недостаточно.
    clf = MLPClassifier(
        hidden_layer_sizes=(64,),
        activation="relu",
        solver="adam",
        alpha=0.01,
        max_iter=3000,
        random_state=42,
    )
    clf.fit(X, labels)
    return vectorizer, clf, sorted(vocabulary)

VOCABULARY: list = []
VOCABULARY_SET: set = set()

try:
    VECTORIZER, INTENT_MODEL, VOCABULARY = _train_intent_model()
    VOCABULARY_SET = set(VOCABULARY)
    if INTENT_MODEL is None:
        logger.error("Классификатор намерений не обучен: intent_data.json пуст или в нём меньше двух намерений")
    else:
        logger.info(
            "Классификатор намерений обучен: %s намерений, словарь %s слов",
            len(INTENT_MODEL.classes_), len(VOCABULARY)
        )
except Exception:
    # Молчаливый except раньше прятал причину, и /intent просто всегда
    # отвечал "unknown" без единой строчки в логе.
    logger.exception("Не удалось обучить классификатор намерений")
    VECTORIZER, INTENT_MODEL = None, None

@app.post("/predict")
def predict(req: PredictRequest):
    try:
        return build_forecast(req.series, req.weeks)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

@app.post("/intent")
def predict_intent(req: IntentRequest):
    text = _prepare(req.text)
    if not text:
        raise HTTPException(status_code=400, detail="Empty text")
    if VECTORIZER is None or INTENT_MODEL is None:
        return {"intent": "unknown", "confidence": 0.0}

    X = VECTORIZER.transform([text])
    probs = INTENT_MODEL.predict_proba(X)[0]
    classes = INTENT_MODEL.classes_

    order = np.argsort(probs)[::-1]
    # Три лучших варианта: если уверенности не хватило, чат предложит их
    # кнопками вместо бесполезного «не понял». Класс OTHER_INTENT в
    # подсказки не попадает — предлагать «прочее» кнопкой бессмысленно.
    alternatives = [
        {"intent": str(classes[i]), "confidence": float(probs[i])}
        for i in order[:4]
        if str(classes[i]) != OTHER_INTENT
    ][:3]

    best_idx = int(order[0])
    best_label = str(classes[best_idx])
    best_confidence = float(probs[best_idx])

    # Сеть уверенно относила посторонние запросы к ближайшему разделу
    # («сколько стоит биткоин» -> подписка, 0.96). Порогом это не лечилось,
    # поэтому добавлен обучающий класс «прочее»: модель теперь распознаёт
    # чужое явно, а не по низкой уверенности.
    if best_label == OTHER_INTENT:
        return {
            "intent": "unknown",
            "confidence": best_confidence,
            "alternatives": alternatives,
            "query": text
        }

    best = {"intent": best_label, "confidence": best_confidence}

    # query — текст после исправления опечаток. Его использует фронтенд,
    # когда ищет программу тренировки: «тринировка на ноги» приходит сюда
    # уже как «тренировка ноги», и поиск по базе срабатывает.
    if best["confidence"] < CONFIDENCE_THRESHOLD:
        return {
            "intent": "unknown",
            "confidence": best["confidence"],
            "alternatives": alternatives,
            "query": text
        }

    return {
        "intent": best["intent"],
        "confidence": best["confidence"],
        "alternatives": alternatives,
        "query": text
    }
