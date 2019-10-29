"use strict";

var _chalk = _interopRequireDefault(require("chalk"));

var _logSymbols = _interopRequireDefault(require("log-symbols"));

var _moment = _interopRequireDefault(require("moment"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

global.fs = require('fs-extra');
global.sysPath = require('path');
global.ENV = {
  LOC: 'location',
  // 本地
  DEV: 'development',
  // 开发dev的时候
  PRD: 'production' // 线上

};
global.USER_HOME = process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'];
global.FET_RC = sysPath.join(USER_HOME, '.fetrc');
global.info = console.info;

global.success = function () {
  info(_chalk["default"].green(' √ ' + [].slice.call(arguments).join(' ')));
};

global.warn = function () {
  info(_chalk["default"].yellow(' ∆ ' + [].slice.call(arguments).join(' ')));
};

global.error = function () {
  info(_chalk["default"].bold.red(' X '), _chalk["default"].bold.red([].slice.call(arguments).join(' ')));
};

global.log = function () {
  console.log(_chalk["default"].cyan('[ft] '), [].slice.call(arguments).join(' '));
};

global.logWithTime = function () {
  info(_logSymbols["default"].info + ' [' + (0, _moment["default"])().format('YY.MM.DD HH:mm:ss') + '] ' + [].slice.call(arguments).join(' '));
};