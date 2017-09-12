'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _uglifycss = require('uglifycss');

var _uglifycss2 = _interopRequireDefault(_uglifycss);

var _webpackSources = require('webpack-sources');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UglifyCSS = function () {
  function UglifyCSS(options) {
    _classCallCheck(this, UglifyCSS);
  }

  _createClass(UglifyCSS, [{
    key: 'apply',
    value: function apply(compiler) {
      compiler.plugin('emit', function (compilation, callback) {
        compilation.chunks.forEach(function (chunk) {
          chunk.files.forEach(function (fileName) {
            if (sysPath.extname(fileName) === '.css') {
              var file = compilation.assets[fileName];
              var code = _uglifycss2.default.processString(compilation.assets[fileName].source());
              compilation.assets[fileName] = new _webpackSources.RawSource(code);
            }
          });
        });
        callback();
      });
    }
  }]);

  return UglifyCSS;
}();

exports.default = UglifyCSS;