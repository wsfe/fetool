'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _morgan2.default)(':date :status :method :url :response-time');

function getStatus(status) {
  switch (true) {
    case status >= 500:
      return _chalk2.default.yellow(status);
    case status >= 400:
      return _chalk2.default.red(status);
    case status >= 200:
      return _chalk2.default.green(status);
    default:
      return _chalk2.default.gray(status);
  }
}

exports.default = (0, _morgan2.default)(function (tokens, req, res) {
  var now = _chalk2.default.gray('[' + (0, _moment2.default)().format('MM.DD HH:mm:ss') + ']');
  var status = getStatus(tokens.status(req, res));
  return [now, status, _chalk2.default.magenta(tokens.method(req, res)), tokens.url(req, res), _chalk2.default.gray(tokens['response-time'](req, res)), 'ms'].join(' ');
});