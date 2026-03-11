const express = require('express');
const router = express.Router();
const User = require('../models/User.model');
const Survey = require('../models/Survey.model');
const Response = require('../models/Response.model');
const AppError = require('../middleware/AppError');
const { protect, authorize } = require('../middleware/auth.middleware');

// GET /api/users/me/surveys — surveys created by current user
router.get('/me/surveys', protect, async (req, res, next) => {
  try {
    const surveys = await Survey.find({ creator: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, surveys });
  } catch (e) { next(e); }
});

// GET /api/users/me/responses — surveys this user has answered
router.get('/me/responses', protect, async (req, res, next) => {
  try {
    const responses = await Response.find({ respondent: req.user._id, status: 'completed' })
      .populate('survey', 'title slug status');
    res.json({ success: true, responses });
  } catch (e) { next(e); }
});

// PATCH /api/users/me — update profile
router.patch('/me', protect, async (req, res, next) => {
  try {
    const allowed = ['name', 'avatar', 'preferences'];
    const updates = {};
    allowed.forEach((field) => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user: user.toPublicJSON() });
  } catch (e) { next(e); }
});

// DELETE /api/users/me — delete account
router.delete('/me', protect, async (req, res, next) => {
  try {
    await Survey.deleteMany({ creator: req.user._id });
    await Response.deleteMany({ respondent: req.user._id });
    await User.findByIdAndDelete(req.user._id);
    res.json({ success: true, message: 'Account deleted.' });
  } catch (e) { next(e); }
});

// Admin: get all users
router.get('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, users: users.map(u => u.toPublicJSON()) });
  } catch (e) { next(e); }
});

module.exports = router;
