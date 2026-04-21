const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ASL Live Detection API',
      version: '1.0.0',
      description: 'Backend API for ASL (American Sign Language) live detection and translation management',
      contact: {
        name: 'Support',
        email: 'support@asldetection.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server',
      },
      {
        url: 'https://api.asldetection.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Bearer token for authentication',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            passwordHash: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
          required: ['email', 'passwordHash'],
        },
        Translation: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            inputText: { type: 'string' },
            outputText: { type: 'string' },
            confidence: { type: 'number', minimum: 0, maximum: 1 },
            createdAt: { type: 'string', format: 'date-time' },
          },
          required: ['userId', 'inputText', 'outputText'],
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            code: { type: 'string', description: 'Error code identifier' },
            message: { type: 'string', description: 'Human-readable error message' },
            details: {
              type: 'object',
              description: 'Additional error details if applicable',
            },
            timestamp: { type: 'string', format: 'date-time' },
          },
          required: ['code', 'message', 'timestamp'],
        },
      },
    },
  },
  apis: [
    './src/routes/auth.js',
    './src/routes/translations.js',
    './src/routes/health.js',
  ],
};

const specs = swaggerJsdoc(options);

module.exports = { specs, swaggerUi };
