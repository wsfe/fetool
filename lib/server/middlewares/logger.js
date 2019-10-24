"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _morgan = _interopRequireDefault(require("morgan"));

var _moment = _interopRequireDefault(require("moment"));

var _chalk = _interopRequireDefault(require("chalk"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

(0, _morgan["default"])(':date :status :method :url :response-time');

function getStatus(status) {
  switch (true) {
    case status >= 500:
      return _chalk["default"].yellow(status);

    case status >= 400:
      return _chalk["default"].red(status);

    case status >= 200:
      return _chalk["default"].green(status);

    default:
      return _chalk["default"].gray(status);
  }
}

var _default = (0, _morgan["default"])(function (tokens, req, res) {
  var now = _chalk["default"].gray('[' + (0, _moment["default"])().format('MM.DD HH:mm:ss') + ']');

  var status = getStatus(tokens.status(req, res));
  return [now, status, _chalk["default"].magenta(tokens.method(req, res)), tokens.url(req, res), _chalk["default"].gray(tokens['response-time'](req, res)), 'ms'].join(' ');
});

exports["default"] = _default;