const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router({ mergeParams: true });
const {
  startResponse, saveAnswers, submitResponse, abandonResponse,
  getResponses, deleteResponse,
} = require('../controllers/response.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');

// ─── Rate limiter: max 5 submissions per IP per 30 minutes ────
// Prevents response spam without blocking genuine users
const submitLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 5,
  keyGenerator: (req) => `${req.ip}:${req.params.surveyId}`,
  message: {
    success: false,
    message: 'Too many submissions from this IP. Please try again in 30 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Rate limiter: max 10 session starts per IP per 30 minutes
const startLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => `${req.ip}:${req.params.surveyId}`,
  message: {
    success: false,
    message: 'Too many session starts from this IP. Please try again later.',
  },
});

router.post('/:surveyId/responses/start', startLimiter, optionalAuth, startResponse);
router.patch('/:surveyId/responses/:responseId/answers', saveAnswers);
router.post('/:surveyId/responses/:responseId/submit', submitLimiter, submitResponse);
router.patch('/:surveyId/responses/:responseId/abandon', abandonResponse);
router.get('/:surveyId/responses', protect, getResponses);
router.delete('/:surveyId/responses/:responseId', protect, deleteResponse);

module.exports = router;
