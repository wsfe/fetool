import { projectService } from '../services';

export default function compiler(req, res, next) {
  let url = req.url,
    filePaths = url.split('/'),
    projectName = filePaths[1],
    projectCwd = sysPath.join(process.cwd(), projectName),
    project = projectService.getProject(projectCwd, false);
};