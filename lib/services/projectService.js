'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDevProject = getDevProject;
exports.deleteDevProject = deleteDevProject;

var _project = require('../models/project');

var _project2 = _interopRequireDefault(_project);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var devProjectCache = {};

function getDevProject(cwd) {
  if (!devProjectCache[cwd]) {
    return new _project2.default(cwd, ENV.LOC);
  }
  return devProjectCache[cwd];
};

function deleteDevProject(cwd) {
  delete devProjectCache[cwd];
}