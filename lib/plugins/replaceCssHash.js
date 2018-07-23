'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HASH_REG = /@\w+/g;

function md5(content) {
  return _crypto2.default.createHash('md5').update(content).digest('hex');
}

var ReplaceCssHash = function () {
  function ReplaceCssHash() {
    _classCallCheck(this, ReplaceCssHash);
  }

  _createClass(ReplaceCssHash, [{
    key: 'apply',
    value: function apply(compiler) {
      compiler.plugin("emit", function (compilation, callback) {
        var needRemoveAssets = [];
        var assets = compilation.assets;
        compilation.chunks.forEach(function (chunk) {
          var filenames = [];
          chunk.files.forEach(function (filename) {
            if (sysPath.extname(filename) === '.css') {
              var file = compilation.assets[filename];
              var hash = md5(file.source());
              var renderedHash = hash.slice(0, 20);
              var newFilename = filename.replace(HASH_REG, function () {
                return '@' + renderedHash;
              });
              assets[newFilename] = file;
              filenames.push(newFilename);
              chunk.hash = hash;
              chunk.renderedHash = renderedHash;
              needRemoveAssets.push(filename);
            }
          });
          chunk.files = filenames;
        });
        assets = _lodash2.default.reduce(assets, function (result, value, key) {
          if (needRemoveAssets.indexOf(key) < 0) {
            result[key] = value;
          }
          return result;
        }, {});
        compilation.assets = assets;
        callback();
      });
    }
  }]);

  return ReplaceCssHash;
}();

exports.default = ReplaceCssHash;