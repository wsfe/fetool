'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initMiddlewares;

var _compiler = require('./compiler');

var _compiler2 = _interopRequireDefault(_compiler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function initMiddlewares(app) {
  this.app.use(_compiler2.default);
};