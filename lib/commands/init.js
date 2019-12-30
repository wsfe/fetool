"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = init;

var _Creator = _interopRequireDefault(require("../models/Creator"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function init(program) {
  program.command('init <projectName>').description('选择模板创建项目').option('-u, --url <url>', '指定模板下载地址').option('-c, --clone', '是否使用clone, 默认关闭').action(function (projectName, options) {
    var inCurrent = projectName === '.'; // 输入"."则在当前文件夹初始化项目

    var name = inCurrent ? _path["default"].relative('../', process.cwd()) : projectName; // 获取项目名，如果早当前文件夹创建，则取当前文件夹名称

    var destDir = _path["default"].resolve(process.cwd(), projectName || '.'); // 目标文件夹


    new _Creator["default"](name, destDir).create(options); // 开始初始化
  });
}