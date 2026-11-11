"""ЛР 8: метрики по требованиям, сегменты, матрица ошибок, таксономия ошибок и специальные тесты.

Модель та же, что в ЛР 7. Меняется только то, как оцениваются её ответы: с учётом того,
что навигатор делает в интерфейсе (components/chat/AiNavigator.vue). Запуск из папки ml_service:
python -m navigator_lab analyze
"""
import csv
import json
from pathlib import Path

from .baseline import NearestQueryBaseline, tokenize
from .data import ANNOTATIONS_VERSION, DATA_VERSION, load_annotations, load_clean, select
from .metrics import accuracy, confusion_matrix, hit_at_k, macro_f1, per_class, wrong_navigation_rate

RESULTS = Path(__file__).resolve().parent / 'results' / 'lab08'
OTHER = 'other'
# нет ответа и «прочее»: навигатор ничего не открывает, а предлагает кнопки или список разделов
NO_ACTION = (None, OTHER)
# разделы одной роли, как в DESTINATIONS из components/chat/AiNavigator.vue
ROLE_ONLY = {'clients': 'trainer', 'nutrition': 'client'}
# стоп-слова сервиса: тот же список, что STOPWORDS в ml_service/main.py (сверяется тестом)
SERVICE_STOPWORDS = {
    'а', 'бы', 'в', 'во', 'где', 'да', 'для', 'до', 'если', 'есть', 'ещё', 'еще', 'же', 'и', 'из', 'или', 'к',
    'как', 'ко', 'куда', 'ли', 'мне', 'мной', 'мог', 'могу', 'мои', 'моих', 'мой', 'моя', 'моё', 'мое', 'на',
    'надо', 'не', 'нет', 'но', 'нужен', 'нужна', 'нужно', 'нужны', 'о', 'об', 'от', 'по', 'пожалуйста', 'при',
    'с', 'со', 'так', 'тут', 'у', 'хотел', 'хотела', 'хочу', 'чтобы', 'что', 'это', 'я',
}
# пороги альфа-версии (lab08/metric_spec.md): метрика, условие, порог, откуда требование
ALPHA = [
    ('macro_f1', '>=', 0.70, 'основная метрика: все разделы одинаково важны'),
    ('accuracy', '>=', 0.75, 'R1, план проекта'),
    ('wrong_navigation', '<=', 0.10, 'R1, R3: лучше переспросить, чем открыть не то'),
    ('zero_recall_intents', '<=', 0, 'ни один раздел не должен пропадать целиком'),
    ('offtopic_navigation', '<=', 0.125, 'R2: не больше 1 из 8 посторонних запросов'),
]
LATIN_QUERIES = ['my schedule', 'settings', 'trainer chat', 'help']
INVALID_INPUTS = [('пустая строка', ''), ('только пробелы и знаки', '  ?!'), ('None', None), ('число', 42),
                  ('длинный текст, 2000 символов', 'абв ' * 500)]


def train_forms(index, words):
    # только для разбора ошибок, в модели не используется:
    # слова train с теми же первыми 5 буквами, что у неизвестного слова (правило групп из ЛР 6)
    forms = []
    for word in words:
        same = [known for known in index.idf if known[:5] == word[:5]]
        if same:
            forms.append(f"{word}: {', '.join(same)}")
    return forms


def error_type(prediction, label, unknown):
    if prediction == label:
        return ''
    if prediction is None:
        return 'нет ответа'
    return 'есть неизвестные слова' if unknown else 'все слова известны'


def buttons(ranking, k=3):
    """Три кнопки, как в интерфейсе: разные намерения по убыванию сходства, без «прочего»."""
    result = []
    for item in ranking:
        if item['label'] != OTHER and item['label'] not in result:
            result.append(item['label'])
        if len(result) == k:
            break
    return result


