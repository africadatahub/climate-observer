const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

const wikidataProxy = createProxyMiddleware('/wikidata', {
  target: 'https://query.wikidata.org/sparql',
  changeOrigin: true,
    pathRewrite: {
    '^/wikidata': ''
    },
});

app.use((req, res, next) => {
  // Set CORS headers to allow requests from any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Pass control to the next handler
  next();
});

app.use(wikidataProxy);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});