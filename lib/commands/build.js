'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = build;

var _services = require('../services');

function build(program) {
  program.command('build').description('线上编译').option('-a, --analyze', '启用分析').action(function (options) {
    var project = _services.projectService.getProject(process.cwd(), ENV.PRD, false);
    project.build(options);
  });
};