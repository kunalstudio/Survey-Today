const express = require('express');
const router = express.Router();
const {
  register, login, logout, refreshToken,
  forgotPassword, resetPassword, getMe
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const {
  validate,
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
} = require('../validators/auth.validator');

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/logout', protect, logout);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPasswordRules, validate, forgotPassword);
router.post('/reset-password', resetPasswordRules, validate, resetPassword);
router.get('/me', protect, getMe);

module.exports = router;

