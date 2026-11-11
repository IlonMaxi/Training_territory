"""Проверки baseline: python -m unittest navigator_lab.tests -v (из папки ml_service)."""
import ast
import unittest
from pathlib import Path

from .analysis import NO_ACTION, SERVICE_STOPWORDS, buttons, make_typo
from .baseline import MajorityBaseline, NearestQueryBaseline, TfidfIndex, tokenize
from .data import ANNOTATIONS_VERSION, DATA_VERSION, data_hash, load_annotations, load_clean, select
from .metrics import (accuracy, bootstrap_ci, confusion_matrix, hit_at_k, macro_f1, per_class,
                      wrong_navigation_rate)


class BaselineTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.rows = load_clean()
        cls.train = select(cls.rows, 'train')
        cls.validation = select(cls.rows, 'validation')
        cls.model = NearestQueryBaseline().fit(cls.train)

    def test_data_version_and_split(self):
        self.assertEqual(data_hash(), DATA_VERSION)
        sizes = [len(select(self.rows, split)) for split in ('train', 'validation', 'test')]
        self.assertEqual(sizes, [193, 63, 58])

    def test_vocabulary_comes_from_train_only(self):
        train_words = {word for row in self.train for word in tokenize(row['text'])}
        self.assertEqual(set(self.model.index.idf), train_words)
        # слова, которые встречаются только в validation, модель считает неизвестными
        only_validation = {word for row in self.validation for word in tokenize(row['text'])} - train_words
        self.assertTrue(only_validation)
        self.assertEqual(set(self.model.index.unknown(' '.join(sorted(only_validation)))), only_validation)

    def test_empty_query_gives_no_answer(self):
        for text in ['', '   ', '?!...']:
            self.assertEqual(self.model.neighbors(text), [])
            self.assertIsNone(self.model.predict(text))

    def test_unknown_words_give_no_answer(self):
        self.assertIsNone(self.model.predict('абракадабра'))
        self.assertIn('абракадабра', self.model.index.unknown('мои абракадабра'))

    def test_case_and_yo_do_not_matter(self):
        self.assertEqual(tokenize('Моё ПИТАНИЕ!'), ['мое', 'питание'])

    def test_ties_are_broken_by_id(self):
        rows = [{'query_id': 'Q002', 'label': 'b', 'text': 'мои тренировки'},
                {'query_id': 'Q001', 'label': 'a', 'text': 'мои тренировки'}]
        model = NearestQueryBaseline().fit(rows)
        self.assertEqual([n['query_id'] for n in model.neighbors('тренировки')], ['Q001', 'Q002'])
        self.assertEqual(model.predict('тренировки'), 'a')

    def test_prediction_is_repeatable(self):
        first = [self.model.predict(row['text']) for row in self.validation]
        second_model = NearestQueryBaseline().fit(list(reversed(self.train)))
        second = [second_model.predict(row['text']) for row in self.validation]
        self.assertEqual(first, second)

    def test_majority_class(self):
        self.assertEqual(MajorityBaseline().fit(self.train).label, 'workout')

    def test_metrics_on_small_example(self):
        y_true = ['a', 'a', 'b', 'b']
        y_pred = ['a', None, 'b', 'a']
        # a: precision 1/2, recall 1/2; b: precision 1, recall 1/2
        self.assertAlmostEqual(macro_f1(y_true, y_pred, ['a', 'b']), (0.5 + 2 / 3) / 2)
        self.assertEqual(accuracy(y_true, y_pred), 0.5)
        low, high = bootstrap_ci(y_true, y_pred, accuracy, samples=200, seed=1)
        self.assertLessEqual(low, high)


