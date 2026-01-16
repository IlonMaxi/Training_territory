const express = require('express');

const router = express.Router();

router.use(require('./admin/access'));
router.use(require('./admin/weightsOnMachines'));
router.use(require('./admin/clients'));
router.use(require('./admin/payments'));
router.use(require('./admin/coaches'));
router.use(require('./admin/nutrition'));
router.use(require('./admin/recipes'));
router.use(require('./admin/schedule'));
router.use(require('./admin/workouts'));
router.use(require('./admin/exercises'));
router.use(require('./admin/measurements'));
router.use(require('./admin/progress'));

module.exports = router;
