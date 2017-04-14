'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = init;
function init(program) {
  program.command('init').description('初始化项目').action(function () {
    var isExit = true,
        filePath = sysPath.join(process.cwd(), 'ft.config.js');
    try {
      isExit = fs.statSync(filePath).isFile();
    } catch (err) {
      isExit = false;
    }

    if (!isExit) {
      fs.readFile(sysPath.join(__dirname, '../config/ft.config.js'), { encoding: 'utf8' }, function (err, data) {
        fs.writeFileSync(filePath, data, 'UTF-8');
        success('init success');
        process.exit();
      });
    } else {
      process.exit();
    }
  });
};