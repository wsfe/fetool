import { projectService } from '../../services';
import webpackDevMiddleware from 'webpack-dev-middleware';
import chokidar from 'chokidar';
import _ from 'lodash';

const QUERY_REG = /\?.+$/;
const VER_REG = /@[\d\w]+(?=\.\w+)/;
let middlewareCache = {};
let watchCache = {};

function watchConfig(projectName, configFilePath, projectCwd) {
  if (!watchCache[projectName]) {
    let watcher = chokidar.watch(configFilePath);
    watcher.on('change', () => {
      projectService.getProject(projectCwd, false);
    });
    watchCache[projectName] = watcher;
  }
}

function getConfig(config, requestUrl, entryExtNames) {
  let entryKey = '';
  let reqUrlMatch = requestUrl.match(/^(.+)\.(\w+)$/);
  Object.keys(config.entry).some((key) => {
    let keyMatch = key.match(/^(.+)(\.\w+)$/);
    if (reqUrlMatch[1] === keyMatch[1] && entryExtNames[reqUrlMatch[2]].indexOf(keyMatch[2]) > -1) {
      entryKey = key;
      return true;
    }
    return false;
  });
  if (entryKey) {
    config.entry = { [entryKey]: config.entry[entryKey] };
    return config;
  }
  return false;
};

export default function (options) {
  let verbose = options.verbose;
  return function (req, res, next) {
    let url = req.url, // url == '/projectname/prd/..../xxx@hash值.js|css';
      filePaths = url.split('/'),
      projectName = filePaths[1], // 项目名称
      projectCwd = sysPath.join(process.cwd(), projectName), // 项目的绝对路径
      project = projectService.getProject(projectCwd, true),
      config = project.getConfig('local'),
      outputDir = config.output.path || 'prd';

    // 非output.path下的资源不做任何处理
    if (filePaths[2] !== sysPath.relative(projectCwd, outputDir)) {
      next();
      return;
    }

    url = '/' + filePaths.slice(3).join('/').replace(QUERY_REG, '').replace(VER_REG, '');
    req.url = url;
    let requestUrl = url.replace('.map', '').slice(1);
    let cacheId = sysPath.join(projectName, requestUrl);

    // if (middlewareCache[projectName]) {
    //   middlewareCache[projectName](req, res, next);
    //   return;
    // }
    if (middlewareCache[cacheId]) {
      middlewareCache[cacheId](req, res, next);
      return;
    }
    config = getConfig(config, requestUrl, project.config.entryExtNames);
    if (!config) {
      res.statusCode = 404;
      res.end('[ft] - 资源入口未找到，请检查项目' + projectName + '的配置文件.');
      return;
    }

    let compiler = project.getServerCompiler(() => {
      return config;
    });

    let middleware = webpackDevMiddleware(compiler, {
      lazy: true,
      quiet: true,
      reporter({ state, stats, options }) {
        if (state) {
          // log(stats.toString(options.stats));
          if (verbose) {
            Object.keys(stats.compilation.assets).forEach((key) => {
              log('emitted asset:', stats.compilation.assets[key].existsAt);
            });
          }
          if (stats.hasErrors()) {
            error('webpack: Failed to compile.');
          }
          if (stats.hasWarnings()) {
            warn('webpack: Compiled with warnings.');
          }
        } else {
          if (verbose) {
            log('webpack: Compiling...')
          }
        }
      }
    });

    middlewareCache[cacheId] = middleware;

    middleware(req, res, next);
    watchConfig(projectName, project.configFile, projectCwd);
  };
};