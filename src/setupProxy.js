const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  const target = 'http://localhost:3001';
  // Proxy les routes SSR/backend en local pour reproduire le comportement prod
  app.use(
    ['/api', '/blog', '/sitemap.xml', '/robots.txt', '/assets', '/gallery', '/gallery-file'],
    createProxyMiddleware({
      target,
      changeOrigin: true,
    })
  );
};
