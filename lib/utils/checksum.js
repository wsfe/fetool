'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.compareChecksum = exports.genChecksumJson = undefined;

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var path = _path2.default.posix;

/**
 * 获取文件 checksum
 * @param {Buffer} fileBuffer 文件内容
 */
var getFileChecksum = function getFileChecksum(fileBuffer) {
  return _crypto2.default.createHash('md5').update(fileBuffer).digest('hex');
};

/**
 * 获取某个相对路径下文件的 checksum
 * @param {string} relativePath include 列表相对路径
 * @param {Object} map checksum map
 */
var genChecksumByPath = function genChecksumByPath(relativePath, map) {
  try {
    var stat = _fs2.default.statSync(relativePath);
    if (stat.isDirectory()) {
      try {
        var dirList = _fs2.default.readdirSync(relativePath);
        dirList.forEach(function (dir) {
          genChecksumByPath(path.join(relativePath, dir), map);
        });
      } catch (e) {}
    } else if (stat.isFile()) {
      try {
        var fileBuffer = _fs2.default.readFileSync(relativePath);
        map[relativePath] = getFileChecksum(fileBuffer);
      } catch (e) {}
    }
  } catch (e) {}
};

/**
 * 生成新的 checksum.json 文件
 * @param {string[]} pathList include 路径列表
 * @param {string} localRootPath 本地根路径
 */
var genChecksumJson = function genChecksumJson(pathList, localRootPath) {
  if (!Array.isArray(pathList)) return;
  var checksumMap = {};
  pathList.forEach(function (relativePath) {
    if (typeof relativePath === 'string') {
      genChecksumByPath(path.join(localRootPath, relativePath), checksumMap);
    }
  });
  return checksumMap;
};

/**
 *
 * @param {Object} newChecksum 新的 checksum map
 * @param {Object} oldChecksum 旧的 checksum map
 * @returns {Object} 返回两个列表，一个是应上传列表，一个是应删除列表
 */
var compareChecksum = function compareChecksum(newChecksum, oldChecksum) {
  var uploadList = [];
  var deleteList = [];
  var oldCopy = Object.assign({}, oldChecksum);
  for (var key in newChecksum) {
    // 如果当前遍历路径在旧的 checksum map 中不存在，或者与旧的值不一致，则是需要上传的文件
    if (!oldChecksum.hasOwnProperty(key) || oldChecksum[key] !== newChecksum[key]) {
      uploadList.push(key);
    }
    delete oldCopy[key];
  }
  for (var _key in oldCopy) {
    // 需要上传的文件路径已确认，旧的 checksum map 中剩下的则是新的 checksum map 中没有的路径，需要从 ftp 上删除
    if (oldCopy.hasOwnProperty(_key)) {
      deleteList.push(_key);
    }
  }
  return {
    uploadList: uploadList,
    deleteList: deleteList
  };
};

exports.genChecksumJson = genChecksumJson;
exports.compareChecksum = compareChecksum;