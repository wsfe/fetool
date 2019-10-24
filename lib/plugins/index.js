"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "ProgressPlugin", {
  enumerable: true,
  get: function get() {
    return _progress["default"];
  }
});
Object.defineProperty(exports, "UglifyCSSPlugin", {
  enumerable: true,
  get: function get() {
    return _uglifycss["default"];
  }
});
Object.defineProperty(exports, "HtmlCompilerPlugin", {
  enumerable: true,
  get: function get() {
    return _htmlCompiler["default"];
  }
});
Object.defineProperty(exports, "VersionPlugin", {
  enumerable: true,
  get: function get() {
    return _version["default"];
  }
});
Object.defineProperty(exports, "CssIgnoreJSPlugin", {
  enumerable: true,
  get: function get() {
    return _cssIgnoreJS["default"];
  }
});
Object.defineProperty(exports, "CompilerLoggerPlugin", {
  enumerable: true,
  get: function get() {
    return _compilerLogger["default"];
  }
});
Object.defineProperty(exports, "ExtTemplatePathPlugin", {
  enumerable: true,
  get: function get() {
    return _extTemplatePath["default"];
  }
});
Object.defineProperty(exports, "ReplaceCssHashPlugin", {
  enumerable: true,
  get: function get() {
    return _replaceCssHash["default"];
  }
});

var _progress = _interopRequireDefault(require("./progress"));

var _uglifycss = _interopRequireDefault(require("./uglifycss"));

var _htmlCompiler = _interopRequireDefault(require("./htmlCompiler"));

var _version = _interopRequireDefault(require("./version"));

var _cssIgnoreJS = _interopRequireDefault(require("./cssIgnoreJS"));

var _compilerLogger = _interopRequireDefault(require("./compilerLogger"));

var _extTemplatePath = _interopRequireDefault(require("./extTemplatePath"));

var _replaceCssHash = _interopRequireDefault(require("./replaceCssHash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }