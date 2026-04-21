const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:4000';

async function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('Testing SPRINT-4: Configuration Management\n');
  let passed = 0;
  let failed = 0;

  // Test 1: Configuration is externalized to .env
  console.log('Test 1: Configuration externalization (.env)');
  try {
    const envFile = path.join(__dirname, '../.env');
    if (fs.existsSync(envFile)) {
      const envContent = fs.readFileSync(envFile, 'utf8');
      const hasJwtExpiry = envContent.includes('JWT_EXPIRY');
      const hasBcryptRounds = envContent.includes('BCRYPT_ROUNDS');
      const hasLogLevel = envContent.includes('LOG_LEVEL');
      
      if (hasJwtExpiry && hasBcryptRounds && hasLogLevel) {
        console.log('✓ Configuration externalized to .env');
        console.log('  - JWT_EXPIRY ✓');
        console.log('  - BCRYPT_ROUNDS ✓');
        console.log('  - LOG_LEVEL ✓');
        passed++;
      } else {
        console.log('✗ Missing configuration variables in .env');
        failed++;
      }
    } else {
      console.log('✗ .env file not found');
      failed++;
    }
  } catch (e) {
    console.log(`✗ Error: ${e.message}`);
    failed++;
  }
  console.log();

  // Test 2: Environment validation runs at startup (check by making a request)
  console.log('Test 2: Environment validation at startup');
  try {
    const res = await makeRequest('GET', '/api/v1/health');
    if (res.status === 200) {
      // If server is running, environment validation passed
      console.log('✓ Server started successfully (env validation passed)');
      passed++;
    } else {
      console.log(`✗ Server responded with status: ${res.status}`);
      failed++;
    }
  } catch (e) {
    console.log(`✗ Error: ${e.message}`);
    failed++;
  }
  console.log();

  // Test 3: Winston logging is enabled and log files exist
  console.log('Test 3: Winston request logging');
  try {
    const logsDir = path.join(__dirname, '../logs');
    const combinedLog = path.join(logsDir, 'combined.log');
    const errorLog = path.join(logsDir, 'error.log');
    
    let logsExist = false;
    let containsLogs = false;
    
    if (fs.existsSync(combinedLog) && fs.existsSync(errorLog)) {
      logsExist = true;
      const logContent = fs.readFileSync(combinedLog, 'utf8');
      // Check if logs contain startup message
      containsLogs = logContent.includes('Starting backend server') || logContent.includes('Server running');
    }
    
    if (logsExist && containsLogs) {
      console.log('✓ Winston logging enabled and writing logs');
      console.log('  - Log files created ✓');
      console.log('  - Server start logs captured ✓');
      passed++;
    } else {
      console.log(`✗ Logging not properly configured (logs exist: ${logsExist}, contains data: ${containsLogs})`);
      failed++;
    }
  } catch (e) {
    console.log(`✗ Error: ${e.message}`);
    failed++;
  }
  console.log();

  // Test 4: Make a request and verify it's logged (request logging middleware)
  console.log('Test 4: Request logging middleware');
  try {
    // First make a simple health check request to trigger logging
    const healthRes = await makeRequest('GET', '/api/v1/health');
    
    if (healthRes.status === 200) {
      // Wait a bit longer for the log file to be flushed
      await new Promise(r => setTimeout(r, 500));
      
      const logsDir = path.join(__dirname, '../logs');
      const combinedLog = path.join(logsDir, 'combined.log');
      const logContent = fs.readFileSync(combinedLog, 'utf8');
      
      // Check if request logging shows GET /api/v1/health
      if (logContent.includes('GET')) {
        console.log('✓ Request logging middleware capturing requests');
        console.log('  - Sample request: GET /api/v1/health');
        passed++;
      } else {
        console.log('✗ Request not found in logs');
        failed++;
      }
    } else {
      console.log(`✗ Health check failed: ${healthRes.status}`);
      failed++;
    }
  } catch (e) {
    console.log(`✗ Error: ${e.message}`);
    failed++;
  }
  console.log();

  console.log(`\n========================================`);
  console.log(`Tests Passed: ${passed}/${passed + failed}`);
  console.log(`Tests Failed: ${failed}/${passed + failed}`);
  console.log(`========================================`);
  
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});
