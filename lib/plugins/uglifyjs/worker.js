'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _uglifyJs = require('uglify-js');

var _uglifyJs2 = _interopRequireDefault(_uglifyJs);

var _webpackSources = require('webpack-sources');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (task, cb) {
  return new Promise(function (resolve, reject) {
    var result = _uglifyJs2.default.minify(task.source, task.uglifyOptions);
    if (result.error) {
      error('task.assetName=============', task.assetName);
      cb(result.error);
      reject(result.error);
    } else {
      var source = new _webpackSources.RawSource(result.code);
      cb(null, source);
      resolve(source);
    }
  });
};