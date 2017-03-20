'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _logSymbols = require('log-symbols');

var _logSymbols2 = _interopRequireDefault(_logSymbols);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Progress = function Progress() {
  _classCallCheck(this, Progress);

  var startTime = null;
  var endTime = null;
  return new _webpack2.default.ProgressPlugin(function (percent, msg) {
    if (percent === 0) {
      spinner.text = 'building...';
      spinner.start();
      startTime = Date.now();
    }

    if (percent === 1) {
      endTime = Date.now();
      var dateFormat = 'YY.MM.DD HH:mm:ss';
      spinner.text = '\x1b[90m' + '[' + (0, _moment2.default)().format(dateFormat) + '] build complete in ' + (endTime - startTime) + 'ms.';
      spinner.stopAndPersist(_logSymbols2.default.info);
      spinner.text = '';
    }
  });
};

exports.default = new Progress();