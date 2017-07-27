'use strict';

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _ora = require('ora');

var _ora2 = _interopRequireDefault(_ora);

var _logSymbols = require('log-symbols');

var _logSymbols2 = _interopRequireDefault(_logSymbols);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

global.fs = require('fs-extra');
global.sysPath = require('path');

global.SINGLE_MODE = 'single';
global.MUTLI_MODE = 'mutli';
global.ENV = {
  LOC: 'location', // 本地
  DEV: 'development', // 开发dev的时候
  PRD: 'production' // 线上
};

global.USER_HOME = process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'];
global.FET_RC = sysPath.join(USER_HOME, '.fetrc');

global.info = console.info;

global.spinner = (0, _ora2.default)().start();

global.success = function () {
  info(_chalk2.default.green(' √ ' + [].slice.call(arguments).join(' ')));
};

global.warn = function () {
  info(_chalk2.default.yellow(' ∆ ' + [].slice.call(arguments).join(' ')));
};

global.error = function () {
  info(_chalk2.default.bold.red(' X '), _chalk2.default.bold.red([].slice.call(arguments).join(' ')));
};

global.log = function () {
  console.log(_chalk2.default.cyan('[ft] '), [].slice.call(arguments).join(' '));
};

global.logWithTime = function () {
  info(_logSymbols2.default.info + ' [' + (0, _moment2.default)().format('YY.MM.DD HH:mm:ss') + '] ' + [].slice.call(arguments).join(' '));
};