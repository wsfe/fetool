"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var CompilerLogger =
/*#__PURE__*/
function () {
  function CompilerLogger() {
    _classCallCheck(this, CompilerLogger);
  }

  _createClass(CompilerLogger, [{
    key: "apply",
    value: function apply(compiler) {
      compiler.hooks.done.tap('CompilerLoggerPlugin', function (stats) {
        var info = stats.toJson({
          errorDetails: false
        });

        if (stats.hasErrors()) {
          info.errors.map(function (err) {
            error(err + '\n');
          });
        }

        if (stats.hasWarnings()) {
          info.warnings.map(function (warning) {
            warn(warning + '\n');
          });
        }

        info.assets.map(function (asset) {
          var fileSize = asset.size;
          fileSize = fileSize > 1024 ? (fileSize / 1024).toFixed(2) + ' KB' : fileSize + ' Bytes';
          log("- ".concat(asset.name, " - ").concat(fileSize));
        });
      });
    }
  }]);

  return CompilerLogger;
}();

exports["default"] = CompilerLogger;