def make_typo(text):
    """Перестановка 4-й и 5-й букв в самом длинном слове от 5 букв, как в тесте опечаток ЛР 6."""
    words = text.split()
    candidates = [word for word in words if len(word) >= 5 and word[3] != word[4]]
    if not candidates:
        return None
    word = max(candidates, key=len)
    words[words.index(word)] = word[:3] + word[4] + word[3] + word[5:]
    return ' '.join(words)


def segments_of(case, index, annotation):
    words = tokenize(case['text'])
    known = [word for word in words if word in index.idf]
    coverage = ('нет известных слов' if not known else
                'часть слов неизвестна' if len(known) < len(words) else 'все слова известны')
    hard = annotation['confidence_b'] != '3' or annotation['label_b'] != case['label']
    return {
        'покрытие словарём train': coverage,
        'длина запроса': '1 слово' if len(words) == 1 else '2 слова' if len(words) == 2 else '3 слова и больше',
        'разметка ЛР 6': 'сложная: B сомневался или не согласен' if hard else 'уверенная',
        'тема': 'посторонние (other)' if case['label'] == OTHER else 'разделы платформы',
    }


def build_cases(model, validation, annotations):
    cases = []
    for row in validation:
        ranking = model.neighbors(row['text'])
        first = ranking[0] if ranking else None
        prediction = first['label'] if first else None
        unknown = model.index.unknown(row['text'])
        case = {
            'query_id': row['query_id'], 'text': row['text'], 'label': row['label'], 'prediction': prediction,
            'correct': prediction == row['label'], 'navigation': prediction not in NO_ACTION,
            'unknown_words': unknown, 'train_forms': train_forms(model.index, unknown),
            'shared_words': sorted(set(model.index.known(row['text'])) & set(tokenize(first['text'])))
            if first else [],
            'top3_labels': [item['label'] for item in ranking[:3]],
            'buttons': buttons(ranking),
        }
        case['segments'] = segments_of(case, model.index, annotations[row['query_id']])
        cases.append(case)
    return cases


def taxonomy_flags(case):
    """Типы ошибок для одного запроса.

    Первые три типа делят ошибки по словарю и не пересекаются: в запросе есть слово, которое в train
    встречается в другой форме; есть только новые слова; все слова известны. Остальные типы
    проходят поперёк этого деления, поэтому у каждого типа свой знаменатель.
    """
    if case['correct']:
        return []
    flags = []
    if case['train_forms']:
        flags.append('слово в другой форме')
    elif case['unknown_words']:
        flags.append('новое слово')
    else:
        flags.append('граница при известных словах')
    if case['prediction'] is None:
        flags.append('нет ответа')
    if case['prediction'] is not None and set(case['shared_words']) <= SERVICE_STOPWORDS:
        flags.append('ответ только по стоп-словам')
    if case['segments']['разметка ЛР 6'] != 'уверенная':
        flags.append('сложная разметка')
    if case['label'] == OTHER and case['navigation']:
        flags.append('посторонний запрос открыл раздел')
    return flags


def summarize(cases, labels):
    y_true = [case['label'] for case in cases]
    y_pred = [case['prediction'] for case in cases]
    classes = per_class(y_true, y_pred, labels)
    offtopic = [case for case in cases if case['label'] == OTHER]
    platform = [case for case in cases if case['label'] != OTHER]
    return {
        'queries': len(cases),
        'macro_f1': macro_f1(y_true, y_pred, labels),
        'accuracy': accuracy(y_true, y_pred),
        'wrong_navigation': wrong_navigation_rate(y_true, y_pred, NO_ACTION),
        'wrong_navigation_count': sum(case['navigation'] and not case['correct'] for case in cases),
        'no_answer': sum(case['prediction'] is None for case in cases),
        'zero_recall_intents': sum(row['recall'] == 0 for row in classes),
        'zero_recall_labels': [row['label'] for row in classes if row['recall'] == 0],
        'offtopic_navigation': sum(case['navigation'] for case in offtopic) / len(offtopic),
        'offtopic_navigation_count': sum(case['navigation'] for case in offtopic),
        'offtopic_queries': len(offtopic),
        'buttons_hit3': hit_at_k([case['label'] for case in platform], [case['buttons'] for case in platform]),
        'platform_queries': len(platform),
        # ошибочные переходы по запросам к разделам, где нужный раздел был бы среди трёх кнопок (R3)
        'wrong_navigation_platform': sum(case['navigation'] and not case['correct'] for case in platform),
        'wrong_navigation_right_button': sum(case['navigation'] and not case['correct']
                                             and case['label'] in case['buttons'] for case in platform),
        'role_only_wrong_answers': [case['query_id'] for case in cases
                                    if case['prediction'] in ROLE_ONLY and not case['correct']],
    }


