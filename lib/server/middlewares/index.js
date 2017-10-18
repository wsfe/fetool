'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initMiddlewares;

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _serveStatic = require('serve-static');

var _serveStatic2 = _interopRequireDefault(_serveStatic);

var _serveIndex = require('serve-index');

var _serveIndex2 = _interopRequireDefault(_serveIndex);

var _compiler = require('./compiler');

var _compiler2 = _interopRequireDefault(_compiler);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _htmlCompiler = require('./htmlCompiler');

var _htmlCompiler2 = _interopRequireDefault(_htmlCompiler);

var _mock = require('./mock');

var _mock2 = _interopRequireDefault(_mock);

var _cors = require('./cors');

var _cors2 = _interopRequireDefault(_cors);

var _webpackStatic = require('./webpackStatic');

var _webpackStatic2 = _interopRequireDefault(_webpackStatic);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function initMiddlewares(app, options) {
  var mockInstance = new _mock2.default(process.cwd());
  app.use(_logger2.default);
  app.use(/.*\.(html|eot|ttf|woff|svg|json)/, _cors2.default);
  app.use(_webpackStatic2.default);
  app.use(mockInstance.loadRules.bind(mockInstance));
  app.use(mockInstance.mockData.bind(mockInstance));
  app.use('*.html', (0, _htmlCompiler2.default)(process.cwd()));
  app.use((0, _serveIndex2.default)(process.cwd()));
  app.use((0, _serveStatic2.default)(process.cwd(), {
    index: false
  }));
  app.use((0, _compiler2.default)(options));
};