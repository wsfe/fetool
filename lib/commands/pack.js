'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = pack;

var _services = require('../services');

function pack(program) {
  program.command('pack').description('打包代码').option('-m, --min', '压缩混淆代码').action(function (options) {
    var cwd = process.cwd();
    var project = _services.projectService.getProject(cwd, ENV.PRD, false);
    options.cwd = cwd;
    project.pack(options);
  });
};