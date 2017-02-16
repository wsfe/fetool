'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.run = run;

require('./global');

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _commands = require('./commands');

var _commands2 = _interopRequireDefault(_commands);

var _package = require('../package.json');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander2.default.version(_package.version).usage('测试[options] <package>');
(0, _commands2.default)(_commander2.default);

function run(argv) {
  if (!argv[2]) {
    // 如果没有其他命令的话
    _commander2.default.help();
    console.log();
    return;
  }
  _commander2.default.parse(argv);
};