"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var FILE_NAME_REG = /^([^\@]*)\@?([^\.]+)(\.(js|css))$/;

var Version =
/*#__PURE__*/
function () {
  function Version(verFilePath, entryExtNames) {
    _classCallCheck(this, Version);

    this.verFilePath = verFilePath;
    this.entryExtNames = entryExtNames;
    this.versions = [];
    this.versionsJson = {};
  }

  _createClass(Version, [{
    key: "getKey",
    value: function getKey(fileParse) {
      var _this = this;

      var name = '',
          extName = fileParse.ext || '.js';
      Object.keys(this.entryExtNames).forEach(function (key) {
        if (_this.entryExtNames[key].indexOf(extName) > -1) {
          name = sysPath.join(fileParse.dir, "".concat(fileParse.name, ".").concat(key));
        }
      });
      return name;
    }
  }, {
    key: "generateMapping",
    value: function generateMapping() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        fs.appendFile(sysPath.join(_this2.verFilePath, 'versions.mapping'), _this2.versions.join('\n') + '\n', function (err) {
          if (err) {
            reject(err);
          }

          resolve();
        });
      });
    }
  }, {
    key: "generateJson",
    value: function generateJson() {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        var filePath = sysPath.join(_this3.verFilePath, 'versions.json');
        fs.access(filePath, function (err) {
          if (err) {
            // 如果不存在
            fs.outputJson(filePath, _this3.versionsJson).then(function () {
              resolve();
            })["catch"](function (err) {
              reject(err);
            });
          } else {
            fs.readJson(filePath).then(function (existedVersions) {
              return fs.writeJson(filePath, Object.assign(existedVersions, _this3.versionsJson));
            }).then(function () {
              resolve();
            })["catch"](function (err) {
              reject(err);
            });
          }
        });
      });
    }
  }, {
    key: "apply",
    value: function apply(compiler) {
      var _this4 = this;

      compiler.hooks.afterEmit.tapAsync('VersionPlugin', function (compilation, callback) {
        compilation.chunks.forEach(function (chunk) {
          if (!chunk.name) {
            // 如果是异步加载形成的chunk，就不会有name这个属性，因此也不需要放到版本号表里面
            return;
          }

          chunk.files.forEach(function (filename) {
            // 如果是entry里面对象有样式文件（一般在多页应用中出现）,那么会存在chunk.files的长度为2，但是实际中有一个后缀为.js的文件是不存在的，当时在导出的时候已经把它给过滤了。例如：entry里面有个配置是styles/index.less，那么chunk.files的值为[styles/index@哈希值.js,styles/index@哈希值.css]这个时候styles/index@哈希值.js根本不存在compilation.assets里面，因此要删除
            if ((/\.js$/.test(filename) || /\.css$/.test(filename)) && compilation.assets[filename]) {
              var matchInfo = filename.match(FILE_NAME_REG),
                  key = matchInfo[1] + matchInfo[3],
                  hash = matchInfo[2];

              _this4.versions.push("".concat(key, "#").concat(hash));

              _this4.versionsJson[key] = hash;
            }
          });
        });
        Promise.all([_this4.generateMapping(), _this4.generateJson()]).then(function () {
          callback();
        })["catch"](function (err) {
          compilation.errors.push(err);
          callback();
        });
      });
    }
  }]);

  return Version;
}();

exports["default"] = Version;