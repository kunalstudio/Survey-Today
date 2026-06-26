const express = require('express');
const router = express.Router({ mergeParams: true });
const { getSummary, getQuestionAnalytics, exportCSV, exportJSON } = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/:surveyId/analytics/summary', protect, getSummary);
router.get('/:surveyId/analytics/questions', protect, getQuestionAnalytics);
router.get('/:surveyId/analytics/export', protect, exportCSV);
router.get('/:surveyId/analytics/export-json', protect, exportJSON);

module.exports = router;
