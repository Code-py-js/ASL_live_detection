const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { mongoUri, useInMemoryDb } = require('./config');
const { logger } = require('./utils/logger');

// Get the appropriate MongoDB URI based on environment
const getDatabaseUri = () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const testUri = process.env.MONGODB_TEST_URI;

  if (nodeEnv === 'test') {
    if (testUri) {
      logger.info('Using test MongoDB URI from MONGODB_TEST_URI');
      return testUri;
    }
    // Fall back to in-memory for test if no test URI provided
    logger.info('No MONGODB_TEST_URI provided, will use in-memory for testing');
  }

  // For development/production, use the configured URI
  return mongoUri;
};

const connect = async () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const shouldUseInMemory = useInMemoryDb || nodeEnv === 'test';

  if (shouldUseInMemory) {
    logger.warn(
      `USE_IN_MEMORY_DB=${useInMemoryDb}, NODE_ENV=${nodeEnv}: using in-memory MongoDB (mongodb-memory-server).`
    );
    const mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    logger.info('Connected to in-memory MongoDB', {
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
      readyState: mongoose.connection.readyState,
    });
    return;
  }

  try {
    const connectionUri = getDatabaseUri();
    await mongoose.connect(connectionUri);
    logger.info('Connected to MongoDB', {
      environment: nodeEnv,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    });
  } catch (error) {
    logger.warn('MongoDB connection failed - falling back to in-memory MongoDB', {
      error: error.message,
      mongoUri: getDatabaseUri().substring(0, 50) + '...',
    });

    const mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    logger.info('Connected to in-memory MongoDB (fallback)', {
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
      readyState: mongoose.connection.readyState,
    });
  }
};

module.exports = { connect };
