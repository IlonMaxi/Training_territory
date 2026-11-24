"""ЛР 9: сравнение слов и символьных n-грамм на validation."""
import hashlib
import json
import platform
from pathlib import Path

from ..analysis import (
    ALPHA, NO_ACTION, build_cases, buttons, make_typo, segment_table, summarize,
    taxonomy_flags, write_csv,
)
from ..baseline import SCORE_DIGITS, NearestQueryBaseline, tokenize
from ..data import ANNOTATIONS_VERSION, DATA_VERSION, load_annotations, load_clean, select
from ..metrics import per_class

RESULTS = Path(__file__).resolve().parents[1] / 'results' / 'lab09'
NGRAM_MIN, NGRAM_MAX = 3, 5


def char_ngrams(text):
    features = []
    for word in tokenize(text):
        padded = f' {word} '
        for size in range(NGRAM_MIN, min(NGRAM_MAX, len(padded)) + 1):
            features.extend(padded[start:start + size] for start in range(len(padded) - size + 1))
    return features


def idf_sha256(model):
    canonical = json.dumps(model.index.idf, sort_keys=True, ensure_ascii=False, separators=(',', ':'))
    return hashlib.sha256(canonical.encode('utf-8')).hexdigest()


def record_prediction(ranking, label):
    first = ranking[0] if ranking else None
    prediction = first['label'] if first else None
    return {
        'prediction': prediction,
        'correct': prediction == label,
        'navigation': prediction not in NO_ACTION,
        'buttons': buttons(ranking),
        'first_neighbor': first,
    }


def compare_typos(cases, baseline, candidate):
    comparisons = []
    for case in cases:
        if not case['correct']:
            continue
        typo = make_typo(case['text'])
        if typo is None:
            continue
        expected = case['label']
        base_answer, candidate_answer = baseline.predict(typo), candidate.predict(typo)
        comparisons.append({
            'query_id': case['query_id'], 'text': case['text'], 'variant': typo, 'label': expected,
            'baseline': base_answer, 'candidate': candidate_answer,
            'baseline_correct': base_answer == expected, 'candidate_correct': candidate_answer == expected,
        })
    return comparisons


def append_segment(cases, baseline_cases):
    for case, base in zip(cases, baseline_cases):
        # Первый тип taxonomy_flags фиксирует класс ошибки по словарю baseline.
        flags = taxonomy_flags(base)
        case['segments'] = {**base['segments'], 'ошибка baseline': flags[0] if flags else 'верный ответ'}


