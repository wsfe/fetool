'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = pack;

var _services = require('../services');

function pack(program) {
  program.command('pack').description('打包代码').action(function (options) {
    var project = _services.projectService.getProject(process.cwd(), false);
    project.pack(options);
  });
};