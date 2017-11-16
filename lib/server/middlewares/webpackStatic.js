'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _services = require('../../services');

var STATIC_REG = /.*\.(png|jpe?g|gif|svg|woff2?|eot|ttf|otf)$/;
var VER_REG = /[@|\.|_|#|\-][\d\w]+(?=\.\w+$)/; // 静态文件文件名，添加hash的时候，支持用艾特(@),点号(.),井号(#),下划线(_),以及中横线（-）分割,例如：icons.1212121323.ttf或者icons@1212121323.ttf等

exports.default = function (req, res, next) {
  var filePaths = req.url.split('/');
  if (STATIC_REG.test(req.path) && filePaths[2] === 'prd') {
    var projectName = filePaths[1],
        project = _services.projectService.getDevProject(sysPath.join(process.cwd(), projectName));
    if (project.mode === MUTLI_MODE) {
      filePaths.splice(2, 1);
      req.url = filePaths.join('/').replace(VER_REG, '');
    }
  }
  next();
};