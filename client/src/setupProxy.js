const proxy = require('http-proxy-middleware');

module.exports = function(app) {
  app.use( '/socket.io/',
    proxy({
      target: 'http://localhost:3001',
      changeOrigin: true,
      ws: true
    })
  );
  app.use( '/sockjs-node',
    proxy({
      target: 'ws://localhost:3001',
      changeOrigin: true,
      ws: true
    })
  );
};