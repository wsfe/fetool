import Project from '../models/project';

let projectCache = {
  [ENV.DEV]: {},
  [ENV.PRD]: {}
};

export function getProject(cwd, env, cache) {
  if (!projectCache[env][cwd] || !cache) {
    projectCache[env][cwd] = new Project(cwd, env);
  }
  return projectCache[env][cwd];
};