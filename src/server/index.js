import express from 'express';
import favicon from 'serve-favicon';
import http from 'http';
import https from 'https';
import proxy from 'http-proxy-middleware'
import middlewares from './middlewares';
import { resolve } from 'url';

class Server {
  constructor(options) {
    this.readConf().then((conf) => {
      this.app = express();
      this.app.set('fet', conf)
      this.app.use(favicon(sysPath.join(__dirname, '../../public', 'favicon.png')));
      this.proxy(this.app, conf)
      middlewares(this.app, options);
      this.start(options);
    })
  }

  proxy (app, conf) {
    for (let projectName in conf) {
      let project = conf[projectName]
      app.use(`/${projectName}`, proxy({
        target: `http://localhost:${project.port}`,
        changeOrigin: true
      }))
    }
  }

  readConf () {
    return new Promise((resolve, reject) => {
      fs.readJson(sysPath.join(process.cwd(), 'fet.conf')).then(conf => {
        resolve(conf)
      }).catch(err => {
        if (err.code === 'ENOENT') {
          warn('no fet.conf,please create if need')
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