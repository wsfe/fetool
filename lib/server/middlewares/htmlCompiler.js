'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (cwd) {
  return function (req, res, next) {
    var pathname = _url2.default.parse(req.originalUrl).pathname;
    fs.readFile(_path2.default.join(cwd, pathname), 'utf8', function (err, data) {
      if (err) {
        next(err);
      } else {
        var content = data.toString();
        content = content.replace(INCLUDE_REG, function ($0, $1, $2, $3) {
          return fs.readFileSync(_path2.default.join(cwd, _url2.default.resolve(pathname, $2)), 'utf8');
        });
        res.type('html').send(Buffer.from(content, 'utf8'));
      }
    });
  };
};

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 处理include标签，将include的内容替换成真实内容
 * @param {工作目录} cwd 
 */

var INCLUDE_REG = /<include\s+(.*\s)?src\s*=\s*"(\S+)".*><\/include>/g;