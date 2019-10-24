"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = lint;

var _standard = _interopRequireDefault(require("standard"));

var _eslintFriendlyFormatter = _interopRequireDefault(require("eslint-friendly-formatter"));

var _project = _interopRequireDefault(require("../models/project"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function lint(program) {
  program.command('lint').description('检测代码').action(function () {
    var project = new _project["default"](process.cwd(), ENV.PRD);
    var lintConfig = project.userConfig.lint || {};
    var opts = lintConfig.opts || {};
    opts.cwd = sysPath.join(process.cwd(), lintConfig.cwd ? lintConfig.cwd : 'src');
    spinner.text = 'start lint';

    _standard["default"].lintFiles([], opts, function (err, results) {
      spinner.stop();

      if (err) {
        error(err);
        process.exit(1);
      }

      var parseResult = (0, _eslintFriendlyFormatter["default"])(results.results);

      if (parseResult) {
        console.log(parseResult);
      } else {
        success('lint success');
      }

      process.exit();
    });
  });
}