'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _uglifyJs = require('uglify-js');

var _uglifyJs2 = _interopRequireDefault(_uglifyJs);

var _uglifycss = require('uglifycss');

var _uglifycss2 = _interopRequireDefault(_uglifycss);

var _crypto = require('./crypto');

var _crypto2 = _interopRequireDefault(_crypto);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

process.on('message', function (message) {
  var cwd = message.cwd,
      assetName = message.assetName;
  var response = {};

  var extname = _path2.default.extname(assetName);
  if (extname === '.js' || extname === '.css') {
    var content = _fs2.default.readFileSync(_path2.default.resolve(cwd, assetName), { encoding: 'utf8' });
    var minifiedCode = null;

    if (extname === '.js') {
      try {
        var minifyResult = _uglifyJs2.default.minify(content, {
          compress: {
            dead_code: true
          },
          fromString: true
        });
        minifiedCode = minifyResult.code;
      } catch (e) {
        response.error = Object.assign(e, { assetName: assetName });
      }
    } else if (extname === '.css') {
      minifiedCode = _uglifycss2.default.processString(content);
    }

    if (minifiedCode) {
      _fs2.default.writeFileSync(_path2.default.resolve(cwd, assetName), minifiedCode, { encoding: 'utf8' });
    }
  }

  process.send(response);
});