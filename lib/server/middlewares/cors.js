'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  next();
};