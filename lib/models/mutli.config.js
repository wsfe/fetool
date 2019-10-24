"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _config = _interopRequireDefault(require("./config"));

var _webpack = _interopRequireDefault(require("webpack"));

var _lodash = _interopRequireDefault(require("lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var MutliConfig =
/*#__PURE__*/
function (_Config) {
  _inherits(MutliConfig, _Config);

  function MutliConfig(project) {
    var _this;

    _classCallCheck(this, MutliConfig);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(MutliConfig).call(this, project));
    _this.cssConfig = _lodash["default"].cloneDeep(_this.baseConfig);
    _this.jsConfig = _lodash["default"].cloneDeep(_this.baseConfig);

    _this.separateEntry();

    _this.setWebpackConfig(_this.extendConfig.webpackConfig);

    return _this;
  }
  /**
   * 将entry进行分类
   */


  _createClass(MutliConfig, [{
    key: "separateEntry",
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
    key: "setWebpackConfig",
    value: function setWebpackConfig() {
      var webpackConfig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (typeof webpackConfig === 'function') {
        var result = webpackConfig.call(this, this.jsConfig, this.cssConfig, {
          env: this.NODE_ENV,
          plugins: {},
          webpack: _webpack["default"]
        }, this);

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
    key: "getConfig",
    value: function getConfig(type) {
      var config = _lodash["default"].cloneDeep(this[(type || 'base') + 'Config']);

      return config;
    }
  }]);

  return MutliConfig;
}(_config["default"]);

var _default = MutliConfig;
exports["default"] = _default;