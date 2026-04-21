/**
 * Winston logger configuration
 * Provides structured logging for request/response tracking and error handling
 */

const winston = require('winston');
const path = require('path');
const { logLevel } = require('../config');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
const fs = require('fs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    // Format metadata
    let metaStr = '';
    if (Object.keys(meta).length > 0 && meta.useOnlyMessage !== true) {
      metaStr = JSON.stringify(meta, null, 2);
    }
    return `${timestamp} [${level.toUpperCase()}]: ${message}${metaStr ? '\n' + metaStr : ''}`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: logLevel || 'info',
  format: logFormat,
  defaultMeta: { service: 'api-backend' },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      ),
    }),
    
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: logFormat,
    }),
    
    // Error file transport
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: logFormat,
    }),
  ],
});

/**
 * Request logging middleware for Express
 * Logs incoming requests with method, URL, status code, and response time
 * @returns {Function} Express middleware function
 */
function requestLogger() {
  return (req, res, next) => {
    // Start request timer
    const startTime = Date.now();
    
    // Capture the original res.end to log after response is sent
    const originalEnd = res.end;
    
    res.end = function(...args) {
      if (!res.headersSent) {
        return originalEnd.apply(res, args);
      }
      
      const duration = Date.now() - startTime;
      
      // Log request details
      logger.info(`${req.method} ${req.path}`, {
        status: res.statusCode,
        durationMs: duration,
        method: req.method,
        path: req.path,
        userId: req.user?.userId || 'anonymous',
        ip: req.ip,
      });
      
      return originalEnd.apply(res, args);
    };
    
    next();
  };
}

module.exports = { logger, requestLogger };
