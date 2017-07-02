'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _extractTextWebpackPlugin = require('extract-text-webpack-plugin');

var _extractTextWebpackPlugin2 = _interopRequireDefault(_extractTextWebpackPlugin);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MutliConfig = function (_Config) {
  _inherits(MutliConfig, _Config);

  function MutliConfig(project) {
    _classCallCheck(this, MutliConfig);

    var _this = _possibleConstructorReturn(this, (MutliConfig.__proto__ || Object.getPrototypeOf(MutliConfig)).call(this, project));

    _this.cssConfig = _lodash2.default.cloneDeep(_this.baseConfig);
    _this.jsConfig = _lodash2.default.cloneDeep(_this.baseConfig);
    _this.setDefaultModuleRules();
    _this.separateEntry();
    _this.setWebpackConfig(_this.extendConfig.webpackConfig);
    return _this;
  }

  /**
   * 将entry进行分类
   */


  _createClass(MutliConfig, [{
    key: 'separateEntry',
    value: function separateEntry() {
      var _this2 = this;

      this.cssConfig.entry = {};
      this.jsConfig.entry = {};
      var entry = this.baseConfig.entry;
      Object.keys(entry).forEach(function (key) {
        var type = _this2.getSourceType(key);
        _this2[type + 'Config'].entry[key] = entry[key];
      });
    }
  }, {
    key: 'setDefaultModuleRules',
    value: function setDefaultModuleRules() {
      this.cssConfig.module.rules = _lodash2.default.concat(this.cssConfig.module.rules, [{
        test: /\.css$/,
        use: _extractTextWebpackPlugin2.default.extract({
          fallback: require.resolve('style-loader'),
          use: require.resolve('css-loader')
        })
      }, {
        test: /\.less$/,
        use: _extractTextWebpackPlugin2.default.extract({
          fallback: require.resolve('style-loader'),
          use: [require.resolve('css-loader'), require.resolve('less-loader')]
        })
      }, {
        test: /\.(scss|sass)$/,
        use: _extractTextWebpackPlugin2.default.extract({
          fallback: require.resolve('style-loader'),
          use: [require.resolve('css-loader'), require.resolve('sass-loader')]
        })
      }]);

      this.jsConfig.module.rules = _lodash2.default.concat(this.jsConfig.module.rules, [{
        test: /\.css$/,
        use: [require.resolve('style-loader'), require.resolve('css-loader')]
      }, {
        test: /\.less$/,
        use: [require.resolve('style-loader'), require.resolve('css-loader'), require.resolve('less-loader')]
      }, {
        test: /\.(scss|sass)$/,
        use: [require.resolve('style-loader'), require.resolve('css-loader'), require.resolve('sass-loader')]
      }]);
    }
  }, {
    key: 'setWebpackConfig',
    value: function setWebpackConfig() {
      var webpackConfig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (typeof webpackConfig === 'function') {
        var result = webpackConfig.call(this, this.jsConfig, this.cssConfig, this.NODE_ENV);
        if (result.jsConfig) {
          this.jsConfig = result.jsConfig;
        } else {
          this.jsConfig = result;
        }
        if (result.cssConfig) {
          this.cssConfig = result.cssConfig;
        }
      } else {
        console.error('webpackConfig 设置错误');
        return;
      }
      this.fixContext(this.jsConfig);
      this.fixAlias(this.jsConfig);
      this.fixOutput(this.jsConfig);

      this.fixContext(this.cssConfig);
      this.fixAlias(this.cssConfig);
      this.fixOutput(this.cssConfig);
    }

    /**
     * 
     * @param {配置文件} config 
     * @description 补充那些没有添加上去的插件，有可能jsconfig可以不需要，不过这里都添加上去了，之后如果出现bug，就需要处理。
     */

  }, {
    key: 'fixPlugins',
    value: function fixPlugins(config) {
      var isExitExtractTextPlugin = config.plugins.some(function (plugin) {
        return plugin instanceof _extractTextWebpackPlugin2.default;
      });
      if (!isExitExtractTextPlugin) {
        config.plugins.push(new _extractTextWebpackPlugin2.default(config.output.filename.replace('[ext]', '.css')));
      }
    }
  }, {
    key: 'getConfig',
    value: function getConfig(env, type) {
      var config = _lodash2.default.cloneDeep(this[(type || 'base') + 'Config']);
      config.output = config.output[env];
      this.fixPlugins(config);
      return config;
    }
  }]);

  return MutliConfig;
}(_config2.default);

exports.default = MutliConfig;