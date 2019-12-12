import express from 'express';
import favicon from 'serve-favicon';
import http from 'http';
import https from 'https';
import middlewares from './middlewares';

class Server {
  constructor(options) {
    this.readConf(options.config).then((conf) => {
      this.app = express();
      this.app.set('fet', conf)
      this.app.use((req, res, next) => {
        if (options.open || req.ip === '::1' || req.ip === '::ffff:127.0.0.1' || req.ip === '127.0.0.1') {
          next()
        } else {
          res.status(403)
          res.end()
        }
      })
      this.app.use(favicon(sysPath.join(__dirname, '../../public', 'favicon.png')));
      middlewares(this.app, options);
      this.start(options);
    })
  }

  readConf (filePath) {
    return new Promise((resolve, reject) => {
      fs.readJson(filePath).then(conf => {
        resolve(conf)
      }).catch(err => {
        if (err.code === 'ENOENT') {
          warn('no fet.proxy.conf,please create if need')
          resolve({})
        } else {
          error(err)
          process.exit(1)
        }
      })
    })
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
        !globalConfig['https-key'] && warn('fet config https-key <path-to-your-key>');
        !globalConfig['https-crt'] && warn('fet config https-crt <path-to-your-crt>');
      }
      let defaultHttpsConfigPath = sysPath.join(__dirname, '../config');

      let httpsOpt = {
        key: fs.readFileSync(globalConfig['https-key'] || sysPath.join(defaultHttpsConfigPath, 'server.key')),
        cert: fs.readFileSync(globalConfig['https-crt'] || sysPath.join(defaultHttpsConfigPath, 'server.crt'))
      };
      https.createServer(httpsOpt, this.app).listen(443, () => {
        log('Starting up server, serving at: ', process.cwd());
        log('Available on: ', 'http://127.0.0.1:' + 443);
      });
    }
  }
}

module.exports = Server;
