"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _url = require("url");

var _default = function _default(req, res, next) {
  if (req.header('proxy-connection')) {
    try {
      var reqUrl = new _url.URL(req.url).pathname;
      req.url = reqUrl;
      req.originalUrl = reqUrl;
    } catch (e) {
      next();
      return;
    }
  }

  next();
};

exports["default"] = _default;