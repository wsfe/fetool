'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = pack;

var _services = require('../services');

function pack(program) {
  program.command('pack [env]').description('为[env]环境打包代码').option('-m, --min', '压缩混淆代码').option('-c, --compile [value]', '编译处理') // 编译处理一些比较特殊的文件，例如自定义的html文件
  .action(function (env, options) {
    var cwd = process.cwd();
    var project = _services.projectService.getProject(cwd, ENV.PRD, false);
    if (env && !project.userConfig.servers[env]) {
      error(env, '不存在，请选择正确的发布环境');
      process.exit(1);
    }
    options.cwd = cwd;
    options.env = env;
    if (options.compile === true) {
      options.compile = 'html'; // 默认编译处理自定义的html。
    }
    project.pack(options);
  });
};