/**
 * 删除文件夹
 * @param {文件路径} filePath 
 */
let deleteFolderRecursive = function (filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.readdirSync(filePath).forEach(function (file, index) {
        let curPath = filePath + "/" + file;
        if (fs.lstatSync(curPath).isDirectory()) { // recurse
          deleteFolderRecursive(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(filePath);
    }
  } catch(e) {
    error(e);
  }
};

export default {
  deleteFolderRecursive
};