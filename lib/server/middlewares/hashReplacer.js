'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = replaceHash;

var OUTPUT_DIR = 'prd';
var QUERY_REG = /\?.+$/;
var VER_REG = /@[\d\w]+(?=\.\w+)/;

function replaceHash(req, res, next) {
  var filePaths = req.url.split('/');

  // 如果url == '/projectname/prd/..../xxx@hash值.js|css'，那么把这些hash都删除掉。
  if (filePaths[2] === OUTPUT_DIR) {
    req.url = req.url.replace(QUERY_REG, '').replace(VER_REG, '');
  }
  next();
}