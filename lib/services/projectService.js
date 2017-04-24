'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _projectCache;

exports.getProject = getProject;

var _project = require('../models/project');

var _project2 = _interopRequireDefault(_project);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var projectCache = (_projectCache = {}, _defineProperty(_projectCache, ENV.DEV, {}), _defineProperty(_projectCache, ENV.PRD, {}), _projectCache);

function getProject(cwd, env, cache) {
  if (!projectCache[env][cwd] || !cache) {
    projectCache[cwd] = new _project2.default(cwd, env);
  }
  return projectCache[cwd];
};