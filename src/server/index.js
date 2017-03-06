import express from 'express';
import favicon from 'serve-favicon';
import http from 'http';
import middlewares from './middlewares';

class Server {
  constructor(options) {
    this.app = express();
    this.app.use(favicon(sysPath.join(__dirname, '../../public', 'favicon.png')));
    this.app.use(express.static(process.cwd(), {
      index: false,
      redirect: false
    }));
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