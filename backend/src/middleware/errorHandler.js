/**
 * Standardized error response format
 * All errors should follow: { code: string, message: string, details?: object, timestamp: ISO8601 }
 */

const errorHandler = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  
  // Log error server-side
  console.error(`[${timestamp}] Error: ${err.message}`);
  if (err.stack) console.error(err.stack);

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: Object.entries(err.errors).reduce((acc, [key, error]) => {
        acc[key] = error.message;
        return acc;
      }, {}),
      timestamp,
    });
  }

  // Mongoose unique index errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      code: 'DUPLICATE_ENTRY',
      message: `${field} already exists`,
      details: { field, value: err.keyValue[field] },
      timestamp,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      code: 'AUTH_INVALID_TOKEN',
      message: 'Invalid or malformed token',
      timestamp,
    });
  }

  // JWT expired
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      code: 'AUTH_TOKEN_EXPIRED',
      message: 'Token has expired',
      timestamp,
    });
  }

  // Database connection errors
  if (err.message.includes('connection') || err.message.includes('ECONNREFUSED')) {
    return res.status(503).json({
      code: 'DB_ERROR',
      message: 'Database connection error',
      timestamp,
    });
  }

  // Generic 500 error
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    code: 'INTERNAL_ERROR',
    message: statusCode === 500 ? 'Something went wrong' : err.message,
    timestamp,
  });
};

module.exports = errorHandler;
