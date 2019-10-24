"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * 对于多页面模式，我们需要删除生成css文件的时候，生成的多余js文件
 */
var CSSIgnoreJS =
/*#__PURE__*/
function () {
  function CSSIgnoreJS() {
    _classCallCheck(this, CSSIgnoreJS);
  }

  _createClass(CSSIgnoreJS, [{
    key: "apply",
    value: function apply(compiler) {
      compiler.hooks.emit.tapAsync('CSSIgnoreJSPlugin', function (compilation, callback) {
        var assets = {};
        Object.keys(compilation.assets).forEach(function (key) {
          if (!/.*\.js(\.map)?$/.test(key)) {
            // 如果不是js
            assets[key] = compilation.assets[key];
          }
        });
        compilation.assets = assets;
        callback();
      });
    }
  }]);

  return CSSIgnoreJS;
}();

var _default = CSSIgnoreJS;
exports["default"] = _default;