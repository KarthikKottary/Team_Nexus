const express = require('express');
const { scheduleMeal, getMeals } = require('../controllers/mealController');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.use(protect);

router.route('/')
  .get(getMeals)
  .post(authorize('admin'), scheduleMeal);

module.exports = router;