class SklearnCrossCheck(unittest.TestCase):
    """Сверка с scikit-learn, если он установлен: формула TF-IDF и macro-F1 должны совпасть."""

    @classmethod
    def setUpClass(cls):
        try:
            import sklearn  # noqa: F401
        except ImportError:
            raise unittest.SkipTest('scikit-learn не установлен')
        rows = load_clean()
        cls.train, cls.validation = select(rows, 'train'), select(rows, 'validation')
        cls.labels = sorted({row['label'] for row in rows})

    def test_tfidf_matches_sklearn(self):
        from sklearn.feature_extraction.text import TfidfVectorizer
        texts = [row['text'] for row in self.train]
        reference = TfidfVectorizer(tokenizer=tokenize, token_pattern=None, lowercase=False).fit(texts)
        index = TfidfIndex().fit(texts)
        names = reference.get_feature_names_out()
        self.assertEqual(set(names), set(index.idf))
        for name, idf in zip(names, reference.idf_):
            self.assertAlmostEqual(index.idf[name], idf, places=12)
        queries = [row['text'] for row in self.validation]
        for text, vector in zip(queries, reference.transform(queries)):
            expected = {names[j]: value for j, value in zip(vector.indices, vector.data)}
            mine = index.vector(text)
            self.assertEqual(set(mine), set(expected))
            for word, value in expected.items():
                self.assertAlmostEqual(mine[word], value, places=12)

    def test_macro_f1_matches_sklearn(self):
        from sklearn.metrics import f1_score
        model = NearestQueryBaseline().fit(self.train)
        y_true = [row['label'] for row in self.validation]
        y_pred = [model.predict(row['text']) for row in self.validation]
        reference = f1_score(y_true, [p or 'нет ответа' for p in y_pred], labels=self.labels,
                             average='macro', zero_division=0)
        self.assertAlmostEqual(macro_f1(y_true, y_pred, self.labels), reference, places=12)


class ManualCalculationTests(unittest.TestCase):
    """ЛР 8: расчёты из lab08/manual_calculation.md, сделанные вручную, сверяются с кодом."""

    @classmethod
    def setUpClass(cls):
        rows = load_clean()
        cls.labels = sorted({row['label'] for row in rows})
        validation = select(rows, 'validation')
        model = NearestQueryBaseline().fit(select(rows, 'train'))
        cls.y_true = [row['label'] for row in validation]
        cls.y_pred = [model.predict(row['text']) for row in validation]

    def test_feedback_f1_by_hand(self):
        # 5 запросов feedback, 3 ответа feedback, все верные: precision 3/3, recall 3/5, F1 = 2 * 0.6 / 1.6
        row = next(r for r in per_class(self.y_true, self.y_pred, self.labels) if r['label'] == 'feedback')
        self.assertEqual((row['support'], row['predicted'], row['correct']), (5, 3, 3))
        self.assertAlmostEqual(row['f1'], 0.75)

    def test_workout_f1_by_hand(self):
        # 9 запросов workout, 14 ответов workout, верных 9: precision 9/14, recall 1, F1 = 18/23
        row = next(r for r in per_class(self.y_true, self.y_pred, self.labels) if r['label'] == 'workout')
        self.assertEqual((row['support'], row['predicted'], row['correct']), (9, 14, 9))
        self.assertAlmostEqual(row['f1'], 18 / 23)

    def test_small_example_by_hand(self):
        y_true, y_pred, labels = ['a', 'a', 'b', 'c'], ['a', 'b', 'b', None], ['a', 'b', 'c']
        # a: precision 1/1, recall 1/2, F1 2/3; b: precision 1/2, recall 1, F1 2/3; c: F1 0
        self.assertAlmostEqual(macro_f1(y_true, y_pred, labels), 4 / 9)
        self.assertEqual(accuracy(y_true, y_pred), 0.5)
        self.assertEqual(wrong_navigation_rate(y_true, y_pred), 0.25)

    def test_wrong_answer_costs_more_than_no_answer(self):
        y_true, labels = ['a', 'a', 'b', 'c'], ['a', 'b', 'c']
        silent = ['a', 'a', 'b', None]  # (1 + 1 + 0) / 3
        wrong = ['a', 'a', 'b', 'a']    # a: precision 2/3, recall 1, F1 0.8 -> (0.8 + 1 + 0) / 3
        self.assertEqual(accuracy(y_true, silent), accuracy(y_true, wrong))
        self.assertAlmostEqual(macro_f1(y_true, silent, labels), 2 / 3)
        self.assertAlmostEqual(macro_f1(y_true, wrong, labels), 0.6)
        self.assertEqual(wrong_navigation_rate(y_true, silent), 0)
        self.assertEqual(wrong_navigation_rate(y_true, wrong), 0.25)

    def test_perfect_and_empty_answers(self):
        labels = ['a', 'b', 'c']
        self.assertEqual(macro_f1(labels, labels, labels), 1.0)
        self.assertEqual(macro_f1(labels, [None] * 3, labels), 0.0)
        self.assertEqual(wrong_navigation_rate(labels, [None] * 3), 0.0)

    def test_other_is_not_a_navigation(self):
        # ответ «прочее» ничего не открывает; переход по постороннему запросу - ошибочный
        self.assertEqual(wrong_navigation_rate(['a', 'other'], ['other', 'a'], NO_ACTION), 0.5)

    def test_confusion_matrix_agrees_with_metrics(self):
        matrix = confusion_matrix(self.y_true, self.y_pred, self.labels)
        self.assertEqual([sum(row) for row in matrix], [self.y_true.count(label) for label in self.labels])
        self.assertEqual(sum(matrix[i][i] for i in range(len(self.labels))), 29)
        self.assertEqual(sum(row[-1] for row in matrix), 8)

    def test_buttons_by_hand(self):
        ranking = [{'label': 'chat'}, {'label': 'chat'}, {'label': 'other'}, {'label': 'feedback'},
                   {'label': 'trainer'}, {'label': 'support'}]
        self.assertEqual(buttons(ranking), ['chat', 'feedback', 'trainer'])
        self.assertEqual(hit_at_k(['feedback', 'support'], [['chat', 'feedback', 'trainer']] * 2), 0.5)


