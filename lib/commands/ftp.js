"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = ftp;

var _ftp = _interopRequireDefault(require("ftp"));

var _path = _interopRequireDefault(require("path"));

var _lodash = _interopRequireDefault(require("lodash"));

var _checksum = require("../utils/checksum");

var _batchPromise = _interopRequireDefault(require("../utils/batch-promise"));

var _syncConf = _interopRequireDefault(require("../utils/sync-conf"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var path = _path["default"].posix;
var batchConfig = {};
var CHECKSUM_JSON = 'checksum.json';
var ftpClient = new _ftp["default"]();
/**
 * 获取旧 checksum map
 * @param {FTP} client FTP 实例
 * @param {string} checksumPath 从远程获取旧 checksum 的路径
 */

var getOldChecksumMap = function getOldChecksumMap(client, checksumPath) {
  return new Promise(function (resolve) {
    client.get(checksumPath, function (err, stream) {
      if (err) {
        resolve({});
        return;
      }

      stream.setEncoding('utf8');
      var str = '';
      stream.on('data', function (chunk) {
        str += chunk;
      });
      stream.on('end', function () {
        var map = {};

        try {
          map = JSON.parse(str);
        } catch (e) {}

        resolve(map);
      });
    });
  });
};

var operateSingleFile = function operateSingleFile(type, client) {
  for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  return new Promise(function (resolve, reject) {
    var remoteRootPath = args[args.length - 2];
    var relativePath = args[args.length - 1];
    var remotePath = path.join(remoteRootPath, relativePath);
    args.splice(args.length - 2, 2, remotePath);

    var executeOperation = function executeOperation() {
      client[type].apply(client, args.concat([function (err) {
        var result = {
          type: type,
          file: relativePath,
          success: true
        };

        if (err) {
          reject(Object.assign(result, {
            success: false
          }));
          error("".concat(type, " ").concat(relativePath, " fail, "), err);
        } else {
          resolve(result);
          log("".concat(type, " ").concat(relativePath, " success"));
        }
      }]));
    };

    if (type === 'put') {
      // 上传文件之前先确保服务器上有对应文件夹
      var remoteDir = path.parse(remotePath).dir;
      client.mkdir(remoteDir, true, function (err) {
        // console.log('mkdir error', err)
        executeOperation();
      });
    } else {
      executeOperation();
    }
  });
};
/**
 * 批量上传文件
 * @param {FTP} client FTP 实例
 * @param {string[]} uploadList 上传路径列表
 * @param {string} remoteRootPath 远程根路径
 */


var uploadFiles = function uploadFiles(client, uploadList, remoteRootPath) {
  return (0, _batchPromise["default"])(uploadList.map(function (uploadPath) {
    return operateSingleFile.bind(null, 'put', client, uploadPath, remoteRootPath, uploadPath);
  }), batchConfig);
};
/**
 * 批量删除远程文件
 * @param {FTP} client FTP 实例
 * @param {string[]} deleteList 要删除的路径列表
 * @param {string} remoteRootPath 远程根路径
 */


var deleteFiles = function deleteFiles(client, deleteList, remoteRootPath) {
  return (0, _batchPromise["default"])(deleteList.map(function (deletePath) {
    return operateSingleFile.bind(null, 'delete', client, remoteRootPath, deletePath);
  }), batchConfig);
};
/**
 * 上传修正后的 checksum.json ，没有上传或删除成功的 hash 不会被更新
 */


var uploadChecksumJson = function uploadChecksumJson(client, newChecksum, oldChecksum, uploadResult, deleteResult, remoteRootPath) {
  return new Promise(function (resolve, reject) {
    var currectChecksum = Object.assign({}, newChecksum);
    uploadResult.concat(deleteResult).forEach(function (result) {
      if (!result.success) {
        currectChecksum[result.file] = oldChecksum[result.file];
      }
    });
    client.put(Buffer.from(JSON.stringify(currectChecksum), 'utf8'), path.join(remoteRootPath, CHECKSUM_JSON), function (err) {
      if (err) {
        error("put ".concat(CHECKSUM_JSON, " fail"));
        reject(err);
      } else {
        log("put ".concat(CHECKSUM_JSON, " success"));
        resolve();
      }
    });
  });
};
/**
 * 通过 FTP 同步至服务器
 * @param {string} host 远程地址
 * @param {string} rowRootPath 远程根路径
 * @param {string} localRootPath 本地根路径
 * @param {string[]} include 要上传的路径列表
 */


var syncViaFTP = function syncViaFTP(host, rowRootPath, localRootPath, include) {
  return new Promise(function (resolve, reject) {
    var dirs = path.normalize(rowRootPath).split(path.sep);
    var remoteRootPath = dirs[dirs.length - 1] || dirs[dirs.length - 2];
    var checksumPath = path.join(remoteRootPath, CHECKSUM_JSON);
    ftpClient.on('ready', function () {
      // 生成新的 checksum.json 文件
      var newChecksum = (0, _checksum.genChecksumJson)(include, localRootPath); // 从服务器获取旧 checksum.json 文件

      getOldChecksumMap(ftpClient, checksumPath).then(function (oldChecksum) {
        // 比较新旧 checksum.json ，获取上传与删除列表
        var _compareChecksum = (0, _checksum.compareChecksum)(newChecksum, oldChecksum),
            uploadList = _compareChecksum.uploadList,
            deleteList = _compareChecksum.deleteList;

        Promise.all([// 上传文件到服务器
        uploadFiles(ftpClient, uploadList, remoteRootPath), // 从服务器删除不必要文件
        deleteFiles(ftpClient, deleteList, remoteRootPath)]).then(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2),
              uploadResult = _ref2[0],
              deleteResult = _ref2[1];

          var successPutCount = uploadResult.filter(function (result) {
            return result.success;
          }).length;
          var failedPutCount = uploadResult.length - successPutCount;
          var successDeleteCount = deleteResult.filter(function (result) {
            return result.success;
          }).length;
          var failedDeleteCount = deleteResult.length - successDeleteCount;
          log('');
          log('------ Send via FTP results ------');
          log("Sent ".concat(successPutCount, " file(s) successfully."));
          log("Failed to send ".concat(failedPutCount, " file(s)."));
          log("Deleted ".concat(successDeleteCount, " file(s) successfully."));
          log("Failed to delete ".concat(failedDeleteCount, " file(s)."));
          log('------ Send via FTP results ------');
          log('');
          return uploadChecksumJson(ftpClient, newChecksum, oldChecksum, uploadResult, deleteResult, remoteRootPath);
        })["catch"](function (e) {
          error(e);
        }).then(function () {
          ftpClient.end();
          resolve();
        });
      });
    });
    ftpClient.on('error', function (err) {
      if (err) {
        error(err);

        if (err.code === 530) {
          error('FTP 服务器连接失败');
          process.exit(1);
        }
      }
    });
    ftpClient.connect({
      host: host
    });
  });
};

function ftp(program) {
  program.command('ftp <env>') // 同步到名字为env的开发环境
  .description('通过FTP同步到<env>机器').action(function (env) {
    var syncConf = (0, _syncConf["default"])(env);
    var host = syncConf.host;
    var path = syncConf.path;
    var local = syncConf.local || './';
    var default_include = [];

    if (syncConf['include'] && syncConf['include'].length > 0) {
      default_include = default_include.concat(syncConf.include);
      default_include = _lodash["default"].uniq(default_include);
    }

    syncViaFTP(host, path, local, default_include).then(function () {
      process.exit();
    });
  });
}

;