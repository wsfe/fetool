'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _uglifyjs = require('./uglifyjs');

var _uglifyjs2 = _interopRequireDefault(_uglifyjs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * 参考webpack-parallel-uglify-plugin以及uglifyjs-webpack-plugin
 */
var Plugin = function () {
  function Plugin() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Plugin);

    this.options = _lodash2.default.merge({
      compress: {
        dead_code: true
      }
    });
  }

  _createClass(Plugin, [{
    key: 'apply',
    value: function apply(compiler) {
      var _this = this;

      compiler.plugin('emit', function (compilation, callback) {
        var tasks = [];
        Object.keys(compilation.assets).filter(function (filename) {
          return sysPath.extname(filename) === '.js';
        }).forEach(function (filename) {
          var asset = compilation.assets[filename];
          tasks.push({
            assetName: filename,
            source: asset.source(),
            uglifyOptions: _this.options
          });
        });
        new _uglifyjs2.default(compilation, tasks).minify().then(callback, callback);
      });
    }
  }]);

  return Plugin;
}();

exports.default = Plugin;