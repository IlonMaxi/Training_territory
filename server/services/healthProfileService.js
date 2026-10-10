/*
  Профиль здоровья клиента: травмы и аллергии.

  Травма закрывает группы мышц по правилам из таблицы limitation_rules,
  аллергия — блюда, в составе которых есть указанный продукт.
*/
const { Op } = require('sequelize');

const ClientLimitation = require('../../models/ClientLimitation');
const LimitationRule = require('../../models/LimitationRule');

const INJURY = 'injury';
const ALLERGY = 'allergy';

const getLimitations = (clientId) => ClientLimitation.findAll({
  where: { client_id: clientId, is_active: true },
  order: [['limitationid', 'ASC']]
});

const normalize = (text) => String(text || '').toLowerCase().replace(/ё/g, 'е').trim();

/*
  Клиент пишет «болит колено» или «правое колено», а в правилах записано
  «колено». Ищем правило, чьё название входит в текст ограничения или
  наоборот — так «колени» и «колено» находят одно и то же правило.
*/
const matchesArea = (value, area) => {
  const a = normalize(area);
  const v = normalize(value);
  if (!a || !v) return false;
  return v.includes(a) || a.includes(v);
};

/**
 * Группы мышц, которые нельзя нагружать этому клиенту,
 * и травмы, из-за которых они закрыты.
 */
const getBlockedMuscles = async (clientId) => {
  const limitations = await getLimitations(clientId);
  const injuries = limitations.filter(item => item.kind === INJURY);

  if (!injuries.length) {
    return { blocked: [], injuries: [], allergies: limitations.filter(i => i.kind === ALLERGY) };
  }

  const rules = await LimitationRule.findAll();
  const blocked = new Set();
  const applied = [];

  for (const injury of injuries) {
    const groups = rules
      .filter(rule => matchesArea(injury.value, rule.area))
      .map(rule => rule.muscle_group);

    if (groups.length) {
      groups.forEach(group => blocked.add(group));
      applied.push({ value: injury.value, groups });
    }
  }

  return {
    blocked: [...blocked],
    injuries: applied,
    allergies: limitations.filter(item => item.kind === ALLERGY)
  };
};

const words = (text) => normalize(text).split(/[^a-zа-я0-9]+/).filter(Boolean);

/*
  Сравнение по началу слова. Поиск подстроки не годился: аллергия «курица»
  не находила «Куриное филе» — у слов общий только корень «кури».
  Четырёх букв достаточно, чтобы «орехи» поймали «ореховая паста»,
  и мало для ложных срабатываний на коротких словах.
*/
const sameRoot = (a, b) => {
  const len = Math.min(4, a.length, b.length);
  if (len < 4) return a === b;
  return a.slice(0, len) === b.slice(0, len);
};

/**
 * Подходит ли рецепт клиенту с учётом аллергий.
 * Состав в рецептах — свободный текст через запятую.
 */
const recipeAllowed = (recipe, allergies) => {
  if (!allergies.length) return true;

  const haystack = words(`${recipe.name} ${recipe.ingredients || ''}`);

  return !allergies.some(item =>
    words(item.value).some(allergen =>
      haystack.some(target => sameRoot(allergen, target))
    )
  );
};

const filterRecipes = (recipes, allergies) =>
  recipes.filter(recipe => recipeAllowed(recipe, allergies));

module.exports = {
  INJURY,
  ALLERGY,
  getLimitations,
  getBlockedMuscles,
  recipeAllowed,
  filterRecipes
};
