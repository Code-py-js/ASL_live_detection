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

async function runIntegrationTests() {
  console.log('🧪 SPRINT-5: Complete Integration Test Workflow\n');
  let passed = 0;
  let failed = 0;
  let email;
  let token;

  console.log('╔════════════════════════════════════════════╗');
  console.log('║ Complete User Journey Integration Test     ║');
  console.log('╚════════════════════════════════════════════╝\n');

  // Step 1: User Registration
  console.log('Step 1: User Registration');
  console.log('─────────────────────────');
  try {
    email = `integration_test_${Date.now()}@example.com`;
    const res = await makeRequest('POST', '/api/v1/auth/register', {
      email,
      password: 'Integration@Test123',
    });

    if (res.status === 201 && res.data.token) {
      token = res.data.token;
      console.log('✓ User successfully registered');
      console.log(`  Email: ${email}`);
      console.log(`  Token received: ${token.substring(0, 20)}...`);
      passed++;
    } else {
      console.log(`✗ Registration failed (${res.status})`);
      failed++;
    }
  } catch (e) {
    console.log(`✗ Registration error: ${e.message}`);
    failed++;
  }
  console.log();

  // Step 2: User Login
  console.log('Step 2:User Login');
  console.log('─────────────────');
  try {
    const res = await makeRequest('POST', '/api/v1/auth/login', {
      email,
      password: 'Integration@Test123',
    });

    if (res.status === 200 && res.data.token) {
      token = res.data.token; // Update token
      console.log('✓ User successfully logged in');
      console.log(`  Token received: ${token.substring(0, 20)}...`);
      passed++;
    } else {
      console.log(`✗ Login failed (${res.status})`);
      failed++;
    }
  } catch (e) {
    console.log(`✗ Login error: ${e.message}`);
    failed++;
  }
  console.log();

  // Step 3: Create Translation
  console.log('Step 3: Create Translation');
  console.log('──────────────────────────');
  let translationId;
  try {
    const res = await makeRequest('POST', '/api/v1/translations', {
      inputText: 'Hello World',
      outputText: 'مرحبا بالعالم',
      confidence: 0.92,
    }, {
      'Authorization': `Bearer ${token}`,
    });

    if (res.status === 201 && res.data._id) {
      translationId = res.data._id;
      console.log('✓ Translation successfully created');
      console.log(`  Input: ${res.data.inputText}`);
      console.log(`  Output: ${res.data.outputText}`);
      console.log(`  Confidence: ${res.data.confidence}`);
      console.log(`  ID: ${translationId}`);
      passed++;
    } else {
      console.log(`✗ Translation creation failed (${res.status})`);
      console.log(`  Response: ${JSON.stringify(res.data)}`);
      failed++;
    }
  } catch (e) {
    console.log(`✗ Translation creation error: ${e.message}`);
    failed++;
  }
  console.log();

  // Step 4: Create Multiple Translations
  console.log('Step 4: Create Multiple Translations (Batch)');
  console.log('────────────────────────────────────────────');
  const translations = [
    { input: 'Good morning', output: 'صباح الخير', confidence: 0.95 },
    { input: 'Thank you', output: 'شكرا لك', confidence: 0.98 },
    { input: 'How are you', output: 'كيف حالك', confidence: 0.85 },
  ];

  let createdCount = 0;
  for (const trans of translations) {
    try {
      const res = await makeRequest('POST', '/api/v1/translations', {
        inputText: trans.input,
        outputText: trans.output,
        confidence: trans.confidence,
      }, {
        'Authorization': `Bearer ${token}`,
      });

      if (res.status === 201) {
        createdCount++;
      }
    } catch (e) {
      // Silent fail for batch operations
    }
  }

  if (createdCount === translations.length) {
    console.log(`✓ All ${translations.length} translations created successfully`);
    passed++;
  } else {
    console.log(`⚠ ${createdCount}/${translations.length} translations created`);
  }
  console.log();

  // Step 5: Retrieve All Translations
  console.log('Step 5: Retrieve All Translations');
  console.log('─────────────────────────────────');
  try {
    const res = await makeRequest('GET', '/api/v1/translations', null, {
      'Authorization': `Bearer ${token}`,
    });

    if (res.status === 200 && res.data.data) {
      console.log('✓ Translations successfully retrieved');
      console.log(`  Total translations: ${res.data.total}`);
      console.log(`  Items in response: ${res.data.data.length}`);
      console.log(`  Pagination - Page: ${res.data.page}, Limit: ${res.data.limit}, Pages: ${res.data.pages}`);
      passed++;
    } else {
      console.log(`✗ Failed to retrieve translations (${res.status})`);
      failed++;
    }
  } catch (e) {
    console.log(`✗ Retrieval error: ${e.message}`);
    failed++;
  }
  console.log();

  // Step 6: Pagination Test
  console.log('Step 6: Pagination Test');
  console.log('──────────────────────');
  try {
    const res = await makeRequest('GET', '/api/v1/translations?page=1&limit=2', null, {
      'Authorization': `Bearer ${token}`,
    });

    if (res.status === 200 && res.data.limit === 2) {
      console.log('✓ Pagination working correctly');
      console.log(`  Page 1 - Requested limit: 2, Received: ${res.data.data.length} items`);
      passed++;
    } else {
      console.log(`✗ Pagination test failed (${res.status})`);
      failed++;
    }
  } catch (e) {
    console.log(`✗ Pagination error: ${e.message}`);
    failed++;
  }
  console.log();

  // Step 7: Error Handling - Invalid Token
  console.log('Step 7: Error Handling Tests');
  console.log('────────────────────────────');
  try {
    const res = await makeRequest('GET', '/api/v1/translations', null, {
      'Authorization': 'Bearer invalid_token',
    });

    if (res.status === 401) {
      console.log('✓ Invalid token correctly rejected');
      passed++;
    } else {
      console.log(`✗ Invalid token not handled properly (${res.status})`);
      failed++;
    }
  } catch (e) {
    console.log(`✗ Error handling test failed: ${e.message}`);
    failed++;
  }
  console.log();

  // Step 8: Health Check
  console.log('Step 8: System Health Check');
  console.log('───────────────────────────');
  try {
    const res = await makeRequest('GET', '/api/v1/health');

    if (res.status === 200 && res.data.status) {
      console.log('✓ System health check passed');
      console.log(`  Status: ${res.data.status}`);
      console.log(`  Database: ${res.data.database}`);
      console.log(`  Uptime: ${Math.floor(res.data.uptime)}s`);
      passed++;
    } else {
      console.log(`✗ Health check failed (${res.status})`);
      failed++;
    }
  } catch (e) {
    console.log(`✗ Health check error: ${e.message}`);
    failed++;
  }
  console.log();

  // Results Summary
  console.log('╔════════════════════════════════════════════╗');
  console.log('║          TEST RESULTS SUMMARY              ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log(`\nTotal Steps: ${passed + failed}`);
  console.log(`✓ Passed: ${passed}`);
  console.log(`✗ Failed: ${failed}`);
  console.log(`Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%\n`);

  if (failed === 0) {
    console.log('🎉 All integration tests passed!\n');
    return 0;
  } else {
    console.log(`⚠️  ${failed} test(s) failed\n`);
    return 1;
  }
}

runIntegrationTests().then(exitCode => {
  process.exit(exitCode);
}).catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});
