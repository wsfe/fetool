'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = config;
function config(program) {
  program.command('config [key] [value]').description('全局配置').action(function (key, value) {
    if (!key || !value) {
      // 如果没有带参数，默认显示所有配置
      // todo 查看配置
      return;
    }
    if (key && value) {// 设置全局变量

    } else {
      // 提示命令错误
      error('fet config <[key] [value]\n');
    }
  });
};