'use strict';

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _ora = require('ora');

var _ora2 = _interopRequireDefault(_ora);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

global.fs = require('fs');
global.sysPath = require('path');

global.SINGLE_MODE = 'single';
global.MUTLI_MODE = 'mutli';

global.info = console.info;

global.spinner = (0, _ora2.default)();

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