'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _webpackMerge = require('webpack-merge');

var _webpackMerge2 = _interopRequireDefault(_webpackMerge);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _extractTextWebpackPlugin = require('extract-text-webpack-plugin');

var _extractTextWebpackPlugin2 = _interopRequireDefault(_extractTextWebpackPlugin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SingleConfig = function (_Config) {
  _inherits(SingleConfig, _Config);

  function SingleConfig(project) {
    _classCallCheck(this, SingleConfig);

    var _this = _possibleConstructorReturn(this, (SingleConfig.__proto__ || Object.getPrototypeOf(SingleConfig)).call(this, project));

    _this.setDefaultModuleRules();
    _this.setWebpackConfig(_this.extendConfig.webpackConfig);
    return _this;
  }

  _createClass(SingleConfig, [{
    key: 'setDefaultModuleRules',
    value: function setDefaultModuleRules() {
      this.baseConfig.module.rules = _lodash2.default.concat(this.baseConfig.module.rules, [{
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
    }
  }, {
    key: 'setWebpackConfig',
    value: function setWebpackConfig() {
      var webpackConfig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if ((typeof webpackConfig === 'undefined' ? 'undefined' : _typeof(webpackConfig)) === 'object') {
        (0, _webpackMerge2.default)(this.baseConfig, webpackConfig);
      } else if (typeof webpackConfig === 'function') {
        this.baseConfig = webpackConfig.call(this, this.baseConfig, { env: this.NODE_ENV, plugins: { ExtractTextPlugin: _extractTextWebpackPlugin2.default } }, this);
      } else {
        error('webpackConfig 设置错误');
        return;
      }
      this.fixContext(this.baseConfig);
      this.fixAlias(this.baseConfig);
      this.fixOutput(this.baseConfig);
      this.fixPlugins();
    }
  }, {
    key: 'fixPlugins',
    value: function fixPlugins() {
      var isExitExtractTextPlugin = this.baseConfig.plugins.some(function (plugin) {
        // 判断是否是整个项目共用一个ExtractTextPlugin
        return plugin instanceof _extractTextWebpackPlugin2.default;
      });
      if (!isExitExtractTextPlugin) {
        var filename = 'base@[contenthash].css';
        if (this.NODE_ENV === ENV.LOC) {
          filename = 'base.css';
        } else if (this.NODE_ENV === ENV.DEV) {
          filename = 'base@dev.css';
        }
        this.baseConfig.plugins.push(new _extractTextWebpackPlugin2.default({
          filename: filename
        }));
      }
    }
  }]);

  return SingleConfig;
}(_config2.default);

exports.default = SingleConfig;