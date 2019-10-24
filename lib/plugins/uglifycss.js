"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _uglifycss = _interopRequireDefault(require("uglifycss"));

var _webpackSources = require("webpack-sources");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var UglifyCSS =
/*#__PURE__*/
function () {
  function UglifyCSS(options) {
    _classCallCheck(this, UglifyCSS);
  }

  _createClass(UglifyCSS, [{
    key: "apply",
    value: function apply(compiler) {
      compiler.hooks.emit.tapAsync('UglifyCSSPlugin', function (compilation, callback) {
        compilation.chunks.forEach(function (chunk) {
          chunk.files.forEach(function (filename) {
            if (sysPath.extname(filename) === '.css') {
              var file = compilation.assets[filename];

              var code = _uglifycss["default"].processString(file.source());

              compilation.assets[filename] = new _webpackSources.RawSource(code);
            }
          });
        });
        callback();
      });
    }
  }]);

  return UglifyCSS;
}();

var _default = UglifyCSS;
exports["default"] = _default;