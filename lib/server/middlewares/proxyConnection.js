'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _url = require('url');

exports.default = function (req, res, next) {
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