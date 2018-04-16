'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * 对于多页面模式，我们需要删除生成css文件的时候，生成的多余js文件
 */
var CSSIgnoreJS = function () {
  function CSSIgnoreJS() {
    _classCallCheck(this, CSSIgnoreJS);
  }

  _createClass(CSSIgnoreJS, [{
    key: 'apply',
    value: function apply(compiler) {
      compiler.plugin('emit', function (compilation, callback) {
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

exports.default = CSSIgnoreJS;