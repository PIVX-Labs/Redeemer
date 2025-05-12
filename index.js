// Load environment variables from .env file
require('dotenv').config();

// Native Node modules
const path = require('path');
const http = require('http');
const https = require('https');
const fs = require('fs');
const cors = require('cors');

// NPM modules
const express = require('express');
const { redirectToHTTPS } = require('express-http-to-https');

// Setup Express
const app = express();
// No CORS
app.use(cors());
const port = process.env.PORT || 3000;
const sslCertPath = '/etc/letsencrypt/live/' + process.env.DOMAIN + '/';

// Serve static files from the 'public' directory, along with the root prefix if specified
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));
const router = require('./src/routes');
app.use(router);
// Startup
let server;
if (process.env.DOMAIN) {
  // SSL options
  const sslOptions = {
    cert: fs.readFileSync(sslCertPath + 'fullchain.pem'),
    key: fs.readFileSync(sslCertPath + 'privkey.pem')
  };

  // Start the HTTPS server
  server = https.createServer(sslOptions, app);
  server.listen(443, () => {
    console.log(`HTTPS server running on port 443 --> https://${process.env.DOMAIN}`);
  });

  // Listen for HTTP requests for redirect purposes
  const httpApp = express();
  httpApp.use(redirectToHTTPS());
  httpApp.listen(80);
} else {
  // Start the HTTP server
  server = http.createServer(app);
  server.listen(port, () => {
    console.log(`HTTP server running on port ${port} --> http://localhost:${port}`);
  });
}

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
});
