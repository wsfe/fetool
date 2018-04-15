'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = init;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var path = require('path');
var fs = require('fs');
var download = require('download-git-repo');
var ora = require('ora');
var home = require('user-home');
var inquirer = require('inquirer');
var Metalsmith = require('metalsmith');
var match = require('minimatch');
var multimatch = require('multimatch');
var async = require('async');
var Handlebars = require('handlebars');
var render = require('consolidate').handlebars.render;
var rm = require('rimraf').sync;
var spawn = require('child_process').spawn;

var ask = require('../utils/ask');
var evaluate = require('../utils/eval');
var getOptions = require('../utils/options');
var exists = fs.existsSync;
var templatePath = 'wsfe/vue-template#test';
// const tmpPath = path.join(home, '.fet-templates/vue')
var tmpPath = path.join(home, 'Documents/git/vue-template');

function init(program) {
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
      // const spinner = ora('download template...')
      // spinner.start()
      // Remove if local template exists
      // if (exists(tmpPath)) rm(tmpPath)
      // download(templatePath, tmpPath, { clone }, err => {
      //   spinner.stop()
      //   if (err) {
      //     error(err)
      //     process.exit(1)
      //   }
      new Generate().generate(projectName, tmpPath, to, function (err) {
        if (err) {
          error(err);
          process.exit(1);
        }
        success('Generate success');
      });
      // })
    }
  });
}

// register handlebars helper
Handlebars.registerHelper('if_eq', function (a, b, opts) {
  return a === b ? opts.fn(this) : opts.inverse(this);
});

Handlebars.registerHelper('unless_eq', function (a, b, opts) {
  return a === b ? opts.inverse(this) : opts.fn(this);
});