def segment_table(cases):
    rows = []
    for dimension in cases[0]['segments']:
        for name in sorted({case['segments'][dimension] for case in cases}):
            part = [case for case in cases if case['segments'][dimension] == name]
            rows.append({
                'dimension': dimension, 'segment': name, 'queries': len(part),
                'correct': sum(case['correct'] for case in part),
                'accuracy': sum(case['correct'] for case in part) / len(part),
                'no_answer': sum(case['prediction'] is None for case in part),
                'wrong_navigation': sum(case['navigation'] and not case['correct'] for case in part),
            })
    return rows


def taxonomy_table(cases):
    errors = [case for case in cases if not case['correct']]
    answered_wrong = [case for case in errors if case['prediction'] is not None]
    hard = [case for case in cases if case['segments']['разметка ЛР 6'] != 'уверенная']
    denominators = {
        'слово в другой форме': ('ошибок', len(errors)),
        'новое слово': ('ошибок', len(errors)),
        'граница при известных словах': ('ошибок', len(errors)),
        'нет ответа': ('запросов validation', len(cases)),
        'ответ только по стоп-словам': ('неверных ответов', len(answered_wrong)),
        'сложная разметка': ('запросов со сложной разметкой', len(hard)),
        'посторонний запрос открыл раздел': ('посторонних запросов', sum(c['label'] == OTHER for c in cases)),
    }
    rows = []
    for flag, (what, denominator) in denominators.items():
        hit = [case for case in cases if flag in taxonomy_flags(case)]
        rows.append({'type': flag, 'source': 'validation', 'count': len(hit), 'denominator': denominator,
                     'of_what': what, 'query_ids': ' '.join(case['query_id'] for case in hit)})
    return rows


def special_tests(model, cases):
    rows = []
    for case in cases:
        if not case['correct']:
            continue
        typo = make_typo(case['text'])
        if typo is None:
            rows.append({'test': 'опечатка', 'query_id': case['query_id'], 'query': case['text'], 'variant': '',
                         'expected': case['label'], 'answer': '', 'result': 'нет слова от 5 букв'})
            continue
        answer = model.predict(typo)
        result = 'верно' if answer == case['label'] else 'нет ответа' if answer is None else 'неверно'
        rows.append({'test': 'опечатка', 'query_id': case['query_id'], 'query': case['text'], 'variant': typo,
                     'expected': case['label'], 'answer': answer or '', 'result': result})
    for query in LATIN_QUERIES:
        answer = model.predict(query)
        rows.append({'test': 'латиница', 'query_id': '', 'query': query, 'variant': '',
                     'expected': 'ответ по смыслу или явное «не понял»', 'answer': answer or '',
                     'result': 'нет ответа' if answer is None else 'есть ответ'})
    for name, value in INVALID_INPUTS:
        try:
            answer = model.predict(value)
            result = 'нет ответа' if answer is None else f'ответ {answer}'
        except TypeError as error:
            answer, result = '', f'TypeError: {error}'
        rows.append({'test': 'неверный ввод', 'query_id': '', 'query': name, 'variant': '',
                     'expected': 'нет ответа или явная ошибка', 'answer': answer or '', 'result': result})
    return rows


