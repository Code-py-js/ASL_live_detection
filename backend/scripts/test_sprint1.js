const http = require('http');

const post = (path, body) => {
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
  console.log('Testing password validation...');
  
  // Test 1: Weak password (should fail)
  console.log('\n1. Weak password test:');
  const weak = await post('/api/auth/register', { email: 'weak@test.com', password: 'weak' });
  console.log('Status:', weak.status, '(expected 400)');
  console.log('Response:', JSON.parse(weak.body).message);
  
  // Test 2: No special character (should fail)
  console.log('\n2. No special char test:');
  const noSpecial = await post('/api/auth/register', { email: 'nospe@test.com', password: 'Password123' });
  console.log('Status:', noSpecial.status, '(expected 400)');
  
  // Test 3: Strong password (should succeed)
  console.log('\n3. Strong password test:');
  const strong = await post('/api/auth/register', { email: 'strong@test.com', password: 'Strong@Pass123' });
  console.log('Status:', strong.status, '(expected 201)');
  
  // Test 4: Rate limiting - rapid register attempts
  console.log('\n4. Rate limiting test (rapid register attempts):');
  const startTime = Date.now();
  let limitedCount = 0;
  for (let i = 1; i <= 12; i++) {
    const result = await post('/api/auth/register', { 
      email: `ratelimit${i}@test.com`, 
      password: 'Valid@Pass123' 
    });
    if (result.status === 429) {
      limitedCount++;
      console.log(`  Attempt ${i}: Rate limited (429)`);
    } else {
      console.log(`  Attempt ${i}: Status ${result.status}`);
    }
  }
  console.log(`Rate limiting triggered: ${limitedCount > 0 ? 'YES ✓' : 'NO ✗'}`);
  console.log(`Total time: ${Date.now() - startTime}ms`);
})();
