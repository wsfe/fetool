'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _webpackMerge = require('webpack-merge');

var _webpackMerge2 = _interopRequireDefault(_webpackMerge);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _extTemplatePath = require('../plugins/extTemplatePath');

var _extTemplatePath2 = _interopRequireDefault(_extTemplatePath);

var _extractTextWebpackPlugin = require('extract-text-webpack-plugin');

var _extractTextWebpackPlugin2 = _interopRequireDefault(_extractTextWebpackPlugin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Config = function () {
  function Config(cwd, configFile) {
    _classCallCheck(this, Config);

    this.cwd = cwd;
    this.configFile = configFile;
    this.entryGroups = {};
    this.entryExtNames = {
      css: ['.css', '.scss', '.sass', '.less'],
      js: ['.js', '.jsx', '.vue']
    };
    this.config = {
      context: sysPath.join(cwd, 'src'),
      entry: {},
      output: {
        local: {
          path: './prd/',
          filename: '[noextname][ext]',
          chunkFilename: '[id].chunk.js'
        },
        dev: {
          path: './dev/',
          filename: '[noextname][ext]',
          chunkFilename: '[id].chunk.js'
        },
        prd: {
          path: './prd/',
          filename: '[noextname]@[chunkhash][ext]',
          chunkFilename: '[id].chunk.min.js'
        }
      },
      module: {
        rules: [{
          test: /\.json$/,
          exclude: /node_modules/,
          use: ['json-loader']
        }, {
          test: /\.(html|string|tpl)$/,
          use: ['html-loader']
        }, {
          test: /\.css$/,
          // use: ['style-loader', 'css-loader']
          use: _extractTextWebpackPlugin2.default.extract({
            fallback: require.resolve('style-loader'),
            use: require.resolve('css-loader')
          })
        }, {
          test: /\.less$/,
          // use: ['style-loader', 'css-loader', 'less-loader']
          use: _extractTextWebpackPlugin2.default.extract({
            fallback: require.resolve('style-loader'),
            use: [require.resolve('css-loader'), require.resolve('less-loader')]
          })
        }]
      },
      plugins: [new _extractTextWebpackPlugin2.default({
        filename: 'sytle.css',
        allChunks: true
      }), new _extTemplatePath2.default({
        entryExtNames: this.entryExtNames
      })],
      resolve: {
        extensions: ['*', '.js', '.css', '.json', '.string', '.tpl'],
        alias: {}
      },
      devtool: 'cheap-source-map'
    };
    this.readConfig();
  }

  _createClass(Config, [{
    key: 'getUserConfig',
    value: function getUserConfig(module) {
      delete require.cache[require.resolve(module)];
      return require(module);
    }
  }, {
    key: 'readConfig',
    value: function readConfig() {
      var userConfig = this.getUserConfig(this.configFile);
      if (!userConfig) {
        console.error('请设置配置文件');
        return this;
      }
      this.setEntryExtNames(userConfig.entryExtNames);
      var extendConfig = userConfig.config;
      if (typeof extendConfig === 'function') {
        extendConfig = extendConfig.call(this, this.cwd);
      }
      if ((typeof extendConfig === 'undefined' ? 'undefined' : _typeof(extendConfig)) !== 'object') {
        console.error('设置有误，请参考文档');
        return this;
      }

      this.setWebpackConfig(extendConfig.webpackConfig);
      this.setExports(extendConfig.exports);
    }
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
            _this.config.entry[name] = _this.fixEntryPath(entry);
          });
        } else if (_lodash2.default.isPlainObject(entries)) {
          Object.keys(entries).forEach(function (name) {
            if (sysPath.extname(name) !== '.js') {
              _this.config.entry[name + '.js'] = entries[name];
            } else {
              _this.config.entry[name] = entries[name];
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
    key: 'setWebpackConfig',
    value: function setWebpackConfig() {
      var _this2 = this;

      var webpackConfig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if ((typeof webpackConfig === 'undefined' ? 'undefined' : _typeof(webpackConfig)) === 'object') {
        (0, _webpackMerge2.default)(this.config, webpackConfig);
      } else if (typeof webpackConfig === 'function') {
        this.config = webpackConfig(this.config);
      } else {
        console.error('webpackConfig 设置错误');
        return;
      }

      // 处理 context
      if (this.config.context && !sysPath.isAbsolute(this.config.context)) {
        this.config.context = sysPath.join(this.cwd, this.config.context);
      }

      // 处理 alias
      if (this.config.resolve.alias) {
        var alias = this.config.resolve.alias;
        Object.keys(alias).forEach(function (name) {
          alias[name] = sysPath.join(_this2.cwd, alias[name]);
        });
      }

      var output = this.config.output;
      Object.keys(output).forEach(function (env) {
        var op = output[env];
        if (op.path && !sysPath.isAbsolute(op.path)) {
          op.path = sysPath.join(_this2.cwd, op.path);
        }
      });
    }
  }, {
    key: 'getConfig',
    value: function getConfig(env) {
      var config = _lodash2.default.cloneDeep(this.config);
      config.output = config.output[env];
      var isExitExtractTextPlugin = config.plugins.some(function (plugin) {
        return plugin instanceof _extractTextWebpackPlugin2.default;
      });
      if (!isExitExtractTextPlugin) {
        config.plugins.push(new _extractTextWebpackPlugin2.default(config.output.filename.replace('[ext]', '.css')));
      }
      return config;
    }
  }]);

  return Config;
}();

exports.default = Config;