'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = init;
function init(program) {
  program.command('init [type]').description('初始化项目,可以根据type来制定是vue还是ts').action(function (type) {
    var isExit = true,
        filePath = sysPath.join(process.cwd(), 'ft.config.js');
    try {
      isExit = fs.statSync(filePath).isFile();
    } catch (err) {
      isExit = false;
    }

    if (!isExit) {
      try {
        fs.readFile(sysPath.join(__dirname, '../config', type ? type + '.ft.config.js' : 'ft.config.js'), { encoding: 'utf8' }, function (err, data) {
          if (err) {
            error(err);
          } else {
            fs.writeFileSync(filePath, data, 'UTF-8');
            success('init success');
          }
          process.exit();
        });
      } catch (err) {
        error(err);
        process.exit();
      }
    } else {
      process.exit();
    }
  });
};