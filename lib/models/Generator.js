"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _path = _interopRequireDefault(require("path"));

var _readMetadata = _interopRequireDefault(require("read-metadata"));

var _validateNpmPackageName = _interopRequireDefault(require("validate-npm-package-name"));

var _metalsmith = _interopRequireDefault(require("metalsmith"));

var _handlebars = _interopRequireDefault(require("handlebars"));

var _minimatch = _interopRequireDefault(require("minimatch"));

var _multimatch = _interopRequireDefault(require("multimatch"));

var _async = _interopRequireDefault(require("async"));

var _ask = _interopRequireDefault(require("../utils/ask"));

var _fs = require("fs");

var _child_process = require("child_process");

var _consolidate = require("consolidate");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

_handlebars["default"].registerHelper('if_eq', function (a, b, opts) {
  return a === b ? opts.fn(this) : opts.inverse(this);
});

_handlebars["default"].registerHelper('unless_eq', function (a, b, opts) {
  return a === b ? opts.inverse(this) : opts.fn(this);
});

var Generator =
/*#__PURE__*/
function () {
  function Generator() {
    _classCallCheck(this, Generator);
  }

  _createClass(Generator, [{
    key: "generate",

    /**
     * 根据模板生成项目
     * @param {*} name 项目名
     * @param {*} src 模板来源
     * @param {*} dest 目标文件夹
     */
    value: function generate(name, src, dest) {
      var _this = this;

      var options = this.getOptions(name, src);
      var metalsmith = (0, _metalsmith["default"])(_path["default"].join(src, 'template'));
      var data = Object.assign(metalsmith.metadata(), {
        destDirName: name,
        inPlace: dest === process.cwd(),
        noEscape: true
      }); // 注册helper

      this.registerHelper(options); // 执行metalsmith的before函数

      if (options.metalsmith && typeof options.metalsmith.before === 'function') {
        opts.metalsmith.before(metalsmith, opts);
      } // 加载中间件


      metalsmith.use(this.askQuestions(options.prompts)).use(this.filterFiles(options.filters)).use(this.renderTemplateFiles(options.skipInterpolation)); // 执行metalsmith函数，或者metalsmith after函数

      if (typeof options.metalsmith === 'function') {
        options.metalsmith(metalsmith, options);
      } else if (options.metalsmith && typeof options.metalsmith.after === 'function') {
        options.metalsmith.after(metalsmith, options);
      }

      return new Promise(function (resolve, reject) {
        metalsmith.clean(true).source('.').destination(dest).build(function (err, files) {
          if (err) {
            reject(err);
          } else {
            resolve();
            setTimeout(function () {
              // 让程序先执行回调
              _this.afterGenerate(data);
            });
          }
        });
      });
    }
  }, {
    key: "afterGenerate",
    value: function afterGenerate(data) {
      var _this2 = this;

      this.sortDependencies(data);

      if (data.autoInstall) {
        var cwd = _path["default"].join(process.cwd(), data.inPlace ? '' : data.destDirName);

        this.installDependencies(cwd, data.autoInstall).then(function () {
          return _this2.runLintFix(cwd, data);
        }).then(function () {
          success('项目初始化完毕!');
          process.exit();
        })["catch"](function (err) {
          error(err);
          process.exit(1);
        });
      } else {
        process.exit();
      }
    }
    /**
     * 根据配置注册helper
     */

  }, {
    key: "registerHelper",
    value: function registerHelper(options) {
      options.helpers && Object.keys(options.helpers).forEach(function (key) {
        _handlebars["default"].registerHelper(key, options.helpers[key]);
      });
    }
    /**
     * metalsmith中间件，用于询问meta配置中的prompts问题
     * @param prompts 问题
     */

  }, {
    key: "askQuestions",
    value: function askQuestions(prompts) {
      return function (files, metalsmith, done) {
        (0, _ask["default"])(prompts, metalsmith.metadata(), done);
      };
    }
    /**
     * metalsmith中间件，用于过滤meta配置中的filters文件
     * @param filters
     */

  }, {
    key: "filterFiles",
    value: function filterFiles(filters) {
      var _this3 = this;

      return function (files, metalsmith, done) {
        if (!filters) {
          return done();
        }

        var fileNames = Object.keys(files);
        var metalsmithMetadata = metalsmith.metadata();
        Object.keys(filters).forEach(function (glob) {
          fileNames.forEach(function (file) {
            if ((0, _minimatch["default"])(file, glob, {
              dot: true
            })) {
              var condition = filters[glob];

              if (!_this3.evaluate(condition, metalsmithMetadata)) {
                delete files[file];
              }
            }
          });
        });
        done();
      };
    }
    /**
     * metalsmith中间件，用于替换文件中的插值
     * @param skipInterpolation 跳过的文件名的匹配规则
     */

  }, {
    key: "renderTemplateFiles",
    value: function renderTemplateFiles(skipInterpolation) {
      skipInterpolation = typeof skipInterpolation === 'string' ? [skipInterpolation] : skipInterpolation;
      return function (files, metalsmith, done) {
        var keys = Object.keys(files);
        var metalsmithMetadata = metalsmith.metadata();

        _async["default"].each(keys, function (file, next) {
          // 根据规则跳过文件
          if (skipInterpolation && (0, _multimatch["default"])([file], skipInterpolation, {
            dot: true
          }).length) {
            return next();
          }

          var str = files[file].contents.toString(); // 没有插值的文件也不需要替换

          if (!/{{([^{}]+)}}/g.test(str)) {
            return next();
          }

          _consolidate.handlebars.render(str, metalsmithMetadata, function (err, res) {
            if (err) {
              err.message = "[".concat(file, "] ").concat(err.message);
              return next(err);
            }

            files[file].contents = new Buffer.from(res);
            next();
          });
        }, done);
      };
    }
    /**
     * 对package.js中的dependencies进行排序
     * @param data prompts（询问）中获取的数据
     */

  }, {
    key: "sortDependencies",
    value: function sortDependencies(data) {
      var packageJsonFile = _path["default"].join(data.inPlace ? '' : data.destDirName, 'package.json');

      var packageJson = JSON.parse(fs.readFileSync(packageJsonFile));
      packageJson.devDependencies = this.sortObject(packageJson.devDependencies);
      packageJson.dependencies = this.sortObject(packageJson.dependencies);
      fs.writeFileSync(packageJsonFile, JSON.stringify(packageJson, null, 2) + '\n');
    }
    /**
     * 安装依赖
     * @param cwd
     * @param executable
     */

  }, {
    key: "installDependencies",
    value: function installDependencies(cwd) {
      var executable = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'npm';
      log('正在安装依赖...');
      return this.runCommand(executable, ['install'], {
        cwd: cwd
      });
    }
    /**
     * 在项目中执行npm run lint --fix
     * @param cwd
     * @param data
     */

  }, {
    key: "runLintFix",
    value: function runLintFix(cwd, data) {
      if (data.lint) {
        log('正在执行eslint --fix');
        var args = data.autoInstall === 'npm' ? ['run', 'lint', '--', '--fix'] : ['run', 'lint', '--fix'];
        return this.runCommand(data.autoInstall, args, {
          cwd: cwd
        });
      }

      return Promise.resolve();
    }
    /**
     * 获取模板中的配置项
     * @param name 项目名
     * @param dir 模板所在文件夹
     */

  }, {
    key: "getOptions",
    value: function getOptions(name, dir) {
      var options = this.getMetadata(dir);
      this.setDefault(options, 'name', name);
      this.setNameValidator(options);
      var author = this.getGitUser();

      if (author) {
        this.setDefault(options, 'author', author);
      }

      return options;
    }
    /**
     * 设置选项的默认值
     * @param options 选项
     * @param key 属性
     * @param val 值
     */

  }, {
    key: "setDefault",
    value: function setDefault(options, key, val) {
      var prompts = options.prompts || (options.prompts = {});

      if (!prompts[key] || _typeof(prompts[key]) !== 'object') {
        prompts[key] = {
          type: 'string',
          "default": val
        };
      } else if (prompts[key]["default"] === undefined || prompts[key]["default"] === null) {
        prompts[key]["default"] = val;
      }
    }
    /**
     * 重载选项中name的验证函数，用于验证是否符合npm的包名称规则
     * @param options 选项
     */

  }, {
    key: "setNameValidator",
    value: function setNameValidator(options) {
      var name = options.prompts.name;
      var customValidate = name.validate;

      name.validate = function (name) {
        var its = (0, _validateNpmPackageName["default"])(name);

        if (!its.validForNewPackages) {
          var errors = (its.errors || []).concat(its.warning || []);
          return 'Sorry, ' + errors.join(' and ') + '.';
        }

        if (typeof customValidate === 'function') {
          return customValidate(name);
        }

        return true;
      };
    }
    /**
     * 获得模板中的meta数据，存放在meta.json或者meta.js
     * @param dir 模板所在文件夹
     */

  }, {
    key: "getMetadata",
    value: function getMetadata(dir) {
      var jsonFile = _path["default"].join(dir, 'meta.json');

      var jsFile = _path["default"].join(dir, 'meta.js');

      var metadata = {}; // 读取json文件

      if ((0, _fs.existsSync)(jsonFile)) {
        metadata = (0, _readMetadata["default"])(jsonFile);
      } // 读取js文件


      if ((0, _fs.existsSync)(jsFile)) {
        var data = require(_path["default"].resolve(jsFile));

        if (data !== Object(data)) {
          // 不是一个对象
          throw new Error('meta.js导出的不是个对象');
        }

        metadata = data;
      }

      return metadata;
    }
    /**
     * 拿到git config设置的name和email
     */

  }, {
    key: "getGitUser",
    value: function getGitUser() {
      var name;
      var email;

      try {
        name = (0, _child_process.execSync)('git config --get user.name');
        email = (0, _child_process.execSync)('git config --get user.email');
      } catch (e) {}

      name = name && JSON.stringify(name.toString().trim()).slice(1, -1);
      email = email && ' <' + email.toString().trim() + '>';
      return (name || '') + (email || '');
    }
    /**
     * 执行过滤语句
     * @param exp 语句
     * @param data 数据
     */

  }, {
    key: "evaluate",
    value: function evaluate(exp, data) {
      /* eslint-disable no-new-func */
      var fn = new Function('data', 'with (data) { return ' + exp + '}');

      try {
        return fn(data);
      } catch (e) {
        error('在执行过滤语句的时候出错: ' + exp);
      }
    }
    /**
     * 对对象的属性进行排序
     * 基于https://github.com/yarnpkg/yarn/blob/v1.3.2/src/config.js#L79-L85
     * @param object 对象
     */

  }, {
    key: "sortObject",
    value: function sortObject(object) {
      if (!object) return;
      var sortedObject = {};
      Object.keys(object).sort().forEach(function (item) {
        sortedObject[item] = object[item];
      });
      return sortedObject;
    }
    /**
     * 执行命令
     * @param cmd
     * @param args
     * @param options
     */

  }, {
    key: "runCommand",
    value: function runCommand(cmd, args, options) {
      return new Promise(function (resolve, reject) {
        var spwan = (0, _child_process.spawn)(cmd, args, Object.assign({
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

  return Generator;
}();

exports["default"] = Generator;