def write_csv(path, rows):
    with open(path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0]), lineterminator='\n')
        writer.writeheader()
        for row in rows:
            writer.writerow({k: f'{v:.4f}' if isinstance(v, float) else v for k, v in row.items()})


def analyze():
    rows = load_clean()
    annotations = load_annotations()
    train, validation = select(rows, 'train'), select(rows, 'validation')
    labels = sorted({row['label'] for row in rows})
    # полный список соседей нужен для трёх кнопок; ответ (первый сосед) тот же, что в ЛР 7
    model = NearestQueryBaseline(k=len(train)).fit(train)
    cases = build_cases(model, validation, annotations)
    summary = summarize(cases, labels)
    thresholds = [{'metric': name, 'value': summary[name], 'condition': f'{sign} {limit}',
                   'passed': summary[name] >= limit if sign == '>=' else summary[name] <= limit, 'source': source}
                  for name, sign, limit, source in ALPHA]
    matrix = confusion_matrix([c['label'] for c in cases], [c['prediction'] for c in cases], labels)
    segments, taxonomy, specials = segment_table(cases), taxonomy_table(cases), special_tests(model, cases)

    RESULTS.mkdir(parents=True, exist_ok=True)
    write_csv(RESULTS / 'thresholds.csv', thresholds)
    write_csv(RESULTS / 'segments.csv', segments)
    write_csv(RESULTS / 'error_taxonomy.csv', taxonomy)
    write_csv(RESULTS / 'special_tests.csv', specials)
    write_csv(RESULTS / 'confusion_matrix.csv',
              [{'верно \\ ответ': label, **dict(zip(labels + ['нет ответа'], counts))}
               for label, counts in zip(labels, matrix)])
    write_csv(RESULTS / 'validation_cases.csv', [{
        'query_id': c['query_id'], 'text': c['text'], 'label': c['label'], 'prediction': c['prediction'] or '',
        'correct': int(c['correct']), 'navigation': int(c['navigation']), 'buttons': ' '.join(c['buttons']),
        **c['segments'], 'error_types': '; '.join(taxonomy_flags(c))} for c in cases])
    with open(RESULTS / 'summary.json', 'w', encoding='utf-8', newline='\n') as f:
        json.dump({'data_version': DATA_VERSION, 'annotations_version': ANNOTATIONS_VERSION,
                   'summary': {k: round(v, 6) if isinstance(v, float) else v for k, v in summary.items()},
                   'thresholds': thresholds, 'segments': segments, 'taxonomy': taxonomy,
                   'special_tests': specials}, f, ensure_ascii=False, indent=2, default=float)
        f.write('\n')

    print(f"Validation {summary['queries']} запросов, данные {DATA_VERSION}, разметка {ANNOTATIONS_VERSION}")
    for row in thresholds:
        print(f"  {row['metric']:<22} {row['value']:.3f}  нужно {row['condition']:<8} "
              f"{'да' if row['passed'] else 'нет'}  ({row['source']})")
    print(f"  нужный раздел среди трёх кнопок: {summary['buttons_hit3']:.3f} "
          f"({summary['platform_queries']} запросов к разделам платформы); из "
          f"{summary['wrong_navigation_platform']} ошибочных переходов по ним нужная кнопка была бы в "
          f"{summary['wrong_navigation_right_button']}")
    print(f"  неверные ответы с разделом одной роли: {' '.join(summary['role_only_wrong_answers'])}")
    print('Сегменты:')
    for row in segments:
        print(f"  {row['dimension']}: {row['segment']} - {row['correct']} из {row['queries']}")
    print('Типы ошибок:')
    for row in taxonomy:
        print(f"  {row['type']}: {row['count']} из {row['denominator']} {row['of_what']}")
    by_test = {}
    for row in specials:
        by_test.setdefault(row['test'], []).append(row['result'])
    print('Специальные тесты:', {test: {r: results.count(r) for r in sorted(set(results))}
                                 for test, results in by_test.items()})
    print(f"Файлы: {', '.join(sorted(p.name for p in RESULTS.iterdir()))}")
