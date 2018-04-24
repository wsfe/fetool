'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = init;

var _generate = require('../models/generate');

var _generate2 = _interopRequireDefault(_generate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var path = require('path');
var exists = require('fs').existsSync;
var download = require('download-git-repo');
var ora = require('ora');
var home = require('user-home');
var inquirer = require('inquirer');
var rm = require('rimraf').sync;

function init(program) {
  /**
   * Usage.
   */
  program.command('init [projectName]').description('generator a new project from template').option('-t, --type [value]', 'template type').option('-m, --multi', 'a multi-page application').option('-c, --clone', 'use git clone').action(function (rawName, cmd) {
    /**
     * Setting.
     */
    var inPlace = !rawName || rawName === '.';
    var projectName = inPlace ? path.relative('../', process.cwd()) : rawName;
    var to = path.resolve(projectName || '.');
    var type = cmd.type;
    var multi = cmd.multi;
    var clone = cmd.clone;

    /**
     * Padding.
     */
    if (inPlace || exists(to)) {
      inquirer.prompt([{
        type: 'confirm',
        message: inPlace ? 'Generate project in current directory?' : 'Target directory exists. Continue?',
        name: 'ok'
      }]).then(function (answers) {
        if (answers.ok) {
          run(type, multi);
        }
      }).catch(function (err) {
        error(err);
        process.exit(1);
      });
    } else {
      run(type, multi);
    }

    /**
     * download and generator project.
     */
    function run() {
      var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'vue';
      var multi = arguments[1];

      if (multi) type = 'multi';

      var templatePath = 'wsfe/fet-templates-' + type;
      var tmpPath = path.join(home, '.fet-templates/' + type);
      var spinner = ora('download template...');
      spinner.start();
      // Remove if local template exists
      if (exists(tmpPath)) rm(tmpPath);
      download(templatePath, tmpPath, { clone: clone }, function (err) {
        spinner.stop();
        if (err) {
          error(err);
          process.exit(1);
        }
        new _generate2.default().generate(projectName, tmpPath, to, function (err) {
          if (err) {
            error(err);
            process.exit(1);
          }
          success('Generate success');
        });
      });
    }
  });
}