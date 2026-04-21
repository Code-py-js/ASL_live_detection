const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../src/models/User');
const authRoutes = require('../src/routes/auth');

// Mock the User model
jest.mock('../src/models/User');

describe('Authentication Routes - Unit Tests', () => {
  let app;
  let authLimiter;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    // Mock rate limiter
    authLimiter = (req, res, next) => next();
    
    // Mount auth routes
    app.use('/api/v1/auth', authRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /register', () => {
    it('should create a new user and return token', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'TestPassword123!',
      };

      // Mock User.create to return user data
      User.create = jest.fn().mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        email: userData.email,
        save: jest.fn(),
      });

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', userData.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'TestPassword123!',
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for weak password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'weak',
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 409 if email already exists', async () => {
      User.findOne = jest.fn().mockResolvedValue({ email: 'exists@example.com' });

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'exists@example.com',
          password: 'TestPassword123!',
        });

      expect(response.status).toBe(409);
    });
  });

  describe('POST /login', () => {
    it('should authenticate user and return token', async () => {
      const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        password: hashedPassword,
        toObject: jest.fn().mockReturnValue({
          _id: '507f1f77bcf86cd799439011',
          email: 'test@example.com',
        }),
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should return 401 for invalid credentials', async () => {
      User.findOne = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'TestPassword123!',
        });

      expect(response.status).toBe(401);
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          password: 'TestPassword123!',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('JWT Token Generation', () => {
    it('should generate valid JWT token', async () => {
      const payload = {
        userId: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET || 'test-secret', {
        expiresIn: '15m',
      });

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      // Verify token decodes correctly
      const decoded = jwt.decode(token);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });

    it('should contain correct expiration claims', async () => {
      const token = jwt.sign(
        { userId: '507f1f77bcf86cd799439011' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '15m' }
      );

      const decoded = jwt.decode(token);
      expect(decoded).toHaveProperty('exp');
      expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });
  });
});
