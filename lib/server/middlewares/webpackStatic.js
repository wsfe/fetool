"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var STATIC_REG = /.*\.(png|jpe?g|gif|svg|woff2?|eot|ttf|otf)$/;
var VER_REG = /[\W][\d\w]+(?=\.\w+$)/;

var _default = function _default(req, res, next) {
  var filePaths = req.url.split('/');

  if (STATIC_REG.test(req.path) && filePaths[2] === 'prd') {
    filePaths.splice(2, 1);
    req.url = filePaths.join('/').replace(VER_REG, '');
  }

  next();
};

exports["default"] = _default;