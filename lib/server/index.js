'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _serveFavicon = require('serve-favicon');

var _serveFavicon2 = _interopRequireDefault(_serveFavicon);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _middlewares = require('./middlewares');

var _middlewares2 = _interopRequireDefault(_middlewares);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Server = function () {
  function Server(options) {
    _classCallCheck(this, Server);

    this.app = (0, _express2.default)();
    this.app.use((0, _serveFavicon2.default)(sysPath.join(__dirname, '../../public', 'favicon.png')));
    (0, _middlewares2.default)(this.app, options);
    this.start(options);
  }
  /**
   * @description 启动服务器
   */


  _createClass(Server, [{
    key: 'start',
    value: function start(options) {
      _http2.default.createServer(this.app).listen(options.port, function () {
        log('Starting up server, serving at: ', process.cwd());
        log('Available on: ', 'http://127.0.0.1:' + options.port);
      });
      if (options.https) {
        var globalConfig = JSON.parse(fs.readFileSync(FET_RC, { encoding: 'utf8' }));
        if (!globalConfig['https-key'] || !globalConfig['https-crt']) {
          warn('缺少 https 证书/秘钥配置，将使用默认，或执行以下命令设置:');
          !globalConfig['https-key'] && warn('fet config https-key <path-to-your-key>');
          !globalConfig['https-crt'] && warn('fet config https-crt <path-to-your-crt>');
        }
        var defaultHttpsConfigPath = sysPath.join(__dirname, '../config');

        var httpsOpt = {
          key: fs.readFileSync(globalConfig['https-key'] || sysPath.join(defaultHttpsConfigPath, 'server.key')),
          cert: fs.readFileSync(globalConfig['https-crt'] || sysPath.join(defaultHttpsConfigPath, 'server.crt'))
        };
        _https2.default.createServer(httpsOpt, this.app).listen(443, function () {
          log('Starting up server, serving at: ', process.cwd());
          log('Available on: ', 'http://127.0.0.1:' + 443);
        });
      }
    }
  }]);

  return Server;
}();

module.exports = Server;