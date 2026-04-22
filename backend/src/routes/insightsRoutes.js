const express = require('express');
const { getSummary, getTrends, getCategories } = require('../controllers/insightsController');
const router = express.Router();

// All public — no auth required
router.get('/summary', getSummary);
router.get('/trends', getTrends);
router.get('/categories', getCategories);

module.exports = router;
