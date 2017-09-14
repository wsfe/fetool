'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FILE_NAME_REG = /^([^\@]*)\@?([^\.]+)(\.(js|css))$/;

var Version = function () {
  function Version(verFilePath, entryExtNames) {
    _classCallCheck(this, Version);

    this.verFilePath = verFilePath;
    this.entryExtNames = entryExtNames;
    this.versions = [];
  }

  _createClass(Version, [{
    key: 'getKey',
    value: function getKey(fileParse) {
      var _this = this;

      var name = '',
          extName = fileParse.ext || '.js';
      Object.keys(this.entryExtNames).forEach(function (key) {
        if (_this.entryExtNames[key].indexOf(extName) > -1) {
          name = sysPath.join(fileParse.dir, fileParse.name + '.' + key);
        }
      });
      return name;
    }
  }, {
    key: 'apply',
    value: function apply(compiler) {
      var _this2 = this;

      compiler.plugin('after-emit', function (compilation, callback) {
        compilation.chunks.forEach(function (chunk) {
          if (!chunk.name) {
            return;
          }
          chunk.files.forEach(function (filename) {
            if (/\.js$/.test(filename) || /\.css$/.test(filename)) {
              var matchInfo = filename.match(FILE_NAME_REG),
                  key = matchInfo[1] + matchInfo[3],
                  hash = matchInfo[2];
              _this2.versions.push(key + '#' + hash);
            }
          });
        });
        fs.appendFile(sysPath.join(_this2.verFilePath, 'versions.mapping'), _this2.versions.join('\n') + '\n', function (err) {
          if (err) {
            compilation.errors.push(err);
          }
          callback();
        });
      });
    }
  }]);

  return Version;
}();

exports.default = Version;