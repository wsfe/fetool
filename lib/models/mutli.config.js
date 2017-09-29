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
    key: 'setWebpackConfig',
    value: function setWebpackConfig() {
      var webpackConfig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (typeof webpackConfig === 'function') {
        var result = webpackConfig.call(this, this.jsConfig, this.cssConfig, { env: this.NODE_ENV, plugins: { ExtractTextPlugin: _extractTextWebpackPlugin2.default } }, this);
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
  }, {
    key: 'getConfig',
    value: function getConfig(type) {
      var config = _lodash2.default.cloneDeep(this[(type || 'base') + 'Config']);
      return config;
    }
  }]);

  return MutliConfig;
}(_config2.default);

exports.default = MutliConfig;