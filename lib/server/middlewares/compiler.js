'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = compiler;
function compiler(req, res, next) {
  var url = req.url,
      filePaths = url.split('/'),
      projectName = filePaths[1],
      projectCwd = sysPath.join(process.cwd(), projectName);
};