'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * 删除文件夹
 * @param {文件路径} filePath 
 */
var deleteFolderRecursive = function deleteFolderRecursive(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.readdirSync(filePath).forEach(function (file, index) {
        var curPath = filePath + "/" + file;
        if (fs.lstatSync(curPath).isDirectory()) {
          // recurse
          deleteFolderRecursive(curPath);
        } else {
          // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(filePath);
    }
  } catch (e) {
    error(e);
  }
};

/**
 * 异步递归遍历读取某个文件夹下面所有已exts数组里面值结尾的文件
 * @param {文件夹路径} dir 
 * @param {文件后缀数组，例如['js', 'css', 'html']} exts 
 * @param {读取文件的回调函数} cb 
 */
var readFileRecursive = function readFileRecursive(dir, exts, cb) {
  if (typeof exts === 'string') {
    exts = [exts];
  }
  fs.readdir(dir, function (err, files) {
    if (err) {
      throw err;
    }
    files.forEach(function (file) {
      var filePath = sysPath.join(filePath, file);
      fs.stat(filePath, function (err, stats) {
        if (err) {
          throw err;
        }
        if (stats.isDirectory()) {
          readFileRecursive(filePath, ext, cb);
        }
        if (stats.isFile() && exts.indexOf(filePath.split('.').pop()) > -1) {
          fs.readFile(filePath, function (err, data) {
            if (err) {
              throw err;
            } else {
              cb(filePath, data);
            }
          });
        }
      });
    });
  });
};

/**
 * 同步递归遍历读取某个文件夹下面所有已exts数组里面值结尾的文件
 * @param {文件夹路径} dir 
 * @param {文件后缀数组，例如['js', 'css', 'html']} exts 
 * @param {读取文件的回调函数} cb 
 */
var readFileRecursiveSync = function readFileRecursiveSync(dir, exts, cb) {
  if (typeof exts === 'string') {
    exts = [exts];
  }
  fs.readdirSync(dir).forEach(function (file) {
    var filePath = sysPath.join(dir, file);
    var stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      readFileRecursiveSync(filePath, exts, cb);
    }
    if (stats.isFile() && exts.indexOf(filePath.split('.').pop()) > -1) {
      cb(filePath, fs.readFileSync(filePath));
    }
  });
};

/**
 * 同步递归遍历读取某个文件夹下面所有已exts数组里面值结尾的文件，并返回相应的路径数组
 * @param {文件夹路径} dir 
 * @param {文件后缀数组，例如['js', 'css', 'html']} exts 
 * @param {读取文件的回调函数} cb 
 */
var getFilePathRecursive = function getFilePathRecursive(dir, exts) {
  if (typeof exts === 'string') {
    exts = [exts];
  }
  var result = [];
  try {
    fs.readdirSync(dir).forEach(function (file) {
      var filePath = sysPath.join(dir, file);
      var stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        result = result.concat(getFilePathRecursive(filePath, exts));
      }
      if (stats.isFile() && exts.indexOf(filePath.split('.').pop()) > -1) {
        result.push(filePath);
      }
    });
  } catch (err) {
    error(err);
  }
  return result;
};

exports.default = {
  deleteFolderRecursive: deleteFolderRecursive,
  readFileRecursive: readFileRecursive,
  readFileRecursiveSync: readFileRecursiveSync,
  getFilePathRecursive: getFilePathRecursive
};