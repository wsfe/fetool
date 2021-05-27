"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = initMiddlewares;

var _serveStatic = _interopRequireDefault(require("serve-static"));

var _serveIndex = _interopRequireDefault(require("serve-index"));

var _httpProxyMiddleware = _interopRequireDefault(require("http-proxy-middleware"));

var _compiler = _interopRequireDefault(require("./compiler"));

var _logger = _interopRequireDefault(require("./logger"));

var _htmlCompiler = _interopRequireDefault(require("./htmlCompiler"));

var _cors = _interopRequireDefault(require("./cors"));

var _webpackStatic = _interopRequireDefault(require("./webpackStatic"));

var _hashReplacer = _interopRequireDefault(require("./hashReplacer"));

var _proxyConnection = _interopRequireDefault(require("./proxyConnection"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function proxy(app) {
  var conf = app.get('fet');
  Object.keys(conf).forEach(function (projectName) {
    var project = conf[projectName];
    app.use("/".concat(projectName), (0, _httpProxyMiddleware["default"])({
      target: "http://localhost:".concat(project.port),
      changeOrigin: true
    }));
  });
}

function initMiddlewares(app, options, conf) {
  app.use(_logger["default"]);
  app.use(_proxyConnection["default"]);
  app.use(_hashReplacer["default"]);
  proxy(app);
  app.use(/.*\.(js|css|html|eot|ttf|woff|svg|json)/, _cors["default"]);
  app.use(_webpackStatic["default"]);
  app.use('*.html', (0, _htmlCompiler["default"])(process.cwd()));
  app.use((0, _serveIndex["default"])(process.cwd()));
  app.use((0, _serveStatic["default"])(process.cwd(), {
    index: false
  }));
  app.use((0, _compiler["default"])(options));
}

;