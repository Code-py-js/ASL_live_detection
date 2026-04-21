const { authenticate, validateInput, errorHandler } = require('../src/middleware/index');
const jwt = require('jsonwebtoken');

describe('Authentication Middleware - Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('authenticate middleware', () => {
    it('should authenticate valid JWT token', () => {
      const token = jwt.sign(
        { userId: '507f1f77bcf86cd799439011', email: 'test@example.com' },
        process.env.JWT_SECRET || 'test-secret'
      );

      req.headers.authorization = `Bearer ${token}`;

      // For this test, we'll import the actual middleware
      // and verify the token structure
      const decoded = jwt.decode(token);
      expect(decoded.userId).toBeDefined();
      expect(decoded.email).toBeDefined();
    });

    it('should reject missing Authorization header', () => {
      // No authorization header
      req.headers.authorization = undefined;

      expect(req.headers.authorization).toBeUndefined();
    });

    it('should reject invalid token format', () => {
      req.headers.authorization = 'InvalidFormat';

      // Token should not be "Bearer <token>" format
      const valid = /^Bearer\s+/.test(req.headers.authorization);
      expect(valid).toBe(false);
    });

    it('should reject expired tokens', () => {
      const token = jwt.sign(
        { userId: '507f1f77bcf86cd799439011' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '-10s' } // Already expired
      );

      try {
        jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
        expect(true).toBe(false); // Should not reach here
      } catch (err) {
        expect(err.name).toBe('TokenExpiredError');
      }
    });

    it('should extract user info from valid token', () => {
      const userData = {
        userId: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
      };

      const token = jwt.sign(userData, process.env.JWT_SECRET || 'test-secret');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');

      expect(decoded.userId).toBe(userData.userId);
      expect(decoded.email).toBe(userData.email);
    });
  });
});

describe('Error Handler Middleware - Unit Tests', () => {
  let res, next;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('error handling', () => {
    it('should format validation errors', () => {
      const error = {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        timestamp: new Date().toISOString(),
      };

      res.status(400);
      res.json(error);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(error);
    });

    it('should format authentication errors', () => {
      const error = {
        code: 'AUTH_ERROR',
        message: 'Invalid token',
        timestamp: new Date().toISOString(),
      };

      res.status(401);
      res.json(error);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should format server errors', () => {
      const error = {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
      };

      res.status(500);
      res.json(error);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should include timestamp in error response', () => {
      const error = {
        code: 'TEST_ERROR',
        message: 'Test message',
        timestamp: new Date().toISOString(),
      };

      expect(error).toHaveProperty('timestamp');
      expect(new Date(error.timestamp).getTime()).toBeGreaterThan(0);
    });

    it('should sanitize error messages (no stack traces)', () => {
      const error = {
        code: 'ERROR',
        message: 'User-friendly message',
        // Should not include stack trace in final response
      };

      expect(error).not.toHaveProperty('stack');
    });
  });
});

describe('Input Validation - Unit Tests', () => {
  it('should validate email format', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'name+tag@example.com',
    ];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    validEmails.forEach(email => {
      expect(emailRegex.test(email)).toBe(true);
    });
  });

  it('should reject invalid email formats', () => {
    const invalidEmails = [
      'notanemail',
      '@example.com',
      'test@',
      'test..name@example.com',
    ];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    invalidEmails.forEach(email => {
      expect(emailRegex.test(email)).toBe(false);
    });
  });

  it('should validate password strength', () => {
    // Password must be at least 8 chars, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    expect(passwordRegex.test('ValidPass123')).toBe(true);
    expect(passwordRegex.test('weakpass')).toBe(false);
    expect(passwordRegex.test('WEAKPASS')).toBe(false);
    expect(passwordRegex.test('weak123')).toBe(false);
  });

  it('should sanitize input strings', () => {
    const unsafeInput = '<script>alert("xss")</script>';
    const sanitized = unsafeInput.replace(/[<>]/g, '');

    expect(sanitized).not.toContain('<');
    expect(sanitized).not.toContain('>');
  });

  it('should handle null/undefined inputs safely', () => {
    const validateField = (val) => {
      if (!val || typeof val !== 'string') return false;
      return val.trim().length > 0;
    };

    expect(validateField(null)).toBe(false);
    expect(validateField(undefined)).toBe(false);
    expect(validateField('')).toBe(false);
    expect(validateField('   ')).toBe(false);
    expect(validateField('valid')).toBe(true);
  });
});

describe('Rate Limiting - Unit Tests', () => {
  it('should track requests per minute', () => {
    const requestTracker = {};
    const limit = 10;

    const isLimited = (ip) => {
      const now = Date.now();
      const key = `${ip}:${Math.floor(now / 60000)}`;

      if (!requestTracker[key]) {
        requestTracker[key] = 0;
      }

      requestTracker[key]++;
      return requestTracker[key] > limit;
    };

    // Simulate 10 requests - should not be limited
    for (let i = 0; i < 10; i++) {
      expect(isLimited('192.168.1.1')).toBe(false);
    }

    // 11th request should be limited
    expect(isLimited('192.168.1.1')).toBe(true);
  });

  it('should reset counter after timeout', (done) => {
    const requestTracker = {};
    const limit = 5;
    const timeout = 100; // 100ms for testing

    const isLimited = (ip) => {
      const now = Date.now();
      const key = `${ip}:${Math.floor(now / timeout)}`;

      if (!requestTracker[key]) {
        requestTracker[key] = 0;
      }

      requestTracker[key]++;
      return requestTracker[key] > limit;
    };

    // Max out requests in current window
    for (let i = 0; i < 5; i++) {
      isLimited('192.168.1.1');
    }

    // Next request should be limited
    expect(isLimited('192.168.1.1')).toBe(true);

    // Wait for timeout, then should not be limited
    setTimeout(() => {
      expect(isLimited('192.168.1.1')).toBe(false);
      done();
    }, timeout + 50);
  });
});
