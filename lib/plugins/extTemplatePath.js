"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var REGEXP_NO_EXT_NAME = /\[noextname\]/gi;
var REGEXP_EXT = /\[ext\]/gi;

var ExtTemplatePath =
/*#__PURE__*/
function () {
  function ExtTemplatePath(options) {
    _classCallCheck(this, ExtTemplatePath);

    this.entryExtNames = options.entryExtNames;
  }

  _createClass(ExtTemplatePath, [{
    key: "apply",
    value: function apply(compiler) {
      var _this = this;

      compiler.hooks.compilation.tap('ExtTemplatePathPlugin', function (compilation) {
        compilation.mainTemplate.hooks.assetPath.tap('AssetPath', function (filename, data) {
          var chunk = data.chunk;
          var extName = sysPath.extname(filename) || '.js';

          if (chunk && chunk.name) {
            var chunkName = chunk.name;

            for (var key in _this.entryExtNames) {
              var exts = _this.entryExtNames[key];

              if (exts.indexOf(extName) > -1) {
                extName = '.' + key;
                break;
              }
            } // 替换[name]为文件名，如index.js：[name][ext] => index[ext]


            filename = filename.replace(REGEXP_NO_EXT_NAME, chunkName.replace(/\.\w+$/g, ''));
          }

          return filename.replace(REGEXP_EXT, extName);
        });
      });
    }
  }]);

  return ExtTemplatePath;
}();

var _default = ExtTemplatePath;
exports["default"] = _default;