'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = build;

var _project = require('../models/project');

var _project2 = _interopRequireDefault(_project);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function build(program) {
  program
    .command('build')
    .description('线上编译')
    .option('-e, --env [value]', '为某个env环境打包')
    .option('-a, --analyze', '启用分析')
    .option('-c, --cache [value]', '是否开启缓存,默认开启')
    .action(function (options) {
      var project = new _project2.default(process.cwd(), ENV.PRD);
      if (options.env && !project.userConfig.servers[options.env]) {
        error(options.env, '环境不存在，请选择正确的发布环境');
        process.exit(1);
      }
      if (options.cache === 'false') {
        options.cache = false;
      } else {
        options.cache = true;
      }
      project.build(options);
  });
};