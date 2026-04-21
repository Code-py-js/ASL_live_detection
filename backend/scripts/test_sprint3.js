const http = require('http');

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
  console.log('Testing SPRINT-3: API Standards\n');
  let passed = 0;
  let failed = 0;

  // Test 1: Health endpoint with /api/v1/ prefix
  console.log('Test 1: Health endpoint (/api/v1/health)');
  try {
    const res = await makeRequest('GET', '/api/v1/health');
    if (res.status === 200 && res.data.status && res.data.database !== undefined) {
      console.log('✓ Health endpoint working with v1 prefix');
      console.log(`  Status: ${res.data.status}, DB: ${res.data.database}`);
      passed++;
    } else {
      console.log(`✗ Unexpected response: ${res.status}`);
      failed++;
    }
  } catch (e) {
    console.log(`✗ Error: ${e.message}`);
    failed++;
  }
  console.log();

  // Test 2: Swagger UI accessibility
  console.log('Test 2: Swagger UI at /api/v1/docs');
  try {
    const res = await makeRequest('GET', '/api/v1/docs');
    if (res.status === 200 || res.status === 301 || res.status === 302) {
      console.log(`✓ Swagger UI accessible (status: ${res.status})`);
      passed++;
    } else {
      console.log(`✗ Swagger UI not accessible (status: ${res.status})`);
      failed++;
    }
  } catch (e) {
    console.log(`✗ Error: ${e.message}`);
    failed++;
  }
  console.log();

  // Test 3: Register endpoint with /api/v1/ prefix and error handling
  console.log('Test 3: Register endpoint error handling (/api/v1/auth/register)');
  try {
    const res = await makeRequest('POST', '/api/v1/auth/register', {
      email: 'test@example.com',
      password: 'weak',
    });
    if (res.status === 400 && res.data.code === 'VALIDATION_ERROR') {
      console.log('✓ Validation error returns proper error code');
      passed++;
    } else {
      console.log(`✗ Expected 400 with VALIDATION_ERROR, got ${res.status} with code: ${res.data.code}`);
      failed++;
    }
  } catch (e) {
    console.log(`✗ Error: ${e.message}`);
    failed++;
  }
  console.log();

  // Test 4: Register valid user
  console.log('Test 4: Register valid user with /api/v1/ prefix');
  const testEmail = `test_${Date.now()}@example.com`;
  let token = null;
  try {
    const res = await makeRequest('POST', '/api/v1/auth/register', {
      email: testEmail,
      password: 'Test@1234',
    });
    if (res.status === 201 && res.data.token) {
      console.log('✓ User registered successfully');
      token = res.data.token;
      passed++;
    } else {
      console.log(`✗ Registration failed: ${res.status}`);
      failed++;
    }
  } catch (e) {
    console.log(`✗ Error: ${e.message}`);
    failed++;
  }
  console.log();

  // Test 5: Create translation with standardized error response
  console.log('Test 5: Input validation error response format');
  try {
    const res = await makeRequest('POST', '/api/v1/translations', 
      {
        inputText: '',
        outputText: 'test',
        confidence: 0.8,
      },
      { Authorization: `Bearer ${token}` }
    );
    if (res.status === 400 && res.data.code && res.data.message && res.data.timestamp) {
      console.log('✓ Error response includes code, message, timestamp');
      console.log(`  Code: ${res.data.code}, Message: ${res.data.message}`);
      passed++;
    } else {
      console.log(`✗ Error response format incorrect`);
      console.log(`  Response: ${JSON.stringify(res.data)}`);
      failed++;
    }
  } catch (e) {
    console.log(`✗ Error: ${e.message}`);
    failed++;
  }
  console.log();

  // Test 6: Valid translation creation
  console.log('Test 6: Create translation with /api/v1/ prefix');
  try {
    const res = await makeRequest('POST', '/api/v1/translations', 
      {
        inputText: 'Hello',
        outputText: 'مرحبا',
        confidence: 0.95,
      },
      { Authorization: `Bearer ${token}` }
    );
    if (res.status === 201 && res.data._id) {
      console.log('✓ Translation created with v1 prefix');
      passed++;
    } else {
      console.log(`✗ Translation creation failed: ${res.status}`);
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
