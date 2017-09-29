import Project from '../models/project';

let devProjectCache = {};

export function getDevProject(cwd) {
  if (!devProjectCache[cwd]) {
    return new Project(cwd, ENV.LOC);
  }
  return devProjectCache[cwd];
};

export function deleteDevProject(cwd) {
  delete devProjectCache[cwd];
}