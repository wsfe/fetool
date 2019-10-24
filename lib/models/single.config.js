"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _config = _interopRequireDefault(require("./config"));

var _webpackMerge = _interopRequireDefault(require("webpack-merge"));

var _lodash = _interopRequireDefault(require("lodash"));

var _extractTextWebpackPlugin = _interopRequireDefault(require("extract-text-webpack-plugin"));

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

var SingleConfig =
/*#__PURE__*/
function (_Config) {
  _inherits(SingleConfig, _Config);

  function SingleConfig(project) {
    var _this;

    _classCallCheck(this, SingleConfig);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(SingleConfig).call(this, project));

    _this.setWebpackConfig(_this.extendConfig.webpackConfig);

    return _this;
  }

  _createClass(SingleConfig, [{
    key: "setWebpackConfig",
    value: function setWebpackConfig() {
      var webpackConfig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (_typeof(webpackConfig) === 'object') {
        (0, _webpackMerge["default"])(this.baseConfig, webpackConfig);
      } else if (typeof webpackConfig === 'function') {
        this.baseConfig = webpackConfig.call(this, this.baseConfig, {
          env: this.NODE_ENV,
          plugins: {
            ExtractTextPlugin: _extractTextWebpackPlugin["default"]
          }
        }, this);
      } else {
        error('webpackConfig 设置错误');
        return;
      }

      this.fixContext(this.baseConfig);
      this.fixAlias(this.baseConfig);
      this.fixOutput(this.baseConfig);
    }
  }]);

  return SingleConfig;
}(_config["default"]);

var _default = SingleConfig;
exports["default"] = _default;