'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getProject = getProject;

var _project = require('../models/project');

var _project2 = _interopRequireDefault(_project);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var projectCache = {};

function getProject(cwd, cache) {
  if (!projectCache[cwd] || !cache) {
    projectCache[cwd] = new _project2.default(cwd);
  }
  return projectCache[cwd];
};