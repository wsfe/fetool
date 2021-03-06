"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = config;

var _rightPad = _interopRequireDefault(require("right-pad"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function config(program) {
  program.command('config [key] [value]').description('全局配置').action(function (key, value) {
    var globalConfig = JSON.parse(fs.readFileSync(FET_RC, {
      encoding: 'utf8'
    }));

    if (!key || !value) {
      // 如果没有带参数，默认显示所有配置
      Object.keys(globalConfig).forEach(function (k) {
        log("".concat((0, _rightPad["default"])(k, 6), " = ").concat(globalConfig[k]));
      });
      process.exit();
    }

    if (key && value) {
      // 设置全局变量
      globalConfig[key] = value;
      fs.writeFileSync(FET_RC, JSON.stringify(globalConfig, null, '    '), 'UTF-8');
      success('set ', key, ':', value, ' success');
      process.exit();
    } else {
      // 提示命令错误
      error('fet config [key] [value]\n');
      process.exit(1);
    }
  });
}

;