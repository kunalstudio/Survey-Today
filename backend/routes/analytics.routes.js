const express = require('express');
const router = express.Router({ mergeParams: true });
const { getSummary, getQuestionAnalytics, exportCSV } = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/:surveyId/analytics/summary', protect, getSummary);
router.get('/:surveyId/analytics/questions', protect, getQuestionAnalytics);
router.get('/:surveyId/analytics/export', protect, exportCSV);

module.exports = router;
