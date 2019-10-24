"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.run = run;

require("./global");

var _commander = _interopRequireDefault(require("commander"));

var _commands = _interopRequireDefault(require("./commands"));

var _package = require("../package.json");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

_commander["default"].version(_package.version).usage('ft2.0 开发工具');

(0, _commands["default"])(_commander["default"]);

function run(argv) {
  if (!argv[2]) {
    // 如果没有其他命令的话
    _commander["default"].help();

    return;
  }

  _commander["default"].parse(argv);
}

;