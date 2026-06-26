const { body, query, validationResult } = require('express-validator');

/**
 * Middleware: collect validation errors and short-circuit with 422
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ─── Survey Validators ────────────────────────────────────────

const createSurveyRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Survey title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('settings.isPublic')
    .optional()
    .isBoolean().withMessage('isPublic must be a boolean'),
  body('settings.allowAnonymous')
    .optional()
    .isBoolean().withMessage('allowAnonymous must be a boolean'),
  body('settings.requireLogin')
    .optional()
    .isBoolean().withMessage('requireLogin must be a boolean'),
  body('settings.oneResponsePerUser')
    .optional()
    .isBoolean().withMessage('oneResponsePerUser must be a boolean'),
  body('expiresAt')
    .optional({ nullable: true })
    .isISO8601().withMessage('expiresAt must be a valid date'),
];

const updateSurveyRules = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('settings.confirmationMessage')
    .optional()
    .isLength({ max: 500 }).withMessage('Confirmation message cannot exceed 500 characters'),
  body('settings.redirectUrl')
    .optional({ nullable: true })
    .custom((v) => !v || /^https?:\/\//.test(v)).withMessage('redirectUrl must be a valid URL'),
  body('expiresAt')
    .optional({ nullable: true })
    .isISO8601().withMessage('expiresAt must be a valid date'),
];

const addQuestionRules = [
  body('type')
    .notEmpty().withMessage('Question type is required')
    .isIn(['multiple_choice', 'checkbox', 'short_text', 'long_text', 'scale', 'rating', 'yes_no', 'date', 'dropdown'])
    .withMessage('Invalid question type'),
  body('text')
    .trim()
    .notEmpty().withMessage('Question text is required'),
  body('required')
    .optional()
    .isBoolean().withMessage('required must be a boolean'),
  body('options')
    .optional()
    .isArray().withMessage('Options must be an array'),
  body('options.*.text')
    .optional()
    .trim()
    .notEmpty().withMessage('Option text cannot be empty'),
  body('scaleMin')
    .optional()
    .isNumeric().withMessage('scaleMin must be a number'),
  body('scaleMax')
    .optional()
    .isNumeric().withMessage('scaleMax must be a number')
    .custom((max, { req }) => {
      if (req.body.scaleMin !== undefined && Number(max) <= Number(req.body.scaleMin)) {
        throw new Error('scaleMax must be greater than scaleMin');
      }
      return true;
    }),
];

// ─── Survey List Query Validators ─────────────────────────────

const getSurveysRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('sortBy').optional().isIn(['newest', 'popular', 'relevance']).withMessage('sortBy must be newest, popular, or relevance'),
  query('status').optional().isIn(['draft', 'active', 'closed', 'archived']).withMessage('Invalid status'),
];

module.exports = {
  validate,
  createSurveyRules,
  updateSurveyRules,
  addQuestionRules,
  getSurveysRules,
};
