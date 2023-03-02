const { createProxyMiddleware } = require('http-proxy-middleware');

const setupProxy = (app) => {
  app.use(
    '/wikidata',
    createProxyMiddleware({
      target: 'https://www.wikidata.org',
      changeOrigin: true,
      
    })
  );
};

module.exports = setupProxy;