import express from 'express';
import middlewares from './middlewares';
import http from 'http';

class Server {
  constructor(options) {
    this.app = express();
    middlewares(this.app);
    this.start(options);
  }
  /**
   * @description 启动服务器
   */
  start(options) {
    http.createServer(this.app).listen(options.port, () => {
      console.log('Starting up server, serving at: ', process.cwd());
      console.log('Available on: ', 'http://127.0.0.1:' + options.port);
    });
  }
}

module.exports = Server;