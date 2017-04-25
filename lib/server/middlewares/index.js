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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function initMiddlewares(app, options) {
  app.use(_logger2.default);
  app.use((0, _serveIndex2.default)(process.cwd()));
  app.use((0, _serveStatic2.default)(process.cwd(), {
    index: false
  }));
  app.use((0, _compiler2.default)(options));
  // app.use(express.static(process.cwd(), {
  //   index: false,
  //   redirect: false
  // }));
};