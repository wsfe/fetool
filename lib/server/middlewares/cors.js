"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _default = function _default(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  next();
};

exports["default"] = _default;