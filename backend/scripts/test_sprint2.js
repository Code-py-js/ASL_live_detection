const http = require('http');

const post = (path, body, headers = {}) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'localhost',
      port: 4000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let chunks = '';
      res.on('data', (chunk) => (chunks += chunk));
      res.on('end', () => {
        resolve({ status: res.statusCode, body: chunks });
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
};

(async () => {
  try {
    // First, register and login to get a token
    console.log('Setting up test user...');
    const register = await post('/api/auth/register', { 
      email: 'sprint2@test.com', 
      password: 'Sprint2@Pass'
    });
    const { token } = JSON.parse(register.body);
    console.log('✓ Registered and got JWT token\n');

    // Test 1: Invalid confidence (too high)
    console.log('1. Invalid confidence test (>1):');
    const invalidHigh = await post('/api/translations', 
      { inputText: 'hello', outputText: 'world', confidence: 1.5 },
      { Authorization: `Bearer ${token}` }
    );
    console.log('   Status:', invalidHigh.status, '(expected 400)');
    console.log('   Message:', JSON.parse(invalidHigh.body).message);

    // Test 2: Invalid confidence (negative)
    console.log('\n2. Invalid confidence test (negative):');
    const invalidNeg = await post('/api/translations', 
      { inputText: 'hello', outputText: 'world', confidence: -0.5 },
      { Authorization: `Bearer ${token}` }
    );
    console.log('   Status:', invalidNeg.status, '(expected 400)');

    // Test 3: Empty inputText
    console.log('\n3. Empty inputText test:');
    const emptyInput = await post('/api/translations', 
      { inputText: '', outputText: 'world', confidence: 0.9 },
      { Authorization: `Bearer ${token}` }
    );
    console.log('   Status:', emptyInput.status, '(expected 400)');
    console.log('   Message:', JSON.parse(emptyInput.body).message);

    // Test 4: Missing outputText
    console.log('\n4. Missing outputText test:');
    const missingOutput = await post('/api/translations', 
      { inputText: 'hello', confidence: 0.9 },
      { Authorization: `Bearer ${token}` }
    );
    console.log('   Status:', missingOutput.status, '(expected 400)');

    // Test 5: Valid translation
    console.log('\n5. Valid translation test:');
    const valid = await post('/api/translations', 
      { inputText: 'hello', outputText: 'مرحبا', confidence: 0.95 },
      { Authorization: `Bearer ${token}` }
    );
    console.log('   Status:', valid.status, '(expected 201)');
    console.log('   Data:', JSON.parse(valid.body).inputText);

    // Test 6: Missing authorization
    console.log('\n6. Missing authorization test:');
    const noAuth = await post('/api/translations', 
      { inputText: 'hello', outputText: 'world', confidence: 0.9 }
    );
    console.log('   Status:', noAuth.status, '(expected 401)');
    console.log('   Message:', JSON.parse(noAuth.body).message);

    console.log('\n✓ SPRINT-2 validation tests complete!');
  } catch (err) {
    console.error('Test error:', err);
  }
})();
