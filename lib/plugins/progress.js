"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _webpack = _interopRequireDefault(require("webpack"));

var _moment = _interopRequireDefault(require("moment"));

var _logSymbols = _interopRequireDefault(require("log-symbols"));

var _ora = _interopRequireDefault(require("ora"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Progress = function Progress() {
  _classCallCheck(this, Progress);

  var startTime = null;
  var endTime = null;
  var spinner = (0, _ora["default"])('building....').start();
  return new _webpack["default"].ProgressPlugin(function (percent, msg) {
    if (percent === 0) {
      startTime = Date.now();
    } else if (percent !== 1) {
      spinner.text = "progress:".concat(percent.toFixed(2));
    }

    if (percent === 1) {
      endTime = Date.now();
      var dateFormat = 'YY.MM.DD HH:mm:ss';
      var text = '\x1b[90m' + '[' + (0, _moment["default"])().format(dateFormat) + '] build complete in ' + (endTime - startTime) + 'ms.';
      spinner.succeed(_logSymbols["default"].info + text);
    }
  });
};

var _default = Progress;
exports["default"] = _default;