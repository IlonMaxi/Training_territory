"""Проверки baseline: python -m unittest navigator_lab.tests -v (из папки ml_service)."""
import unittest

from .baseline import MajorityBaseline, NearestQueryBaseline, TfidfIndex, tokenize
from .data import DATA_VERSION, data_hash, load_clean, select
from .metrics import accuracy, bootstrap_ci, macro_f1


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


if __name__ == '__main__':
    unittest.main()
