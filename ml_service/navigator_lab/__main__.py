"""Команды baseline навигатора (запускать из папки ml_service).

python -m navigator_lab run                      - проверка данных, обучение на train, оценка на validation
python -m navigator_lab predict --query "текст"  - ближайшие запросы train и намерение, метрики не пересчитываются
"""
import argparse
import csv
import hashlib
import json
import platform
import sys
from pathlib import Path

from .baseline import SCORE_DIGITS, MajorityBaseline, NearestQueryBaseline, tokenize
from .data import DATA_PATH, DATA_VERSION, SOURCE_COMMIT, load_clean, select
from .metrics import accuracy, bootstrap_ci, macro_f1, per_class

RESULTS = Path(__file__).resolve().parent / 'results'
NEIGHBORS = 3
BOOTSTRAP_SAMPLES, BOOTSTRAP_SEED = 1000, 42

SETTINGS = {
    'данные': f'{DATA_PATH.name}, версия {DATA_VERSION}, источник intent_data.json коммита {SOURCE_COMMIT[:7]}',
    'обучение': 'train: словарь и IDF',
    'оценка': 'validation',
    'признак': 'текст запроса',
    'токены': 'нижний регистр, ё -> е, слова [a-zа-я0-9]+',
    'вес слова': 'число повторов * (ln((1 + N) / (1 + df)) + 1), N и df по train, L2-нормирование',
    'решение': 'намерение ближайшего запроса train по косинусному сходству',
    'неизвестные слова': 'игнорируются',
    'нулевой вектор': 'нет ответа, считается ошибкой',
    'одинаковые оценки': f'округление до {SCORE_DIGITS} знаков, затем по возрастанию query_id',
    'сохраняемые соседи': NEIGHBORS,
    'интервал': f'бутстреп внутри намерений, {BOOTSTRAP_SAMPLES} выборок, seed {BOOTSTRAP_SEED}',
}
PARAMS_HASH = hashlib.sha256(
    json.dumps(SETTINGS, ensure_ascii=False, sort_keys=True).encode('utf-8')).hexdigest()[:16]


def write_csv(path, header, rows):
    with open(path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f, lineterminator='\n')
        writer.writerow(header)
        writer.writerows(rows)


def write_json(path, data):
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write('\n')


def file_sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()[:16]


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


def summarize(name, y_true, y_pred, labels):
    def macro(t, p):
        return macro_f1(t, p, labels)

    acc_low, acc_high = bootstrap_ci(y_true, y_pred, accuracy, BOOTSTRAP_SAMPLES, BOOTSTRAP_SEED)
    f1_low, f1_high = bootstrap_ci(y_true, y_pred, macro, BOOTSTRAP_SAMPLES, BOOTSTRAP_SEED)
    return {'model': name, 'queries': len(y_true), 'correct': sum(t == p for t, p in zip(y_true, y_pred)),
            'no_answer': sum(p is None for p in y_pred),
            'accuracy': accuracy(y_true, y_pred), 'accuracy_ci_low': acc_low, 'accuracy_ci_high': acc_high,
            'macro_f1': macro(y_true, y_pred), 'macro_f1_ci_low': f1_low, 'macro_f1_ci_high': f1_high}


