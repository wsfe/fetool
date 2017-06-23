"use strict";

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

exports.default = {
  deleteFolderRecursive: deleteFolderRecursive
};