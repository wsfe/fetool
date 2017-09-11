'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ExtTemplatePathPlugin = exports.CompilerLoggerPlugin = exports.cssIgnoreJSPlugin = exports.VersionPlugin = exports.HtmlCompilerPlugin = exports.UglifyCSSPlugin = exports.progressPlugin = undefined;

var _progress = require('./progress');

var _progress2 = _interopRequireDefault(_progress);

var _uglifycss = require('./uglifycss');

var _uglifycss2 = _interopRequireDefault(_uglifycss);

var _htmlCompiler = require('./htmlCompiler');

var _htmlCompiler2 = _interopRequireDefault(_htmlCompiler);

var _version = require('./version');

var _version2 = _interopRequireDefault(_version);

var _cssIgnoreJS = require('./cssIgnoreJS');

var _cssIgnoreJS2 = _interopRequireDefault(_cssIgnoreJS);

var _compilerLogger = require('./compilerLogger');

var _compilerLogger2 = _interopRequireDefault(_compilerLogger);

var _extTemplatePath = require('./extTemplatePath');

var _extTemplatePath2 = _interopRequireDefault(_extTemplatePath);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.progressPlugin = _progress2.default;
exports.UglifyCSSPlugin = _uglifycss2.default;
exports.HtmlCompilerPlugin = _htmlCompiler2.default;
exports.VersionPlugin = _version2.default;
exports.cssIgnoreJSPlugin = _cssIgnoreJS2.default;
exports.CompilerLoggerPlugin = _compilerLogger2.default;
exports.ExtTemplatePathPlugin = _extTemplatePath2.default;