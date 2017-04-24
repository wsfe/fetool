import express from 'express';
import favicon from 'serve-favicon';
import http from 'http';
import https from 'https';
import middlewares from './middlewares';

class Server {
  constructor(options) {
    this.app = express();
    this.app.use(favicon(sysPath.join(__dirname, '../../public', 'favicon.png')));
    middlewares(this.app, options);
    this.start(options);
  }
  /**
   * @description 启动服务器
   */
  start(options) {
    http.createServer(this.app).listen(options.port, () => {
      log('Starting up server, serving at: ', process.cwd());
      log('Available on: ', 'http://127.0.0.1:' + options.port);
    });
    if (options.https) {
      let globalConfig = JSON.parse(fs.readFileSync(FET_RC, { encoding: 'utf8' }));
      if (!globalConfig['https-key'] || !globalConfig['https-crt']) {
        warn('缺少 https 证书/秘钥配置，将使用默认，或执行以下命令设置:');
        !globalConfig['https-key'] && warn('ykit config set https-key <path-to-your-key>');
        !globalConfig['https-crt'] && warn('ykit config set https-crt <path-to-your-crt>');
      }
      let defaultHttpsConfigPath = sysPath.join(__dirname, '../config');

      let httpsOpt = {
        key: fs.readFileSync(globalConfig['https-key'] || defaultHttpsConfigPath + 'server.key'),
        cert: fs.readFileSync(globalConfig['https-crt'] || defaultHttpsConfigPath + 'server.crt')
      };
      https.createServer(httpsOpt, this.app).listen(443, () => {
        log('Starting up server, serving at: ', process.cwd());
        log('Available on: ', 'http://127.0.0.1:' + 443);
      });
    }
  }
}

module.exports = Server;