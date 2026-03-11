const express = require('express');
const router = express.Router();
const {
  getSurveys, getSurvey, createSurvey, updateSurvey, deleteSurvey,
  publishSurvey, closeSurvey, duplicateSurvey,
  addQuestion, updateQuestion, deleteQuestion, reorderQuestions,
} = require('../controllers/survey.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');

// ─── Survey CRUD ──────────────────────────────────────────────
router.get('/', optionalAuth, getSurveys);
router.post('/', protect, createSurvey);
router.get('/:id', optionalAuth, getSurvey);
router.put('/:id', protect, updateSurvey);
router.delete('/:id', protect, deleteSurvey);

// ─── Survey Status ─────────────────────────────────────────────
router.patch('/:id/publish', protect, publishSurvey);
router.patch('/:id/close', protect, closeSurvey);
router.post('/:id/duplicate', protect, duplicateSurvey);

// ─── Questions ─────────────────────────────────────────────────
router.post('/:id/questions', protect, addQuestion);
router.put('/:id/questions/:questionId', protect, updateQuestion);
router.delete('/:id/questions/:questionId', protect, deleteQuestion);
router.patch('/:id/questions/reorder', protect, reorderQuestions);

module.exports = router;
