import Project from '../models/project';

let projectCache = {};

export function getProject(cwd, cache) {
  if (!projectCache[cwd] || !cache) {
    projectCache[cwd] = new Project(cwd);
  }
  return projectCache[cwd];
};