def main():
    rows = load_clean()
    train, validation = select(rows, 'train'), select(rows, 'validation')
    annotations = load_annotations()
    labels = sorted({row['label'] for row in train})
    # Полный список нужен для трёх разных кнопок. Решение по первому соседу прежнее.
    baseline = NearestQueryBaseline(k=len(train)).fit(train)
    candidate = NearestQueryBaseline(k=len(train), analyzer=char_ngrams).fit(train)
    baseline_cases = build_cases(baseline, validation, annotations)
    candidate_cases = []
    paired = []
    for row, base in zip(validation, baseline_cases):
        base_prediction = record_prediction(baseline.neighbors(row['text']), row['label'])
        new_prediction = record_prediction(candidate.neighbors(row['text']), row['label'])
        candidate_cases.append({**base, **new_prediction})
        flags = taxonomy_flags(base)
        pair = {'query_id': row['query_id'], 'text': row['text'], 'label': row['label'],
                'baseline_error': flags[0] if flags else ''}
        for name, case in [('baseline', base_prediction), ('candidate', new_prediction)]:
            first = case['first_neighbor'] or {}
            pair.update({
                f'{name}_prediction': case['prediction'], f'{name}_correct': case['correct'],
                f'{name}_buttons': ' '.join(case['buttons']), f'{name}_neighbor_id': first.get('query_id'),
                f'{name}_neighbor_text': first.get('text'), f'{name}_score': first.get('score'),
            })
        paired.append(pair)

    append_segment(baseline_cases, baseline_cases)
    append_segment(candidate_cases, baseline_cases)
    typos = compare_typos(baseline_cases, baseline, candidate)
    base_summary = summarize(baseline_cases, labels)
    new_summary = summarize(candidate_cases, labels)
    forms = [row for row in paired if row['baseline_error'] == 'слово в другой форме']
    forms_fixed = sum(row['candidate_correct'] for row in forms)
    typo_base = sum(row['baseline_correct'] for row in typos)
    typo_new = sum(row['candidate_correct'] for row in typos)
    delta = new_summary['macro_f1'] - base_summary['macro_f1']
    checks = [
        {'metric': 'macro_f1_gain', 'value': delta, 'rule': '>= 0.10', 'passed': delta >= 0.10},
        {'metric': 'word_forms_fixed', 'value': forms_fixed, 'rule': '>= 5 из 10', 'passed': forms_fixed >= 5},
        {'metric': 'typos_correct', 'value': typo_new, 'rule': '> 20 из 29', 'passed': typo_new > 20},
        {'metric': 'wrong_navigation_count', 'value': new_summary['wrong_navigation_count'],
         'rule': '<= 23 из 63', 'passed': new_summary['wrong_navigation_count'] <= 23},
        {'metric': 'zero_recall_intents', 'value': new_summary['zero_recall_intents'],
         'rule': '<= 3', 'passed': new_summary['zero_recall_intents'] <= 3},
        {'metric': 'offtopic_navigation_count', 'value': new_summary['offtopic_navigation_count'],
         'rule': '<= 2 из 8', 'passed': new_summary['offtopic_navigation_count'] <= 2},
    ]
    totals = {
        'experiment': 'E01', 'hypothesis': 'H1',
        'config': {
            'data_version': DATA_VERSION, 'annotations_version': ANNOTATIONS_VERSION,
            'split_seed': 1, 'training_split': 'train', 'selection_split': 'validation', 'train_size': len(train),
            'validation_size': len(validation), 'training_randomness': False, 'score_digits': SCORE_DIGITS,
            'exposed_buttons': 3,
            'baseline': {'analyzer': 'word', 'idf_entries': len(baseline.index.idf),
                         'idf_sha256': idf_sha256(baseline)},
            'candidate': {'analyzer': 'char_wb', 'ngram_range': [NGRAM_MIN, NGRAM_MAX],
                          'idf_entries': len(candidate.index.idf), 'idf_sha256': idf_sha256(candidate)},
        },
        'environment': {
            'python': platform.python_version(), 'implementation': platform.python_implementation(),
            'system': platform.system(), 'dependencies': 'stdlib',
            'command': 'python -m navigator_lab.lab09',
        },
        'validation': {'baseline': base_summary, 'candidate': new_summary},
        'word_forms': {'cases': len(forms), 'fixed': forms_fixed},
        'typos': {'cases': len(typos), 'baseline_correct': typo_base, 'candidate_correct': typo_new},
        'h1_checks': checks,
        'h1_passed': all(check['passed'] for check in checks),
        'alpha_thresholds': [
            {'metric': metric, 'condition': sign, 'limit': limit,
             **{name: (summary[metric] >= limit if sign == '>=' else summary[metric] <= limit)
                for name, summary in [('baseline', base_summary), ('candidate', new_summary)]}}
            for metric, sign, limit, _ in ALPHA
        ],
    }

    RESULTS.mkdir(parents=True, exist_ok=True)
    write_csv(RESULTS / 'validation_cases.csv', paired)
    write_csv(RESULTS / 'typos.csv', typos)
    segments = []
    classes = []
    for model, cases in [('baseline', baseline_cases), ('candidate', candidate_cases)]:
        segments.extend({'model': model, **row} for row in segment_table(cases))
        y_true, y_pred = [case['label'] for case in cases], [case['prediction'] for case in cases]
        classes.extend({'model': model, **row} for row in per_class(y_true, y_pred, labels))
    write_csv(RESULTS / 'segments.csv', segments)
    write_csv(RESULTS / 'per_class.csv', classes)
    (RESULTS / 'summary.json').write_text(json.dumps(totals, ensure_ascii=False, indent=2) + '\n',
                                         encoding='utf-8', newline='\n')
    print(f"E01: macro-F1 {base_summary['macro_f1']:.3f} -> {new_summary['macro_f1']:.3f} ({delta:+.3f})")
    for check in checks:
        outcome = 'да' if check['passed'] else 'нет'
        print(f"  {check['metric']}: {check['value']:.4g}, нужно {check['rule']} — {outcome}")
    print(f"Гипотеза H1: {'подтверждена' if totals['h1_passed'] else 'не подтверждена'}")


if __name__ == '__main__':
    main()
