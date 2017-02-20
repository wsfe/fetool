import express from 'express';
import middlewares from './middlewares';
import serveStatic from 'serve-static';
import webpackDevMiddleware from 'webpack-dev-middleware';

class Server {
  constructor(options) {
    this.app = express();
    middlewares(this.app);
  }
  /**
   * @description 启动服务器
   */
  start() {}
}

module.exports = Server;