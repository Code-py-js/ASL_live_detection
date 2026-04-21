/**
 * Comprehensive API test suite using Jest and supertest
 * Tests authentication, translations, error handling, and edge cases
 */

const request = require('supertest');

const BASE_URL = 'http://localhost:4000';

/**
 * Test suite for API Integration
 */
describe('ASL Backend API Integration Tests', () => {
  let validToken;
  let testUserEmail = `test_${Date.now()}@example.com`;

  /**
   * Authentication Tests
   */
  describe('Authentication Endpoints', () => {
    test('POST /api/v1/auth/register - should register new user with valid credentials', async () => {
      const res = await request(BASE_URL)
        .post('/api/v1/auth/register')
        .send({
          email: testUserEmail,
          password: 'ValidPassword@123',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', testUserEmail);
      validToken = res.body.token; // Save for later tests
    });

    test('POST /api/v1/auth/register - should reject weak password', async () => {
      const res = await request(BASE_URL)
        .post('/api/v1/auth/register')
        .send({
          email: `weak_${Date.now()}@example.com`,
          password: 'weak',
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
      expect(res.body.message).toContain('Password must');
    });

    test('POST /api/v1/auth/register - should reject missing fields', async () => {
      const res = await request(BASE_URL)
        .post('/api/v1/auth/register')
        .send({ email: 'test@test.com' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    test('POST /api/v1/auth/login - should login with correct credentials', async () => {
      const res = await request(BASE_URL)
        .post('/api/v1/auth/login')
        .send({
          email: testUserEmail,
          password: 'ValidPassword@123',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    test('POST /api/v1/auth/login - should reject invalid credentials', async () => {
      const res = await request(BASE_URL)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password@123',
        });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe('AUTH_INVALID_CREDENTIALS');
    });
  });

  /**
   * Translation Tests
   */
  describe('Translation Endpoints', () => {
    let authToken;

    beforeAll(async () => {
      // Get a fresh token for this suite
      const res = await request(BASE_URL)
        .post('/api/v1/auth/register')
        .send({
          email: `trans_${Date.now()}@example.com`,
          password: 'ValidPassword@123',
        });
      authToken = res.body.token;
    });

    test('POST /api/v1/translations - should create translation with valid data', async () => {
      const res = await request(BASE_URL)
        .post('/api/v1/translations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          inputText: 'Hello',
          outputText: 'مرحبا',
          confidence: 0.95,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.inputText).toBe('Hello');
    });

    test('POST /api/v1/translations - should reject without authentication', async () => {
      const res = await request(BASE_URL)
        .post('/api/v1/translations')
        .send({
          inputText: 'Test',
          outputText: 'اختبار',
        });

      expect(res.status).toBe(401);
    });

    test('POST /api/v1/translations - should reject empty inputText', async () => {
      const res = await request(BASE_URL)
        .post('/api/v1/translations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          inputText: '',
          outputText: 'Translation',
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    test('POST /api/v1/translations - should reject confidence > 1', async () => {
      const res = await request(BASE_URL)
        .post('/api/v1/translations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          inputText: 'Test',
          outputText: 'اختبار',
          confidence: 1.5,
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    test('POST /api/v1/translations - should reject confidence < 0', async () => {
      const res = await request(BASE_URL)
        .post('/api/v1/translations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          inputText: 'Test',
          outputText: 'اختبار',
          confidence: -0.1,
        });

      expect(res.status).toBe(400);
    });

    test('GET /api/v1/translations - should retrieve user translations', async () => {
      const res = await request(BASE_URL)
        .get('/api/v1/translations')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body).toHaveProperty('total');
    });

    test('GET /api/v1/translations - should require authentication', async () => {
      const res = await request(BASE_URL)
        .get('/api/v1/translations');

      expect(res.status).toBe(401);
    });

    test('GET /api/v1/translations - should support pagination', async () => {
      const res = await request(BASE_URL)
        .get('/api/v1/translations?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.page).toBe(1);
      expect(res.body.limit).toBe(5);
    });
  });

  /**
   * Health and Error Handling Tests
   */
  describe('Health and Error Handling', () => {
    test('GET /api/v1/health - should return 200 with status', async () => {
      const res = await request(BASE_URL)
        .get('/api/v1/health');

      expect(res.status).toBe(200);
      expect(['ok', 'degraded']).toContain(res.body.status);
      expect(res.body).toHaveProperty('database');
      expect(res.body).toHaveProperty('uptime');
    });

    test('Error responses should have standardized format', async () => {
      const res = await request(BASE_URL)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@test.com',
          password: 'short',
        });

      expect(res.body).toHaveProperty('code');
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('timestamp');
    });

    test('404 errors should be handled', async () => {
      const res = await request(BASE_URL)
        .get('/api/v1/nonexistent');

      expect([404, 415]).toContain(res.status);
    });
  });
});

