var fs = require('fs');

var USER_HOME = process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'];
var FET_RC = sysPath.join(USER_HOME, '.fetrc');

var isExit = true;
try {
  isExit = fs.statSync(FET_RC).isFile();
} catch(err) {
  isExit = false;
}

if (!isExit) {
  let initRC = {};
  fs.writeFileSync(FET_RC, JSON.stringify(initRc, null, '    '), 'UTF-8');
}