var Generate = function () {
  function Generate() {
    _classCallCheck(this, Generate);
  }

  _createClass(Generate, [{
    key: 'generate',

    /**
     * Generate a template given a `src` and `dest`.
     *
     * @param {String} name
     * @param {String} src
     * @param {String} dest
     * @param {Function} done
     */
    value: function generate(name, src, dest, done) {
      var _this = this;

      var opts = getOptions(name, src);
      var metalsmith = Metalsmith(path.join(src, 'template'));
      var data = Object.assign(metalsmith.metadata(), {
        destDirName: name,
        inPlace: dest === process.cwd(),
        noEscape: true
      });

      opts.helpers && Object.keys(opts.helpers).map(function (key) {
        Handlebars.registerHelper(key, opts.helpers[key]);
      });

      metalsmith.use(this.askQuestions(opts.prompts)).use(this.filterFiles(opts.filters)).use(this.renderTemplateFiles(opts.skipInterpolation)).clean(true).source('.').destination(dest).build(function (err, files) {
        done(err);
        _this.sortDependencies(data);
        console.log(data.lint, data.autoInstall);
        if (data.autoInstall) {
          var cwd = path.join(process.cwd(), data.inPlace ? '' : data.destDirName);
          _this.installDependencies(cwd, data.autoInstall).then(function () {
            return _this.runLintFix(cwd, data);
          }).then(function () {
            success('Project initialization finished!');
          }).catch(function (err) {
            error(err);
          });
        }
      });

      return data;
    }

    /**
     * Create a middleware for asking questions.
     *
     * @param {Object} prompts
     * @return {Function}
     */

  }, {
    key: 'askQuestions',
    value: function askQuestions(prompts) {
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

  }, {
    key: 'filterFiles',
    value: function filterFiles(filters) {
      return function (files, metalsmith, done) {
        if (!filters) {
          return done();
        }
        var fileNames = Object.keys(files);
        var metalsmithMetadata = metalsmith.metadata();
        Object.keys(filters).forEach(function (glob) {
          fileNames.forEach(function (file) {
            if (match(file, glob, { dot: true })) {
              var condition = filters[glob];
              if (!evaluate(condition, metalsmithMetadata)) {
                delete files[file];
              }
            }
          });
        });
        done();
      };
    }

    /**
     * Template in place plugin.
     *
     * @param {String || Array} skipInterpolation 跳过的文件名的匹配规则
     * @return {Function}
     */

  }, {
    key: 'renderTemplateFiles',
    value: function renderTemplateFiles(skipInterpolation) {
      skipInterpolation = typeof skipInterpolation === 'string' ? [skipInterpolation] : skipInterpolation;
      return function (files, metalsmith, done) {
        var keys = Object.keys(files);
        var metalsmithMetadata = metalsmith.metadata();
        async.each(keys, function (file, next) {
          // skipping files with skipInterpolation option
          if (skipInterpolation && multimatch([file], skipInterpolation, { dot: true }).length) {
            return next();
          }
          var str = files[file].contents.toString();
          // do not attempt to render files that do not have mustaches
          if (!/{{([^{}]+)}}/g.test(str)) {
            return next();
          }
          render(str, metalsmithMetadata, function (err, res) {
            if (err) {
              err.message = '[' + file + '] ' + err.message;
              return next(err);
            }
            files[file].contents = new Buffer(res);
            next();
          });
        }, done);
      };
    }

    /**
     * Sorts dependencies in package.json alphabetically.
     * They are unsorted because they were grouped for the handlebars helpers
     * @param {object} data Data from questionnaire
     */

  }, {
    key: 'sortDependencies',
    value: function sortDependencies(data) {
      var packageJsonFile = path.join(data.inPlace ? '' : data.destDirName, 'package.json');
      var packageJson = JSON.parse(fs.readFileSync(packageJsonFile));
      packageJson.devDependencies = this.sortObject(packageJson.devDependencies);
      packageJson.dependencies = this.sortObject(packageJson.dependencies);
      fs.writeFileSync(packageJsonFile, JSON.stringify(packageJson, null, 2) + '\n');
    }
  }, {
    key: 'sortObject',
    value: function sortObject(object) {
      // Based on https://github.com/yarnpkg/yarn/blob/v1.3.2/src/config.js#L79-L85
      var sortedObject = {};
      Object.keys(object).sort().forEach(function (item) {
        sortedObject[item] = object[item];
      });
      return sortedObject;
    }

    /**
     * Runs `npm install` in the project directory
     * @param {string} cwd Path of the created project directory
     * @param {object} data Data from questionnaire
     */

  }, {
    key: 'installDependencies',
    value: function installDependencies(cwd) {
      var executable = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'npm';
      var color = arguments[2];

      console.log('Installing project dependencies ...');
      return this.runCommand(executable, ['install'], {
        cwd: cwd
      });
    }

    /**
     * Runs `npm run lint -- --fix` in the project directory
     * @param {string} cwd Path of the created project directory
     * @param {object} data Data from questionnaire
     */

  }, {
    key: 'runLintFix',
    value: function runLintFix(cwd, data, color) {
      if (data.lint) {
        console.log('Running eslint --fix to comply with chosen preset rules...');
        var args = data.autoInstall === 'npm' ? ['run', 'lint', '--', '--fix'] : ['run', 'lint', '--fix'];
        return this.runCommand(data.autoInstall, args, {
          cwd: cwd
        });
      }
      return Promise.resolve();
    }

    /**
     * Spawns a child process and runs the specified command
     * By default, runs in the CWD and inherits stdio
     * Options are the same as node's child_process.spawn
     * @param {string} cmd
     * @param {array<string>} args
     * @param {object} options
     */

  }, {
    key: 'runCommand',
    value: function runCommand(cmd, args, options) {
      return new Promise(function (resolve, reject) {
        var spwan = spawn(cmd, args, Object.assign({
          cwd: process.cwd(),
          stdio: 'inherit',
          shell: true
        }, options));

        spwan.on('exit', function () {
          resolve();
        });
      });
    }
  }]);

  return Generate;
}();