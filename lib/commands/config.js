'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = config;

var _rightPad = require('right-pad');

var _rightPad2 = _interopRequireDefault(_rightPad);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function config(program) {
  program.command('config [key] [value]').description('全局配置').action(function (key, value) {
    var globalConfig = JSON.parse(fs.readFileSync(FET_RC, { encoding: 'utf8' }));
    if (!key || !value) {
      // 如果没有带参数，默认显示所有配置
      Object.keys(globalConfig).forEach(function (k) {
        log((0, _rightPad2.default)(k, 6) + ' = ' + globalConfig[k]);
      });
      return;
    }
    if (key && value) {
      // 设置全局变量
      globalConfig[key] = value;
      fs.writeFileSync(FET_RC, JSON.stringify(globalConfig, null, '    '), 'UTF-8');
      success('set ', key, ':', value, ' success');
    } else {
      // 提示命令错误
      error('fet config [key] [value]\n');
    }
  });
};