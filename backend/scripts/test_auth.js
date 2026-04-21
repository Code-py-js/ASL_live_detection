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
  try {
    console.log('Registering test user...');
    const register = await post('/api/auth/register', { email: 'test@example.com', password: 'Test@1234' });
    console.log('Register:', register.status, register.body);

    console.log('Logging in...');
    const login = await post('/api/auth/login', { email: 'test@example.com', password: 'Test@1234' });
    console.log('Login:', login.status, login.body);
  } catch (err) {
    console.error('Error during request', err);
  }
})();
