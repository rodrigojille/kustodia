const https = require('https');

const options = {
  hostname: 'api.github.com',
  port: 443,
  path: '/',
  method: 'GET',
  headers: {
    'User-Agent': 'Node.js Test',
    'Accept': 'application/vnd.github.v3+json'
  }
};

const req = https.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  res.on('data', d => process.stdout.write(d));
});

req.on('error', error => {
  console.error('HTTPS request failed:', error);
});

req.end();
