const express = require('express');
const helmet = require('helmet');

// Validate environment variables first (fail fast if invalid)
const { validate: validateEnv } = require('./utils/validateEnv');
validateEnv();

const { port, mongoUri, useInMemoryDb } = require('./config');
const { connect } = require('./db');
const { corsOptions, apiLimiter, authLimiter, registerLimiter } = require('./middleware/security');
const errorHandler = require('./middleware/errorHandler');
const { logger, requestLogger } = require('./utils/logger');

logger.info('Starting backend server', {
  port,
  useInMemoryDb,
  mongoUri: useInMemoryDb ? '<in-memory>' : mongoUri,
});

const authRoutes = require('./routes/auth');
const translationRoutes = require('./routes/translations');
const healthRoutes = require('./routes/health');
const { specs, swaggerUi } = require('./docs/swagger');

const app = express();

// Middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);
app.use(require('cors')(corsOptions));
app.use(requestLogger()); // Log all requests

// Routes
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', registerLimiter);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/translations', translationRoutes);

// Error handling (must be last)
app.use(errorHandler);

const start = async () => {
  await connect();
  app.listen(port, () => {
    logger.info(`Server running on http://localhost:${port}`);
  });
};

start();
