'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _shelljs = require('shelljs');

var _shelljs2 = _interopRequireDefault(_shelljs);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _single = require('./single.config');

var _single2 = _interopRequireDefault(_single);

var _mutli = require('./mutli.config');

var _mutli2 = _interopRequireDefault(_mutli);

var _plugins = require('../plugins');

var _webpackBundleAnalyzer = require('webpack-bundle-analyzer');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
      config.plugins.push(new _plugins.ProgressPlugin());
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
      spinner.text = 'start pack';
      spinner.start();
      var startTime = Date.now(),
          // 编译开始时间
      configs = this._getWebPackConfigs(options);
      (0, _webpack2.default)(configs, function (err, stats) {
        spinner.text = 'end pack';
        spinner.text = '';
        spinner.stop();
        if (err) {
          error(err.stack || err);
          if (err.details) {
            error(err.details);
          }
        }
        var packDuration = Date.now() - startTime > 1000 ? Math.floor((Date.now() - startTime) / 1000) + 's' : Date.now() - startTime + 'ms';
        log('Packing Finished in ' + packDuration + '.\n');
        if (!options.analyze) {
          // 如果需要分析数据，就不要退出进程
          process.exit(); // 由于编译html比编译js快，所以可以再这边退出进程。
        }
      });
    }
  }, {
    key: '_getWebPackConfigs',
    value: function _getWebPackConfigs(options) {
      var outputPath = void 0,
          configs = [];
      if (this.mode === SINGLE_MODE) {
        // 如果是单页模式
        var config = this.getConfig(options.min ? 'prd' : 'dev');
        outputPath = config.output.path;
        this._setPackConfig(config, options);
        this._setHtmlComplierPlugin(config, options);
        this._setPublicPath(config, options.env);
        fs.removeSync(outputPath);
        configs.push(config);
      } else {
        // 如果是多页模式
        var cssConfig = this.getConfig(options.min ? 'prd' : 'dev', 'css'),
            jsConfig = this.getConfig(options.min ? 'prd' : 'dev', 'js');
        outputPath = jsConfig.output.path;
        configs.push(jsConfig); // 默认会有js配置
        if (!_lodash2.default.isEmpty(cssConfig.entry)) {
          cssConfig.plugins.push(new _plugins.CssIgnoreJSPlugin());
          this._setPackConfig(cssConfig, options);
          this._setPublicPath(cssConfig, options.env);
          configs.push(cssConfig);
        }
        this._setPackConfig(jsConfig, options);
        this._setHtmlComplierPlugin(jsConfig, options);
        this._setPublicPath(jsConfig, options.env);
        fs.removeSync(outputPath); // cssConfig和jsConfig的out.path是一样的，所以只需要删除一次就行。
      }
      this._clearVersion();
      return configs;
    }

    /**
     * 清理版本号文件夹
     */

  }, {
    key: '_clearVersion',
    value: function _clearVersion() {
      var verPath = sysPath.join(this.cwd, 'ver');
      if (fs.existsSync(verPath)) {
        _shelljs2.default.rm('-rf', verPath);
      }
      _mkdirp2.default.sync(verPath);
    }
  }, {
    key: '_setPackConfig',
    value: function _setPackConfig(config, options) {
      config.devtool = '';
      // if (options.min) {
      //   config.devtool = '';
      // }
      config.plugins.push(new _plugins.ProgressPlugin());
      config.plugins.push(new _webpack2.default.optimize.ModuleConcatenationPlugin());
      config.plugins.push(new _plugins.CompilerLoggerPlugin());
      if (options.min) {
        config.plugins.push(new _plugins.UglifyJSPlugin());
        config.plugins.push(new _plugins.UglifyCSSPlugin());
        config.plugins.push(new _plugins.VersionPlugin(sysPath.join(this.cwd, 'ver'), this.config.entryExtNames));
      }
      if (options.analyze) {
        // 是否启用分析
        config.plugins.push(new _webpackBundleAnalyzer.BundleAnalyzerPlugin());
      }
    }
  }, {
    key: '_setHtmlComplierPlugin',
    value: function _setHtmlComplierPlugin(config, options) {
      if (options.compile === 'html') {
        config.plugins.push(new _plugins.HtmlCompilerPlugin(this.cwd, options.path));
      }
    }
  }, {
    key: '_setPublicPath',
    value: function _setPublicPath(config, env) {
      var domain = '//img.chinanetcenter.com';
      if (env) {
        // 如果指定了环境
        domain = '' + this.userConfig.servers[env]['domain'];
      } else {
        // 如果没有指定环境
        var globalConfig = JSON.parse(fs.readFileSync(FET_RC, { encoding: 'utf8' }));
        if (globalConfig.domain) {
          // 如果有设置全局的默认域名
          domain = globalConfig.domain;
        }
      }
      config.output.publicPath = '' + domain + config.output.publicPath;
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