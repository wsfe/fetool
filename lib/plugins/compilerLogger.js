'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CompilerLogger = function () {
  function CompilerLogger() {
    _classCallCheck(this, CompilerLogger);
  }

  _createClass(CompilerLogger, [{
    key: 'apply',
    value: function apply(compiler) {
      compiler.plugin('compile', function () {});
      compiler.plugin('done', function (stats) {
        var info = stats.toJson({ errorDetails: false });

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
          log('- ' + asset.name + ' - ' + fileSize);
        });
      });
    }
  }]);

  return CompilerLogger;
}();

exports.default = CompilerLogger;