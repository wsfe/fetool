'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _computeCluster = require('compute-cluster');

var _computeCluster2 = _interopRequireDefault(_computeCluster);

var _shelljs = require('shelljs');

var _shelljs2 = _interopRequireDefault(_shelljs);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _single = require('./single.config');

var _single2 = _interopRequireDefault(_single);

var _mutli = require('./mutli.config');

var _mutli2 = _interopRequireDefault(_mutli);

var _progress = require('../plugins/progress');

var _progress2 = _interopRequireDefault(_progress);

var _webpackBundleAnalyzer = require('webpack-bundle-analyzer');

var _cssIgnoreJS = require('../plugins/cssIgnoreJS');

var _cssIgnoreJS2 = _interopRequireDefault(_cssIgnoreJS);

var _utils = require('../utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FILE_NAME_REG = /^([^\@]*)\@?([^\.]+)(\.(js|css))$/;
var INCLUDE_REG = /<include\s+(.*\s)?src\s*=\s*"(\S+)".*><\/include>/g;

var Project = function () {
  /**
   * Project 构造函数
   * @param {当前的工作目录} cwd 
   * @param {运行环境，'development或者production'} env 
   */
  function Project(cwd, env) {
    _classCallCheck(this, Project);

    this.cwd = cwd;
    this.NODE_ENV = env;
    this.configFile = sysPath.resolve(this.cwd, 'ft.config');
    var userConfig = this.getUserConfig(this.configFile);
    this.userConfig = userConfig;
    this.mode = userConfig.mode || MUTLI_MODE;
    if (this.mode === SINGLE_MODE) {
      this.config = new _single2.default(this);
    } else if (this.mode === MUTLI_MODE) {
      this.config = new _mutli2.default(this);
    }
  }

  _createClass(Project, [{
    key: 'getUserConfig',
    value: function getUserConfig(module) {
      delete require.cache[require.resolve(module)];
      return require(module);
    }

    /**
     * 
     * @param {cb: funtion, type: 'base|js|css'} cb，主要是对config进行再加工，type：主要是指定哪一种配置，分为三种，baseConfig,jsConfig,cssConfig
     */

  }, {
    key: 'getServerCompiler',
    value: function getServerCompiler() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          cb = _ref.cb,
          type = _ref.type;

      var config = {};
      if (this.mode === SINGLE_MODE) {
        config = this.getConfig('local');
      } else {
        config = this.getConfig('local', type);
      }
      if (_lodash2.default.isFunction(cb)) {
        config = cb(config);
      }
      config.plugins.push(_progress2.default);
      return (0, _webpack2.default)(config);
    }
  }, {
    key: 'getConfig',
    value: function getConfig(env, type) {
      return this.config.getConfig(env, type);
    }
  }, {
    key: 'pack',
    value: function pack(options) {
      var _this = this;

      spinner.text = 'start pack';
      spinner.start();
      var startTime = Date.now(); // 编译开始时间
      var outputPath = void 0;
      var promise = null;
      if (this.mode === SINGLE_MODE) {
        // 如果是单页模式
        var config = this.getConfig(options.min ? 'prd' : 'dev');
        outputPath = config.output.path;
        this._setPackConfig(config, options);
        this._setPublicPath(config, options.env);
        fs.removeSync(outputPath);
        promise = this._getPackPromise([config], options);
      } else {
        // 如果是多页模式
        var cssConfig = this.getConfig(options.min ? 'prd' : 'dev', 'css'),
            jsConfig = this.getConfig(options.min ? 'prd' : 'dev', 'js');
        outputPath = cssConfig.output.path;
        cssConfig.plugins.push(new _cssIgnoreJS2.default());
        this._setPackConfig(cssConfig, options);
        this._setPackConfig(jsConfig, options);
        this._setPublicPath(cssConfig, options.env);
        this._setPublicPath(jsConfig, options.env);
        fs.removeSync(outputPath); // cssConfig和jsConfig的out.path是一样的，所以只需要删除一次就行。
        promise = this._getPackPromise([cssConfig, jsConfig], options);
      }
      promise.then(function (statsArr) {
        _this.afterPack(statsArr, options);
        var packDuration = Date.now() - startTime > 1000 ? Math.floor((Date.now() - startTime) / 1000) + 's' : Date.now() - startTime + 'ms';
        log('Packing Finished in ' + packDuration + '.\n');
        if (!options.analyze) {
          // 如果需要分析数据，就不要退出进程
          process.exit(); // 由于编译html比编译js快，所以可以再这边退出进程。
        }
      }).catch(function (reason) {
        error(reason.stack || reason);
        if (reason.details) {
          error(reason.details);
        }
        process.exit();
      });

      if (options.compile === 'html') {
        // 如果需要编译html
        this._compileHtml(outputPath);
      }
    }
  }, {
    key: 'afterPack',
    value: function afterPack(statsArr, options) {
      var _this2 = this;

      statsArr.forEach(function (stats) {
        _this2._logPack(stats);
      });
      if (options.min) {
        this._generateVersion(statsArr);
      }
    }
  }, {
    key: '_generateVersion',
    value: function _generateVersion(statsArr) {
      var verPath = sysPath.join(this.cwd, 'ver');
      if (fs.existsSync(verPath)) {
        _shelljs2.default.rm('-rf', verPath);
      }
      _mkdirp2.default.sync(verPath);

      var versions = [];
      statsArr.forEach(function (stats) {
        var info = stats.toJson({ errorDetails: false });
        info.assets.map(function (asset) {
          var name = asset.name;
          if (/\.js$/.test(name) || /\.css$/.test(name)) {
            var matchInfo = name.match(FILE_NAME_REG),
                filePath = matchInfo[1] + matchInfo[3],
                version = matchInfo[2];
            versions.push(filePath + '#' + version);
          }
        });
      });
      fs.writeFileSync(sysPath.join(verPath, 'versions.mapping'), versions.join('\n'), 'UTF-8');
    }
  }, {
    key: '_logPack',
    value: function _logPack(stats) {
      var info = stats.toJson({ errorDetails: false });

      if (stats.hasErrors()) {
        info.errors.map(function (err) {
          error(err + '\n');
        });
      }

      if (stats.hasWarnings()) {
        info.warnings.map(function (warning) {
          warn(warning + '\n');
        });
      }

      info.assets.map(function (asset) {
        var fileSize = asset.size;
        fileSize = fileSize > 1024 ? (fileSize / 1024).toFixed(2) + ' KB' : fileSize + ' Bytes';
        log('- ' + asset.name + ' - ' + fileSize);
      });
    }
  }, {
    key: '_setPackConfig',
    value: function _setPackConfig(config, options) {
      config.devtool = '';
      // if (options.min) {
      //   config.devtool = '';
      // }
      config.plugins.push(_progress2.default);
      config.plugins.push(new _webpack2.default.optimize.ModuleConcatenationPlugin());
      if (options.analyze) {
        // 是否启用分析
        config.plugins.push(new _webpackBundleAnalyzer.BundleAnalyzerPlugin());
      }
    }
  }, {
    key: '_setPublicPath',
    value: function _setPublicPath(config, env) {
      var domain = env ? '' + this.userConfig.servers[env]['domain'] : '//img.chinanetcenter.com';
      config.output.publicPath = '' + domain + config.output.publicPath;
    }
  }, {
    key: '_getPackPromise',
    value: function _getPackPromise(configs, options) {
      var _this3 = this;

      var promises = [];
      var configsLen = configs.length;
      configs.forEach(function (config) {
        var promise = new Promise(function (resolve, reject) {
          (0, _webpack2.default)(config, function (err, stats) {
            configsLen--;
            if (configsLen === 0) {
              spinner.text = 'end pack';
              spinner.text = '';
              spinner.stop();
            }
            if (err) {
              reject(err);
              return;
            }
            if (options.min) {
              spinner.start();
              _this3._min(stats, config.output.path).then(function () {
                resolve(stats);
              });
            } else {
              resolve(stats);
            }
          });
        });

        promises.push(promise);
      });
      return Promise.all(promises);
    }

    /**
     * 压缩编译之后的代码代码
     * @param {编译之后的数据} stats 
     * @param {文件路径} cwd 
     */

  }, {
    key: '_min',
    value: function _min(stats, cwd) {

      var cc = new _computeCluster2.default({
        module: sysPath.resolve(__dirname, '../utils/uglifyWorker.js'),
        max_backlog: -1
      });
      var resolve = void 0;
      var promise = new Promise(function (res, rej) {
        resolve = res;
      });
      var assets = stats.toJson({
        errorDetails: false
      }).assets;
      var processToRun = assets.length;
      assets.forEach(function (asset) {
        cc.enqueue({
          cwd: cwd,
          assetName: asset.name
        }, function (err, response) {
          if (response.error) {
            spinner.text = '';
            spinner.stop();
            info('\n');
            spinner.text = 'error occured while minifying ' + response.error.assetName;
            spinner.fail();
            error('line: ' + response.error.line + ', col: ' + response.error.col + ' ' + response.error.message + ' \n');
            spinner.start();
          }
          processToRun--;
          spinner.text = '[Minify] ' + (assets.length - processToRun) + '/' + assets.length + ' assets';
          if (processToRun === 0) {
            cc.exit();
            spinner.stop();
            logWithTime('minify complete!');
            resolve();
          }
        });
      });

      return promise;
    }

    /**
     * 用来编译自定义的html
     * @param {输出路径} outputPath 
     */

  }, {
    key: '_compileHtml',
    value: function _compileHtml(outputPath) {
      var dist = sysPath.join(outputPath, 'html');
      fs.copy(sysPath.join(this.cwd, 'src/html'), dist, function (err) {
        if (err) {
          error('compile html failed:');
          error(err);
        } else {
          _utils2.default.fs.readFileRecursiveSync(dist, ['html', 'htm'], function (filePath, content) {
            content = content.toString();
            var contentChange = false; // 默认内容没有更改
            content = content.replace(INCLUDE_REG, function ($0, $1, $2, $3) {
              contentChange = true;
              return fs.readFileSync(_url2.default.resolve(filePath, $2), 'utf8');
            });
            if (contentChange) {
              // 如果内容更改了，那么就重写如文件里面
              fs.writeFileSync(filePath, content);
            }
          });
          success('compile html success!');
        }
      });
    }
  }, {
    key: 'build',
    value: function build(options) {
      this.pack(Object.assign({
        min: true
      }, options || {}));
    }
  }]);

  return Project;
}();

exports.default = Project;