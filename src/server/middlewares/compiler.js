import { projectService } from '../services';

const QUERY_REG = /\?.+$/;
const VER_REG = /@[\d\w]+(?=\.\w+)/;
let middlewareCache = {};

export default function compiler(req, res, next) {
  let url = req.url,
    filePaths = url.split('/'),
    projectName = filePaths[1],
    projectCwd = sysPath.join(process.cwd(), projectName),
    project = projectService.getProject(projectCwd, false),
    outputDir = project.config.output.local.path || 'prd';

  // 非output.path下的资源不做任何处理
  if (filePaths[2] !== sysPath.relative(projectCwd, outputDir)) {
    next();
    return;
  }

  url = '/' + filePaths.slice(3).join('/').replace(QUERY_REG, '').replace(VER_REG, '');
  req.url = url;
  let requestUrl = url.replace('.map', '').slice(1);
  let cacheId = sysPath.join(projectName, requestUrl);

  if (middlewareCache[cacheId]) {
    middlewareCache[cacheId](req, res, next);
    return;
  }

  let compiler = project.getServerCompiler((config) => {
    
  });

};