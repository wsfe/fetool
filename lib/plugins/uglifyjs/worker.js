'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.minify = minify;

var _uglifyJs = require('uglify-js');

var _uglifyJs2 = _interopRequireDefault(_uglifyJs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function minify(task, cb) {
  var result = _uglifyJs2.default.minify(task.source, task.uglifyOptions);
  if (result.error) {
    cb(result.error);
  } else {
    cb(null, result.code);
  }
}