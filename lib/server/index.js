"use strict";

var _express = _interopRequireDefault(require("express"));

var _serveFavicon = _interopRequireDefault(require("serve-favicon"));

var _http = _interopRequireDefault(require("http"));

var _https = _interopRequireDefault(require("https"));

var _middlewares = _interopRequireDefault(require("./middlewares"));

var _url = require("url");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Server =
/*#__PURE__*/
function () {
  function Server(options) {
    var _this = this;

    _classCallCheck(this, Server);

    this.readConf(options.config).then(function (conf) {
      _this.app = (0, _express["default"])();

      _this.app.set('fet', conf);

      _this.app.use((0, _serveFavicon["default"])(sysPath.join(__dirname, '../../public', 'favicon.png')));

      (0, _middlewares["default"])(_this.app, options);

      _this.start(options);
    });
  }

  _createClass(Server, [{
    key: "readConf",
    value: function readConf(filePath) {
      return new Promise(function (resolve, reject) {
        fs.readJson(filePath).then(function (conf) {
          resolve(conf);
        })["catch"](function (err) {
          if (err.code === 'ENOENT') {
            warn('no fet.proxy.conf,please create if need');
            resolve({});
          } else {
            error(err);
            process.exit(1);
          }
        });
      });
    }
    /**
     * @description 启动服务器
     */

  }, {
    key: "start",
    value: function start(options) {
      _http["default"].createServer(this.app).listen(options.port, function () {
        log('Starting up server, serving at: ', process.cwd());
        log('Available on: ', 'http://127.0.0.1:' + options.port);
      });

      if (options.https) {
        var globalConfig = JSON.parse(fs.readFileSync(FET_RC, {
          encoding: 'utf8'
        }));

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

        _https["default"].createServer(httpsOpt, this.app).listen(443, function () {
          log('Starting up server, serving at: ', process.cwd());
          log('Available on: ', 'http://127.0.0.1:' + 443);
        });
      }
    }
  }]);

  return Server;
}();

module.exports = Server;