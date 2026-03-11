const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  startResponse, saveAnswers, submitResponse, getResponses, deleteResponse
} = require('../controllers/response.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');

router.post('/:surveyId/responses/start', optionalAuth, startResponse);
router.patch('/:surveyId/responses/:responseId/answers', saveAnswers);
router.post('/:surveyId/responses/:responseId/submit', submitResponse);
router.get('/:surveyId/responses', protect, getResponses);
router.delete('/:surveyId/responses/:responseId', protect, deleteResponse);

module.exports = router;