class SpecialTests(unittest.TestCase):
    """ЛР 8: специальные тесты вне validation, их ошибки не меняют знаменатель основных метрик."""

    @classmethod
    def setUpClass(cls):
        cls.model = NearestQueryBaseline().fit(select(load_clean(), 'train'))

    def test_invalid_input_is_rejected_explicitly(self):
        for value in (None, 42, ['мои', 'тренировки']):
            with self.assertRaises(TypeError):
                self.model.predict(value)

    def test_latin_queries(self):
        for query in ('my schedule', 'settings', 'trainer chat'):
            self.assertIsNone(self.model.predict(query))
        self.assertEqual(self.model.predict('help'), 'support')  # «help» есть в train

    def test_typo_breaks_exact_word(self):
        self.assertEqual(self.model.predict('настройки профиля'), 'settings')
        self.assertEqual(make_typo('настройки профиля'), 'насртойки профиля')
        self.assertIsNone(self.model.predict('насртойки профиля'))

    def test_annotations_match_clean(self):
        self.assertEqual(data_hash(Path(__file__).resolve().parent / 'data' / 'annotations_v2.csv'),
                         ANNOTATIONS_VERSION)
        annotations = load_annotations()
        for row in load_clean():
            self.assertEqual(annotations[row['query_id']]['label_final'], row['label'])

    def test_stopwords_match_service(self):
        main = Path(__file__).resolve().parents[1] / 'main.py'
        if not main.exists():
            self.skipTest('ml_service/main.py не найден')
        tree = ast.parse(main.read_text(encoding='utf-8-sig'))  # main.py сохранён с BOM
        stopwords = next(ast.literal_eval(node.value) for node in ast.walk(tree) if isinstance(node, ast.Assign)
                         and any(getattr(t, 'id', None) == 'STOPWORDS' for t in node.targets))
        self.assertEqual(SERVICE_STOPWORDS, stopwords)


if __name__ == '__main__':
    unittest.main()
