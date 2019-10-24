"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDevProject = getDevProject;
exports.deleteDevProject = deleteDevProject;

var _project = _interopRequireDefault(require("../models/project"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var devProjectCache = {};

function getDevProject(cwd) {
  if (!devProjectCache[cwd]) {
    return new _project["default"](cwd, ENV.LOC);
  }

  return devProjectCache[cwd];
}

;

function deleteDevProject(cwd) {
  delete devProjectCache[cwd];
}