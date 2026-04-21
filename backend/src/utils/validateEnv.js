/**
 * Environment validation utility
 * Validates required environment variables and configuration values at startup
 * Fails fast with clear error messages if validation fails
 */

const path = require('path');
const dotenv = require('dotenv');

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Define environment variable requirements
const REQUIRED_ENV_VARS = [
  'PORT',
  'JWT_SECRET',
  'JWT_EXPIRY',
  'BCRYPT_ROUNDS',
];

const OPTIONAL_ENV_VARS = [
  'LOG_LEVEL',
  'MONGODB_URI',
  'MONGODB_HOST',
  'MONGODB_PORT',
  'MONGODB_DB',
  'USE_IN_MEMORY_DB',
  'ALLOWED_ORIGINS',
];

/**
 * Validates that all required environment variables are set
 * @throws {Error} If any required environment variable is missing
 */
function validateRequiredVars() {
  const missing = [];
  const invalid = [];

  for (const varName of REQUIRED_ENV_VARS) {
    const value = process.env[varName];
    
    // Check if variable is set
    if (!value) {
      missing.push(`  - ${varName}`);
      continue;
    }

    // Validate specific values
    if (varName === 'PORT') {
      const port = parseInt(value, 10);
      if (isNaN(port) || port < 1 || port > 65535) {
        invalid.push(`  - PORT: "${value}" is not a valid port number (1-65535)`);
      }
    }

    if (varName === 'BCRYPT_ROUNDS') {
      const rounds = parseInt(value, 10);
      if (isNaN(rounds) || rounds < 4 || rounds > 31) {
        invalid.push(`  - BCRYPT_ROUNDS: "${value}" is not valid (must be 4-31)`);
      }
    }

    if (varName === 'JWT_EXPIRY') {
      // Basic validation - should match pattern like "7d", "24h", "30m"
      if (!/^\d+[smhd]$/.test(value)) {
        invalid.push(`  - JWT_EXPIRY: "${value}" is invalid (use format like "7d", "24h", "30m")`);
      }
    }

    if (varName === 'JWT_SECRET') {
      if (value === 'change_me' || value.length < 8) {
        invalid.push(`  - JWT_SECRET: must be at least 8 characters and not "change_me"`);
      }
    }
  }

  // Report missing variables
  if (missing.length > 0) {
    const errorMsg = `\n❌ Missing required environment variables:\n${missing.join('\n')}\n`;
    console.error(errorMsg);
    throw new Error('Missing required environment variables');
  }

  // Report invalid variables
  if (invalid.length > 0) {
    const errorMsg = `\n❌ Invalid environment variable values:\n${invalid.join('\n')}\n`;
    console.error(errorMsg);
    throw new Error('Invalid environment variable values');
  }
}

/**
 * Validates optional environment variables and logs warnings for invalid values
 */
function validateOptionalVars() {
  const warnings = [];

  if (process.env.LOG_LEVEL && !/^(debug|info|warn|error)$/.test(process.env.LOG_LEVEL)) {
    warnings.push(`  - LOG_LEVEL: "${process.env.LOG_LEVEL}" (valid: debug|info|warn|error)`);
  }

  if (process.env.ALLOWED_ORIGINS && !process.env.ALLOWED_ORIGINS.includes(',') && 
      process.env.ALLOWED_ORIGINS === 'http://localhost:3000') {
    // This is a single origin, which is allowed but might not be production-ready
    if (process.env.NODE_ENV === 'production') {
      warnings.push(`  - ALLOWED_ORIGINS: Only localhost specified in production`);
    }
  }

  if (warnings.length > 0) {
    console.warn(`\n⚠️  Environment validation warnings:\n${warnings.join('\n')}\n`);
  }
}

/**
 * Main validation function
 * @throws {Error} If any required validation fails
 */
function validate() {
  console.log('\n🔍 Validating environment variables...');
  
  try {
    validateRequiredVars();
    validateOptionalVars();
    
    console.log('✅ Environment validation passed!\n');
    return true;
  } catch (err) {
    console.error(`\n🛑 Validation failed: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { validate, validateRequiredVars, validateOptionalVars };
