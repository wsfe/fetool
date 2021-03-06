"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = pack;

var _project = _interopRequireDefault(require("../models/project"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function pack(program) {
  program.command('pack').description('打包代码').option('-e, --env [value]', '为某个env环境打包').option('-m, --min', '压缩混淆代码').option('-c, --compile [value]', '编译处理') // 编译处理一些比较特殊的文件，例如自定义的html文件
  .option('-p, --path [value]', '指定需要编译的特殊文件地址') // 编译处理文件的源码地址，如果是编译html，默认是'src/html'
  .action(function (options) {
    var cwd = process.cwd();
    var project = new _project["default"](cwd, ENV.DEV);

    if (options.env && !project.userConfig.servers[options.env]) {
      error(options.env, '环境不存在，请选择正确的发布环境');
      process.exit(1);
    }

    options.cwd = cwd;

    if (options.compile === true) {
      options.compile = 'html'; // 默认编译处理自定义的html。
    }

    if (options.compile && (options.path === true || !options.path)) {
      options.path = 'src/html';
    }

    project.pack(options);
  });
}

;