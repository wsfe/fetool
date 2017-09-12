'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _utils = require('../utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var INCLUDE_REG = /<include\s+(.*\s)?src\s*=\s*"(\S+)".*><\/include>/g;

var HtmlCompiler = function () {
  function HtmlCompiler(cwd, outputPath) {
    _classCallCheck(this, HtmlCompiler);

    this.cwd = cwd;
    this.outputPath = outputPath;
  }

  _createClass(HtmlCompiler, [{
    key: 'apply',
    value: function apply(compiler) {
      var _this = this;

      compiler.plugin('after-emit', function (compilation, callback) {
        var sourcePath = sysPath.join(_this.cwd, _this.outputPath); // 待编译的地址，相对于webpack配置的contex这个字段
        var dist = sysPath.join(compiler.options.output.path, 'html'); // 默认存放到html文件夹
        fs.copy(sourcePath, dist, function (err) {
          if (err) {
            error('compile html failed:');
            callback(err);
          } else {
            try {
              _utils2.default.fs.readFileRecursiveSync(dist, ['html', 'htm'], function (filePath, content) {
                content = content.toString();
                var contentChange = false; // 默认内容没有更改
                content = content.replace(INCLUDE_REG, function ($0, $1, $2, $3) {
                  contentChange = true;
                  return fs.readFileSync(_url2.default.resolve(filePath, $2), 'utf8');
                });
                if (contentChange) {
                  // 如果内容更改了，那么就重写如文件里面
                  fs.writeFileSync(filePath, content);
                }
              });
              success('compile html success!');
            } catch (err) {
              compilation.errors.push(err);
            }
            callback();
          }
        });
      });
    }
  }]);

  return HtmlCompiler;
}();

exports.default = HtmlCompiler;