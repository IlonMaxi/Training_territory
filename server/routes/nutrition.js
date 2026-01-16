const express = require('express');
const { Sequelize } = require('sequelize');
const sequelize = require('../../config/database');

const Nutrition = require('../../models/Nutrition');

const router = express.Router();

router.get('/nutrition', async (req, res) => {
  try {
    const nutrition = await Nutrition.findAll();
    res.json(nutrition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/nutrition', async (req, res) => {
  try {
    const food = await Nutrition.create(req.body);
    res.status(201).json(food);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/nutrition/client/:clientId', async (req, res) => {
  const { clientId } = req.params;

  try {
    const nutritionData = await sequelize.query(`
  SELECT 
    f.foodid AS foodId, 
    f.name AS food_name,
    f.protein_amount AS proteins, 
    f.fat_amount AS fats, 
    f.carbohydrate_amount AS carbohydrates,
    f.calories AS calories,
    f.weight AS weight, -- ? вот это добавь!
    f.date AS food_date,
    f.meal_type AS meal_type,
    r.recipeid AS recipeId,
    r.name AS recipe_name,
    r.ingredients AS ingredients,
    r.preparation_time AS preparation_time,
    r.instructions AS instructions
  FROM 
    nutrition AS f
  LEFT JOIN 
    recipes AS r ON f.recipe_id = r.recipeid
  WHERE 
    f.client_id = :clientId
`, {
      replacements: { clientId },
      type: Sequelize.QueryTypes.SELECT
    });

    if (!nutritionData.length) {
      return res.status(404).json({ error: 'Данные о питании не найдены для этого клиента.' });
    }

    res.json(nutritionData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
