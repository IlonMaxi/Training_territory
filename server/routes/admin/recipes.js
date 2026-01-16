const express = require('express');

const Recipe = require('../../../models/Recipe');

const router = express.Router();

router.get('/admin/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.findAll();
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/recipes', async (req, res) => {
  try {
    const newRecipe = await Recipe.create(req.body);
    res.status(201).json(newRecipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/admin/recipes/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Рецепт не найден' });

    await recipe.update(req.body);
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/admin/recipes/:id', async (req, res) => {
  try {
    const deleted = await Recipe.destroy({ where: { recipeid: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Рецепт не найден' });

    res.json({ message: 'Рецепт удалён' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
