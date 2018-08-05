import webpackDevMiddleware from 'webpack-dev-middleware';
import chokidar from 'chokidar';
import LRU from 'lru-cache';
import { projectService } from '../../services';

const OUTPUT_DIR = 'prd'
let multiModeCache = LRU({
  max: 20,
  maxAge: 1000 * 60 * 60 * 24 * 3 // 超过3天就清除缓存
}); // 多页应用的缓存，最多缓存50个，超过3天就清除

let watchCache = {};
let _args = null; // server 启动的参数

function watchConfig(projectName, paths, projectCwd) {
  if (!watchCache[projectName]) {
    let watcher = chokidar.watch(paths);
    watcher.on('change', () => {
      multiModeCache.forEach((value, key, cache) => {
        if (key.indexOf(projectName) === 0 && /[\/\\]/.test(key.substr(projectName.length, 1))) {
          cache.del(key);
        }
      });
      projectService.deleteDevProject(projectCwd);
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
        if (_args.verbose) {
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
        if (_args.verbose) {
          log('webpack: Compiling...')
        }
      }
    }
  });
}

/**
 * 
 * @param {Project对象} project 
 * @param {project名字} projectName 
 */
function multiMode(project, projectName, requestUrl, cacheId) {
  let middleware = multiModeCache.get(cacheId);
  if (!middleware) {
    let newConfig;
    let compiler = project.getServerCompiler({
      type: sysPath.extname(requestUrl).substr(1),
      cb: (config) => {
        newConfig = getMulitModeConfig(config, requestUrl);
        return newConfig || config;
      }
    }, _args);
    if (!newConfig) { // 如果配置不存在
      return (req, res, next) => {
        res.statusCode = 404;
        res.end('[ft] - 资源入口未找到，请检查项目' + projectName + '的配置文件.');
      }
    }
    middleware = getMiddleWare(compiler);
    multiModeCache.set(cacheId, middleware);
  }
  return middleware;
}

function getWatchPaths(paths, projectCwd) {
  let result = [];
  paths = paths.split(',');
  paths.forEach(value => {
    result.push(sysPath.join(projectCwd, value));
  });
  return result;
}

export default function (options) {
  _args = options;
  return function (req, res, next) {
    let url = req.url, // url == '/projectname/prd/..../xxx@hash值.js|css';
      filePaths = url.split('/'),
      projectName = filePaths[1], // 项目名称
      projectCwd = sysPath.join(process.cwd(), projectName) // 项目的绝对路径

    // 非output.path下的资源不做任何处理
    if (filePaths[2] !== OUTPUT_DIR) {
      next();
      return;
    }

    let project = projectService.getDevProject(projectCwd);

    req.url = '/' + filePaths.slice(3).join('/')

    let requestUrl = req.url.replace('.map', '').slice(1);
    let cacheId = sysPath.join(projectName, requestUrl);
    multiMode(project, projectName, requestUrl, cacheId)(req, res, next);

    let watchPaths = getWatchPaths(options.watch, projectCwd);
    watchPaths.push(project.configFile + '.js')

    watchConfig(projectName, watchPaths, projectCwd); // 默认监听根目录下的build文件夹的所有文件改变

  };
};