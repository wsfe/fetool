import { projectService } from '../services';

const QUERY_REG = /\?.+$/;
const VER_REG = /@[\d\w]+(?=\.\w+)/;
let middlewareCache = {};

export default function compiler(req, res, next) {
  let url = req.url, // url == '/projectname/prd/..../xxx@hash值.js|css';
    filePaths = url.split('/'),
    projectName = filePaths[1], // 项目名称
    projectCwd = sysPath.join(process.cwd(), projectName), // 项目的绝对路径
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

  let ext = sysPath.extname(cacheId);
  let compiler = project.getServerCompiler(ext, (config) => {
    let newConfig = Object.assign({}, config);
    newConfig.entry = {};
    Object.keys(config.entry).forEach((entryPath) => {
      var entryItem = config.entry[entryPath];

      // 创建正则匹配
      let extRegs = this.project.config.entryExtNames[ext].map((name) => {
        return name + '$';
      });
      let replaceReg = new RegExp('\\' + extRegs.join('|\\'));
      let requestKey = entryPath.replace(replaceReg, '.' + target); // 例如将.less换成.css,.vue 换成 .js

      // 判断所请求的资源是否在入口配置中
      let isRequestEntry = sysPath.normalize(requestKey) === sysPath.normalize(requestUrl);

      if (isRequestEntry) {
        newConfig.entry[entryPath] = entryItem;
      }
    });

    return newConfig;
  });

};