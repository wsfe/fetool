'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var REGEXP_NO_EXT_NAME = /\[noextname\]/gi;
var REGEXP_EXT = /\[ext\]/gi;

var ExtTemplatePath = function () {
  function ExtTemplatePath(options) {
    _classCallCheck(this, ExtTemplatePath);

    this.entryExtNames = options.entryExtNames;
  }

  _createClass(ExtTemplatePath, [{
    key: 'apply',
    value: function apply(compiler) {
      var _this = this;

      compiler.plugin('compilation', function (compilation, params) {
        compilation.mainTemplate.plugin('asset-path', function (path, data) {
          var chunk = data.chunk;
          if (chunk && chunk.name) {
            var chunkName = chunk.name;
            var _extName = sysPath.extname(path) || '.js';
            for (var key in _this.entryExtNames) {
              var exts = _this.entryExtNames[key];
              if (exts.indexOf(_extName) > -1) {
                _extName = '.' + key;
                break;
              }
            }
            // 替换[name]为文件名，如index.js：[name][ext] => index[ext]
            path = path.replace(REGEXP_NO_EXT_NAME, chunkName.replace(/\.\w+$/g, ''));
          }
          return path.replace(REGEXP_EXT, extName);
        });
      });
    }
  }]);

  return ExtTemplatePath;
}();

exports.default = ExtTemplatePath;