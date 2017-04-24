import { projectService } from '../../services';
import webpackDevMiddleware from 'webpack-dev-middleware';
import chokidar from 'chokidar';
import _ from 'lodash';

const QUERY_REG = /\?.+$/;
const VER_REG = /@[\d\w]+(?=\.\w+)/;
let middlewareCache = {};
let watchCache = {};
let verbose = false; // 显示编译的详细信息

function watchConfig(projectName, configFilePath, projectCwd) {
  if (!watchCache[projectName]) {
    let watcher = chokidar.watch(configFilePath);
    watcher.on('change', () => {
      projectService.getProject(projectCwd, ENV.DEV, false);
    });
    watchCache[projectName] = watcher;
  }
}

function getMulitModeConfig(config, requestUrl) {
  let entryKey = '';
  let reqUrlMatch = requestUrl.match(/^(.+)\.(\w+)$/);
  Object.keys(config.entry).some((key) => {
    let keyMatch = key.match(/^(.+)(\.\w+)$/);
    if (reqUrlMatch[1] === keyMatch[1]) { // 除去extname之后如果一样的话
      entryKey = key;
      return true;
    }
    return false;
  });
  if (entryKey) {
    config.entry = { [entryKey]: config.entry[entryKey] };
    return config;
  }
  return false; //如果没有找到config呢
};

/**
 * 获取webpack-dev-middleware中间件
 * @param {webpack编译器} compiler 
 */
function getMiddleWare(compiler) {
  return webpackDevMiddleware(compiler, {
    lazy: true,
    quiet: true,
    reporter({ state, stats, options }) {
      if (state) {
        if (verbose) {
          Object.keys(stats.compilation.assets).forEach((key) => {
            log('emitted asset:', stats.compilation.assets[key].existsAt);
          });
        }
        if (stats.hasErrors()) {
          spinner.text = 'webpack: Failed to compile.';
          spinner.fail();
          spinner.text = '';
          log(stats.toString(options.stats));
        }
        if (stats.hasWarnings()) {
          spinner.text = 'webpack: Compiled with warnings.';
          spinner.warn();
          spinner.text = '';
          log(stats.toString(options.stats));
        }
      } else {
        if (verbose) {
          log('webpack: Compiling...')
        }
      }
    }
  });
}

/**
 * 单页模式的编译
 * @param {Project对象} project 
 * @param {project名字} projectName 
 */
function singleMode(project, projectName) {
  return (req, res, next) => {
    if (middlewareCache[projectName]) {
      middlewareCache[projectName](req, res, next);
      return;
    }
    let compiler = project.getServerCompiler();
    let middleware = getMiddleWare(compiler);
    middlewareCache[projectName] = middleware;
    middleware(req, res, next);
  };
}

/**
 * 
 * @param {Project对象} project 
 * @param {project名字} projectName 
 * @param {请求的url地址，有经过处理了} url 
 */
function multiMode(project, projectName, url, filePaths) {
  url = '/' + filePaths.slice(3).join('/').replace(QUERY_REG, '').replace(VER_REG, '');
  return (req, res, next) => {
    req.url = url;
    let requestUrl = url.replace('.map', '').slice(1);
    let cacheId = sysPath.join(projectName, requestUrl);

    if (middlewareCache[cacheId]) {
      middlewareCache[cacheId](req, res, next);
      return;
    }

    let newConfig;
    let compiler = project.getServerCompiler({
      type: sysPath.extname(requestUrl).substr(1),
      cb: (config) => {
        newConfig = getMulitModeConfig(config, requestUrl);
        return newConfig ? newConfig : config;
      }
    });
    if (!newConfig) {
      res.statusCode = 404;
      res.end('[ft] - 资源入口未找到，请检查项目' + projectName + '的配置文件.');
      return;
    }

    let middleware = getMiddleWare(compiler);
    middlewareCache[cacheId] = middleware;
    middleware(req, res, next);
  };
}

export default function (options) {
  verbose = options.verbose;
  return function (req, res, next) {
    let url = req.url, // url == '/projectname/prd/..../xxx@hash值.js|css';
      filePaths = url.split('/'),
      projectName = filePaths[1], // 项目名称
      projectCwd = sysPath.join(process.cwd(), projectName), // 项目的绝对路径
      project = projectService.getProject(projectCwd, true),
      baseConfig = project.getConfig('local', 'base'),
      outputDir = baseConfig.output.path || 'prd';

    // 非output.path下的资源不做任何处理
    // if (filePaths[2] !== sysPath.relative(projectCwd, outputDir)) { // 不知道为毛之前可以用relative这个函数，现在就不行了
    if (filePaths[2] !== outputDir.replace(/\W*(\w+)\W*/g, ($0, $1) => { return $1; })) { // 暂时这么解决
      next();
      return;
    }

    if (project.mode === SINGLE_MODE) {
      singleMode(project, projectName)(req, res, next);
    }

    if (project.mode === MUTLI_MODE) {
      multiMode(project, projectName, url, filePaths)(req, res, next);
    }

    watchConfig(projectName, project.configFile, projectCwd);

  };
};