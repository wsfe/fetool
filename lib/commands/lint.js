'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = lint;

var _standard = require('standard');

var _standard2 = _interopRequireDefault(_standard);

var _eslintFriendlyFormatter = require('eslint-friendly-formatter');

var _eslintFriendlyFormatter2 = _interopRequireDefault(_eslintFriendlyFormatter);

var _project = require('../models/project');

var _project2 = _interopRequireDefault(_project);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import chalk from 'chalk';
// import table from 'text-table';
// import stripAnsi from 'strip-ansi'
function lint(program) {
  program
    .command('lint')
    .description('检测代码')
    .action(function () {
      var project = new _project2.default(process.cwd(), ENV.PRD);
      var lintConfig = project.userConfig.lint || {};
      var opts = lintConfig.opts || {};
      opts.cwd = sysPath.join(process.cwd(), lintConfig.cwd ? lintConfig.cwd : 'src');
      spinner.text = 'start lint';
      _standard2.default.lintFiles([], opts, function (err, results) {
        spinner.stop();
        if (err) {
          error(err);
          process.exit(1);
        }
        var parseResult = (0, _eslintFriendlyFormatter2.default)(results.results);
        if (parseResult) {
          console.log(parseResult);
        } else {
          success('lint success');
        }
        process.exit();
      });
  });
}