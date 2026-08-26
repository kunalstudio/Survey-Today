const express = require('express');
const router = express.Router();
const {
  getSurveys, getSurvey, createSurvey, updateSurvey, deleteSurvey,
  publishSurvey, closeSurvey, archiveSurvey, duplicateSurvey,
  addQuestion, updateQuestion, deleteQuestion, reorderQuestions,
} = require('../controllers/survey.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const {
  validate,
  createSurveyRules,
  updateSurveyRules,
  addQuestionRules,
  getSurveysRules,
} = require('../validators/survey.validator');

// ─── Survey CRUD ──────────────────────────────────────────────
router.get('/', optionalAuth, getSurveysRules, validate, getSurveys);
router.post('/', protect, createSurveyRules, validate, createSurvey);
router.get('/:id', optionalAuth, getSurvey);
router.put('/:id', protect, updateSurveyRules, validate, updateSurvey);
router.delete('/:id', protect, deleteSurvey);

// ─── Survey Status ─────────────────────────────────────────────
router.patch('/:id/publish', protect, publishSurvey);
router.patch('/:id/close', protect, closeSurvey);
router.patch('/:id/archive', protect, archiveSurvey);
router.post('/:id/duplicate', protect, duplicateSurvey);

// ─── Questions ─────────────────────────────────────────────────
router.post('/:id/questions', protect, addQuestionRules, validate, addQuestion);
router.put('/:id/questions/:questionId', protect, updateQuestion);
router.delete('/:id/questions/:questionId', protect, deleteQuestion);
router.patch('/:id/questions/reorder', protect, reorderQuestions);

module.exports = router;
