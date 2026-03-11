const User = require('../models/User.model');
const { verifyAccessToken } = require('../utils/jwt.utils');
const AppError = require('./AppError');

/**
 * Protect: require valid JWT access token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Not authorized. Please log in.', 401));
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Get user from DB (fresh check, ensures user still exists)
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('User no longer exists.', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired. Please log in again.', 401));
    }
    next(error);
  }
};

/**
 * OptionalAuth: attach user if token present, but don't require it
 * Used for public surveys that can optionally track who responded
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = verifyAccessToken(token);
      req.user = await User.findById(decoded.id);
    }
    next();
  } catch {
    // No token or bad token — continue as anonymous
    next();
  }
};

/**
 * Authorize: restrict to certain roles
 * Usage: authorize('admin') or authorize('admin', 'user')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(`Role '${req.user.role}' is not authorized for this action.`, 403));
    }
    next();
  };
};

module.exports = { protect, optionalAuth, authorize };
