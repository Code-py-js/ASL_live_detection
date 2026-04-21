const request = require('supertest');
const express = require('express');
const Translation = require('../src/models/Translation');
const translationRoutes = require('../src/routes/translations');

// Mock the models
jest.mock('../src/models/Translation');
jest.mock('../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { userId: '507f1f77bcf86cd799439011', email: 'test@example.com' };
    next();
  },
}));

describe('Translation Routes - Unit Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/translations', translationRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/translations', () => {
    it('should create a new translation record', async () => {
      const translationData = {
        inputText: 'Hello',
        outputText: 'Hola',
        confidence: 0.95,
      };

      const mockTranslation = {
        _id: '507f1f77bcf86cd799439012',
        userId: '507f1f77bcf86cd799439011',
        ...translationData,
        createdAt: new Date().toISOString(),
        save: jest.fn().mockResolvedValue(this),
      };

      Translation.prototype.save = jest.fn().mockResolvedValue(mockTranslation);
      Translation.mockImplementation(() => mockTranslation);

      const response = await request(app)
        .post('/api/v1/translations')
        .send(translationData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.inputText).toBe('Hello');
      expect(response.body.outputText).toBe('Hola');
      expect(response.body.confidence).toBe(0.95);
    });

    it('should return 400 for missing inputText', async () => {
      const response = await request(app)
        .post('/api/v1/translations')
        .send({
          outputText: 'Hola',
          confidence: 0.95,
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for empty inputText', async () => {
      const response = await request(app)
        .post('/api/v1/translations')
        .send({
          inputText: '',
          outputText: 'Hola',
          confidence: 0.95,
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 for confidence > 1', async () => {
      const response = await request(app)
        .post('/api/v1/translations')
        .send({
          inputText: 'Hello',
          outputText: 'Hola',
          confidence: 1.5,
        });

      expect(response.status).toBe(400);
    });

    it('should accept optional confidence field', async () => {
      const translationData = {
        inputText: 'Hello',
        outputText: 'Hola',
      };

      const mockTranslation = {
        _id: '507f1f77bcf86cd799439012',
        userId: '507f1f77bcf86cd799439011',
        ...translationData,
        confidence: 1,
        createdAt: new Date().toISOString(),
      };

      Translation.prototype.save = jest.fn().mockResolvedValue(mockTranslation);
      Translation.mockImplementation(() => mockTranslation);

      const response = await request(app)
        .post('/api/v1/translations')
        .send(translationData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('confidence');
    });
  });

  describe('GET /api/v1/translations', () => {
    it('should return paginated translations for authenticated user', async () => {
      const mockTranslations = [
        {
          _id: '507f1f77bcf86cd799439012',
          userId: '507f1f77bcf86cd799439011',
          inputText: 'Hello',
          outputText: 'Hola',
          confidence: 0.95,
          createdAt: new Date().toISOString(),
        },
      ];

      Translation.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockTranslations),
          }),
        }),
      });

      Translation.countDocuments = jest.fn().mockResolvedValue(1);

      const response = await request(app)
        .get('/api/v1/translations?page=1&limit=10');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 400 for invalid page number', async () => {
      const response = await request(app)
        .get('/api/v1/translations?page=0&limit=10');

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid limit', async () => {
      const response = await request(app)
        .get('/api/v1/translations?page=1&limit=-1');

      expect(response.status).toBe(400);
    });

    it('should use default pagination values', async () => {
      const mockTranslations = [];

      Translation.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockTranslations),
          }),
        }),
      });

      Translation.countDocuments = jest.fn().mockResolvedValue(0);

      const response = await request(app)
        .get('/api/v1/translations');

      expect(response.status).toBe(200);
      expect(response.body.page).toBeGreaterThanOrEqual(1);
      expect(response.body.limit).toBeGreaterThanOrEqual(1);
    });

    it('should filter translations by user ID', async () => {
      Translation.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      Translation.countDocuments = jest.fn().mockResolvedValue(0);

      await request(app).get('/api/v1/translations');

      // Verify find was called with userId filter
      expect(Translation.find).toHaveBeenCalled();
      const filterArg = Translation.find.mock.calls[0][0];
      expect(filterArg).toHaveProperty('userId');
    });
  });

  describe('Translation Data Validation', () => {
    it('should validate confidence is a number', async () => {
      const response = await request(app)
        .post('/api/v1/translations')
        .send({
          inputText: 'Hello',
          outputText: 'Hola',
          confidence: 'high',
        });

      expect(response.status).toBe(400);
    });

    it('should enforce maximum length for text fields', async () => {
      const longText = 'a'.repeat(50000);
      
      const response = await request(app)
        .post('/api/v1/translations')
        .send({
          inputText: longText,
          outputText: 'Hola',
          confidence: 0.95,
        });

      expect([400, 413]).toContain(response.status);
    });

    it('should preserve special characters in translation text', async () => {
      const specialText = '¡Hola! ¿Cómo estás?';
      const translationData = {
        inputText: 'Hello! How are you?',
        outputText: specialText,
        confidence: 0.95,
      };

      const mockTranslation = {
        _id: '507f1f77bcf86cd799439012',
        userId: '507f1f77bcf86cd799439011',
        ...translationData,
        createdAt: new Date().toISOString(),
      };

      Translation.prototype.save = jest.fn().mockResolvedValue(mockTranslation);
      Translation.mockImplementation(() => mockTranslation);

      const response = await request(app)
        .post('/api/v1/translations')
        .send(translationData);

      expect(response.status).toBe(201);
      expect(response.body.outputText).toBe(specialText);
    });
  });

  describe('User Isolation', () => {
    it('should only return translations for authenticated user', async () => {
      const userId = '507f1f77bcf86cd799439011';
      
      Translation.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      Translation.countDocuments = jest.fn().mockResolvedValue(0);

      await request(app).get('/api/v1/translations');

      // Verify filter includes user ID
      const findCall = Translation.find.mock.calls[0][0];
      expect(findCall.userId).toBe(userId);
    });
  });
});