def run():
    rows = load_clean()
    train, validation = select(rows, 'train'), select(rows, 'validation')
    labels = sorted({row['label'] for row in rows})
    y_true = [row['label'] for row in validation]

    model = NearestQueryBaseline(k=NEIGHBORS).fit(train)
    cases = []
    for row in validation:
        top = model.neighbors(row['text'])
        first = top[0] if top else None
        prediction = first['label'] if first else None
        unknown = model.index.unknown(row['text'])
        cases.append({
            'query_id': row['query_id'], 'text': row['text'], 'label': row['label'],
            'prediction': prediction, 'correct': prediction == row['label'],
            'error_type': error_type(prediction, row['label'], unknown),
            'unknown_words': unknown, 'train_forms': train_forms(model.index, unknown),
            'shared_words': sorted(set(model.index.known(row['text'])) & set(tokenize(first['text'])))
            if first else [],
            'neighbors': top,
        })
    y_pred = [case['prediction'] for case in cases]

    majority = MajorityBaseline().fit(train)
    y_majority = [majority.predict(row['text']) for row in validation]
    metrics = [summarize(model.name, y_true, y_pred, labels),
               summarize(f'{majority.name}_{majority.label}', y_true, y_majority, labels)]
    classes = per_class(y_true, y_pred, labels)

    RESULTS.mkdir(exist_ok=True)
    columns = list(metrics[0])
    write_csv(RESULTS / 'validation_metrics.csv', columns,
              [[m[c] if isinstance(m[c], (str, int)) else f'{m[c]:.4f}' for c in columns] for m in metrics])
    write_csv(RESULTS / 'validation_per_class.csv',
              ['label', 'support', 'predicted', 'correct', 'precision', 'recall', 'f1'],
              [[c['label'], c['support'], c['predicted'], c['correct'],
                f"{c['precision']:.4f}", f"{c['recall']:.4f}", f"{c['f1']:.4f}"] for c in classes])
    write_csv(RESULTS / 'validation_baseline.csv',
              ['query_id', 'text', 'label', 'prediction', 'correct', 'error_type', 'score', 'neighbor_id',
               'neighbor_text', 'shared_words', 'unknown_words', 'train_forms', 'top3'],
              [[c['query_id'], c['text'], c['label'], c['prediction'] or '', int(c['correct']), c['error_type'],
                f"{c['neighbors'][0]['score']:.4f}" if c['neighbors'] else '',
                c['neighbors'][0]['query_id'] if c['neighbors'] else '',
                c['neighbors'][0]['text'] if c['neighbors'] else '',
                ' '.join(c['shared_words']), ' '.join(c['unknown_words']), '; '.join(c['train_forms']),
                '; '.join(f"{n['query_id']} {n['label']} {n['score']:.4f}" for n in c['neighbors'])]
               for c in cases])
    write_json(RESULTS / 'validation_baseline_detail.json', {
        'settings': SETTINGS, 'params_hash': PARAMS_HASH, 'data_version': DATA_VERSION,
        'split_sizes': {split: len(select(rows, split)) for split in ('train', 'validation', 'test')},
        'labels': labels,
        'metrics': [{k: round(v, 6) if isinstance(v, float) else v for k, v in m.items()} for m in metrics],
        'per_class': [{k: round(v, 6) if isinstance(v, float) else v for k, v in c.items()} for c in classes],
        'cases': cases,
    })
    write_json(RESULTS / 'environment.json', {
        'python': platform.python_version(), 'implementation': platform.python_implementation(),
        'platform': platform.platform(), 'dependencies': 'только стандартная библиотека Python',
        'command': 'python -m navigator_lab run', 'params_hash': PARAMS_HASH,
    })

    base, floor = metrics
    print(f'Данные: {DATA_PATH.name}, версия {DATA_VERSION}, train {len(train)}, validation {len(validation)}')
    print(f'Параметры: хеш {PARAMS_HASH}')
    print(f"Baseline, ближайший запрос по TF-IDF: macro-F1 {base['macro_f1']:.3f} "
          f"(95% ДИ {base['macro_f1_ci_low']:.3f}-{base['macro_f1_ci_high']:.3f}), "
          f"accuracy {base['accuracy']:.3f}, верно {base['correct']} из {base['queries']}, "
          f"без ответа {base['no_answer']}")
    print(f"Самый частый класс ({majority.label}): macro-F1 {floor['macro_f1']:.3f}, accuracy {floor['accuracy']:.3f}")
    for path in sorted(RESULTS.iterdir()):
        print(f'  {path.relative_to(RESULTS.parent).as_posix()}  sha256 {file_sha(path)}')


def predict(queries):
    model = NearestQueryBaseline(k=NEIGHBORS).fit(select(load_clean(), 'train'))
    for text in queries:
        top = model.neighbors(text)
        unknown = model.index.unknown(text)
        print(f'Запрос: {text}')
        print(f"  нет в словаре train: {', '.join(unknown) if unknown else '-'}")
        if not top:
            print('  совпадений со словарём train нет')
        for i, item in enumerate(top, 1):
            print(f"  {i}. {item['query_id']} {item['label']:<12} {item['score']:.3f}  {item['text']}")
        print(f"  намерение: {top[0]['label'] if top else 'нет ответа'}")


def main(argv=None):
    parser = argparse.ArgumentParser(prog='python -m navigator_lab', description='Baseline навигатора, ЛР 7')
    commands = parser.add_subparsers(dest='command', required=True)
    commands.add_parser('run', help='оценить baseline на validation и записать файлы в results')
    ask = commands.add_parser('predict', help='ответ baseline на свои запросы')
    ask.add_argument('--query', action='append', required=True, help='текст запроса, можно указать несколько раз')
    args = parser.parse_args(argv)
    if args.command == 'run':
        run()
    else:
        predict(args.query)


if __name__ == '__main__':
    sys.exit(main())
