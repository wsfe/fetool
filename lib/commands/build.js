'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = build;

var _project = require('../models/project');

var _project2 = _interopRequireDefault(_project);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function build(program) {
  program.command('build').description('线上编译').option('-a, --analyze', '启用分析').action(function (options) {
    var project = new _project2.default(process.cwd(), ENV.PRD);
    project.build(options);
  });
};