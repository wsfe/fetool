'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = build;

var _services = require('../services');

function build(program) {
  program.command('build').description('线上编译').action(function () {
    var project = _services.projectService.getProject(process.cwd(), false);
    project.build(options);
  });
};