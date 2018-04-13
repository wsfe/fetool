'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = init;
var path = require('path');
var fs = require('fs');
var download = require('download-git-repo');
var ora = require('ora');
var home = require('user-home');
var inquirer = require('inquirer');
var Metalsmith = require('metalsmith');
var rm = require('rimraf').sync;

var metadata = require('../config/init.meta');
var getGitUser = require('../utils/git-user');
var ask = require('../utils/ask');
var filter = require('../utils/filter');
var exists = fs.existsSync;
var templatePath = 'wsfe/vue-template';
var tmpPath = path.join(home, '.wsfe-templates/single');

function init(program) {
  /**
   * Usage.
   */
  program.command('init [projectName]').description('generator a new project from template').option('-c, --clone', 'use git clone').action(function (rawName, cmd) {
    /**
     * Setting.
     */
    var inPlace = !rawName || rawName === '.';
    var projectName = inPlace ? path.relative('../', process.cwd()) : rawName;
    var to = path.resolve(projectName || '.');
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
          run();
        }
      }).catch(function (err) {
        error(err);
        process.exit(1);
      });
    } else {
      run();
    }

    /**
     * download and generator project.
     */
    function run() {
      var spinner = ora('download template...');
      spinner.start();
      // Remove if local template exists
      if (exists(tmpPath)) rm(tmpPath);
      download(templatePath, tmpPath, { clone: clone }, function (err) {
        if (err) {
          spinner.stop();
          error('download failed');
          process.exit(1);
        }
        spinner.succeed();
        generate(projectName, tmpPath, to, function (err) {
          if (err) {
            error(err);
            process.exit(1);
          }
          console.log();
          success('Generated success');
        });
      });
    }

    /**
     * generate project
     */
    function generate(name, src, dest, done) {
      var opts = getOptions(name);
      var metalsmith = Metalsmith(src);
      var data = Object.assign(metalsmith.metadata(), {
        destDirName: name,
        inPlace: dest === process.cwd(),
        noEscape: true
      });

      metalsmith
      // .use(askQuestions(opts.prompts))
      // .use(filterFiles(opts.filters))
      .clean(false).source('.').destination(dest).build(function (err, files) {
        done(err);
        sortDependencies(data);
      });
    }

    /**
     * get options from meta
     */
    function getOptions(name) {
      var opts = metadata;
      opts.prompts.name.default = name;

      var author = getGitUser();
      if (author) {
        opts.prompts.author.default = author;
      }

      return opts;
    }

    /**
     * Create a middleware for asking questions.
     *
     * @param {Object} prompts
     * @return {Function}
     */

    function askQuestions(prompts) {
      return function (files, metalsmith, done) {
        ask(prompts, metalsmith.metadata(), done);
      };
    }

    /**
     * Create a middleware for filtering files.
     *
     * @param {Object} filters
     * @return {Function}
     */

    function filterFiles(filters) {
      return function (files, metalsmith, done) {
        filter(files, filters, metalsmith.metadata(), done);
      };
    }

    function sortDependencies(data) {
      var packageJsonFile = path.join(data.inPlace ? '' : data.destDirName, 'package.json');
      var packageJson = JSON.parse(fs.readFileSync(packageJsonFile));
      packageJson.devDependencies = sortObject(packageJson.devDependencies);
      packageJson.dependencies = sortObject(packageJson.dependencies);
      fs.writeFileSync(packageJsonFile, JSON.stringify(packageJson, null, 2) + '\n');
    }

    function sortObject(object) {
      // Based on https://github.com/yarnpkg/yarn/blob/v1.3.2/src/config.js#L79-L85
      var sortedObject = {};
      Object.keys(object).sort().forEach(function (item) {
        sortedObject[item] = object[item];
      });
      return sortedObject;
    }
  });
}