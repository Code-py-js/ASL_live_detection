const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Environment-based configuration
const IS_TEST = process.env.NODE_ENV === 'test';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// CORS configuration
const corsOptions = {
  origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(o => o.trim()),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

const getApiLimitConfig = () => {
  if (IS_TEST) return { windowMs: 1 * 60 * 1000, max: 10000 };
  if (IS_PRODUCTION) {
    return {
      windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS || 60000),
      max: parseInt(process.env.API_RATE_LIMIT_MAX_REQUESTS || 100),
    };
  }
  return { windowMs: 1 * 60 * 1000, max: 100 };
};

const getAuthLimitConfig = () => {
  if (IS_TEST) return { windowMs: 1 * 60 * 1000, max: 10000 };
  return { windowMs: 15 * 60 * 1000, max: 100 }; // Default: 100 per 15 min for dev
};

const apiConfig = getApiLimitConfig();
const authConfig = getAuthLimitConfig();

// Generic API rate limiter
const apiLimiter = rateLimit({
  windowMs: apiConfig.windowMs,
  max: apiConfig.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later.',
  skip: () => IS_TEST, // FIXED: Must be a function
});

// Auth-specific rate limiter
const authLimiter = rateLimit({
  windowMs: authConfig.windowMs,
  max: authConfig.max,
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => IS_TEST, // FIXED: Must be a function
});

// Register-specific rate limiter
const registerLimiter = rateLimit({
  windowMs: authConfig.windowMs,
  max: authConfig.max,
  message: 'Too many registration attempts.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => IS_TEST, // FIXED: Must be a function
});

module.exports = {
  corsOptions,
  apiLimiter,
  authLimiter,
  registerLimiter,
};
