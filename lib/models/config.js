'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _extTemplatePath = require('../plugins/extTemplatePath');

var _extTemplatePath2 = _interopRequireDefault(_extTemplatePath);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Config = function () {
  function Config(project) {
    _classCallCheck(this, Config);

    var cwd = project.cwd;
    this.cwd = cwd;
    this.userConfig = project.userConfig;
    this.NODE_ENV = project.NODE_ENV;
    this.project = project;
    this.entryExtNames = {
      css: ['.css', '.scss', '.sass', '.less'],
      js: ['.js', '.jsx', '.vue']
    };
    // let projectName = process.platform === 'win32' ? cwd.split('\\').pop(): cwd.split('/').pop();
    var projectName = require(sysPath.join(cwd, 'package.json')).name;
    this.baseConfig = {
      context: sysPath.join(cwd, 'src'),
      entry: {},
      output: this._getOutputConfig(projectName, this.NODE_ENV),
      module: {
        rules: [{
          test: /\.json$/,
          exclude: /node_modules/,
          use: ['json-loader']
        }, {
          test: /\.(html|string|tpl)$/,
          use: ['html-loader']
        }]
      },
      plugins: [],
      resolve: {
        extensions: ['*', '.js', '.css', '.scss', '.json', '.string', '.tpl', '.vue'],
        alias: {}
      },
      devtool: 'cheap-source-map'
    };
    this.extendConfig = {};
    this.init();
  }

  _createClass(Config, [{
    key: 'init',
    value: function init() {
      this.setEntryExtNames(this.userConfig.entryExtNames);
      this.baseConfig.plugins.push(new _extTemplatePath2.default({
        entryExtNames: this.entryExtNames
      }));
      this.extendConfig = this.userConfig.config;
      if (typeof this.extendConfig === 'function') {
        this.extendConfig = this.extendConfig.call(this, this.cwd);
      }
      if (_typeof(this.extendConfig) !== 'object') {
        console.error('设置有误，请参考文档');
        return this;
      }
      this.setExports(this.extendConfig.exports);
      this.fixContext(this.baseConfig);
      this.fixOutput(this.baseConfig);
      // this.config = _.cloneDeep(this.baseConfig);
    }

    /**
     * 根据项目名称和编译环境获取output配置
     * @param {项目名称} projectName 
     * @param {编译环境：local，develop，product} env 
     */

  }, {
    key: '_getOutputConfig',
    value: function _getOutputConfig(projectName, env) {
      var _ENV$LOC$ENV$DEV$ENV$;

      return (_ENV$LOC$ENV$DEV$ENV$ = {}, _defineProperty(_ENV$LOC$ENV$DEV$ENV$, ENV.LOC, {
        path: './prd/',
        filename: '[noextname][ext]',
        chunkFilename: '[id].chunk.js',
        publicPath: '/' + projectName + '/prd/'
      }), _defineProperty(_ENV$LOC$ENV$DEV$ENV$, ENV.DEV, {
        path: './dev/',
        filename: '[noextname]@dev[ext]',
        chunkFilename: '[id].chunk@dev.js',
        publicPath: '/' + projectName + '/dev/'
      }), _defineProperty(_ENV$LOC$ENV$DEV$ENV$, ENV.PRD, {
        path: './prd/',
        filename: '[noextname]@[chunkhash][ext]',
        chunkFilename: '[id].chunk@[chunkhash].js',
        publicPath: '/' + projectName + '/prd/'
      }), _ENV$LOC$ENV$DEV$ENV$)[env];
    }

    /**
     * 设置扩展名映射，将一些特殊扩展名映射到相应的js和css对象里面
     * @param {需要输出的对象的扩展名} entryExtNames 
     */

  }, {
    key: 'setEntryExtNames',
    value: function setEntryExtNames(entryExtNames) {
      if (entryExtNames) {
        if (entryExtNames.js) {
          this.entryExtNames.js = _lodash2.default.concat(this.entryExtNames.js, entryExtNames.js);
          this.entryExtNames.js = _lodash2.default.uniq(this.entryExtNames.js);
        }
        if (entryExtNames.css) {
          this.entryExtNames.css = _lodash2.default.concat(this.entryExtNames.css, entryExtNames.css);
          this.entryExtNames.css = _lodash2.default.uniq(this.entryExtNames.css);
        }
      }
    }

    /**
     * 设置用户需要导出的对象，支持数组，支持map对象
     * @param {用户需要导出的文件对象} entries 
     */

  }, {
    key: 'setExports',
    value: function setExports(entries) {
      var _this = this;

      if (entries) {
        if (Array.isArray(entries)) {
          entries.forEach(function (entry) {
            var name = '';
            if (typeof entry === 'string') {
              name = _this.setEntryName(entry);
            } else if (Array.isArray(entry)) {
              name = _this.setEntryName(entry[entry.length - 1]);
            }
            _this.baseConfig.entry[name] = _this.fixEntryPath(entry);
          });
        } else if (_lodash2.default.isPlainObject(entries)) {
          Object.keys(entries).forEach(function (name) {
            if (sysPath.extname(name) !== '.js') {
              _this.baseConfig.entry[name + '.js'] = entries[name];
            } else {
              _this.baseConfig.entry[name] = entries[name];
            }
          });
        }
      } else {
        console.error('没有exports');
      }
    }
  }, {
    key: 'setEntryName',
    value: function setEntryName(name) {
      if (name.indexOf('./') === 0) {
        return name.substring(2);
      } else if (name[0] == '/') {
        return name.substring(1);
      }
      return name;
    }
  }, {
    key: 'fixEntryPath',
    value: function fixEntryPath(entry) {
      if (typeof entry === 'string') {
        return (/\w/.test(entry[0]) ? './' + entry : entry
        );
      } else if (Array.isArray(entry)) {
        entry = entry.map(function (value) {
          return (/\w/.test(value[0]) ? './' + value : value
          );
        });
      }
      return entry;
    }
  }, {
    key: 'getConfig',
    value: function getConfig() {
      var config = _lodash2.default.cloneDeep(this.baseConfig);
      return config;
    }

    // 处理 context

  }, {
    key: 'fixContext',
    value: function fixContext(config) {
      if (config.context && !sysPath.isAbsolute(config.context)) {
        config.context = sysPath.join(cwd, config.context);
      }
    }

    // 处理 alias

  }, {
    key: 'fixAlias',
    value: function fixAlias(config) {
      var _this2 = this;

      if (config.resolve.alias) {
        var alias = config.resolve.alias;
        Object.keys(alias).forEach(function (name) {
          if (!/^\w+.+/.test(alias[name])) {
            // 如果不是已相对路径或者绝对路径为开头的（一般就是查找安装的包，例如vue,lodash等）
            alias[name] = sysPath.resolve(_this2.cwd, alias[name]);
          }
        });
      }
    }

    // 处理output

  }, {
    key: 'fixOutput',
    value: function fixOutput(config) {
      var output = config.output;
      if (output.path && !sysPath.isAbsolute(output.path)) {
        output.path = sysPath.join(this.cwd, output.path);
      }
    }
  }, {
    key: 'getSourceType',
    value: function getSourceType(name) {
      var _this3 = this;

      var ext = sysPath.extname(name);
      var type = 'js';
      Object.keys(this.entryExtNames).forEach(function (extName) {
        var exts = _this3.entryExtNames[extName];
        if (exts.indexOf(ext) > -1) {
          type = extName;
        }
      });
      return type;
    }
  }]);

  return Config;
}();

exports.default = Config;