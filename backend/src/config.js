require('dotenv').config();

module.exports = {
  port: process.env.PORT || 4000,
  useInMemoryDb: process.env.USE_IN_MEMORY_DB === 'true',
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret',
  jwtExpiry: process.env.JWT_EXPIRY || '7d',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10'),
  nodeEnv: process.env.NODE_ENV || 'development',
};
