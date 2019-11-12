"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = _default;

var _webpackDevMiddleware = _interopRequireDefault(require("webpack-dev-middleware"));

var _chokidar = _interopRequireDefault(require("chokidar"));

var _lruCache = _interopRequireDefault(require("lru-cache"));

var _services = require("../../services");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var OUTPUT_DIR = 'prd';
var multiModeCache = new _lruCache["default"]({
  max: 20,
  maxAge: 1000 * 60 * 60 * 24 * 3 // 超过3天就清除缓存

}); // 多页应用的缓存，最多缓存50个，超过3天就清除

var watchCache = {};
var _args = null; // server 启动的参数

function watchConfig(projectName, paths, projectCwd) {
  if (!watchCache[projectName]) {
    var watcher = _chokidar["default"].watch(paths);

    watcher.on('change', function () {
      multiModeCache.forEach(function (value, key, cache) {
        if (key.indexOf(projectName) === 0 && /[\/\\]/.test(key.substr(projectName.length, 1))) {
          cache.del(key);
        }
      });

      _services.projectService.deleteDevProject(projectCwd);
    });
    watchCache[projectName] = watcher;
  }
}

function getMulitModeConfig(config, requestUrl) {
  var entryKey = '';
  var reqUrlMatch = requestUrl.match(/^(.+)\.(\w+)$/);
  Object.keys(config.entry).some(function (key) {
    var keyMatch = key.match(/^(.+)(\.\w+)$/);

    if (reqUrlMatch[1] === keyMatch[1]) {
      // 除去extname之后如果一样的话
      entryKey = key;
      return true;
    }

    return false;
  });

  if (entryKey) {
    config.entry = _defineProperty({}, entryKey, config.entry[entryKey]);
    return config;
  }

  return false; //如果没有找到config呢
}

;
/**
 * 获取webpack-dev-middleware中间件
 * @param {webpack编译器} compiler
 */

function getMiddleWare(compiler) {
  return (0, _webpackDevMiddleware["default"])(compiler, {
    logLevel: 'silent',
    lazy: true,
    reporter: function reporter(middlewareOptions, reporterOptions) {
      var state = reporterOptions.state,
          stats = reporterOptions.stats;

      if (state) {
        if (_args.verbose) {
          Object.keys(stats.compilation.assets).forEach(function (key) {
            log('emitted asset:', stats.compilation.assets[key].existsAt);
          });
        }

        if (stats.hasErrors()) {
          error('webpack: Failed to compile.');
          log(stats.toString(stats));
        }

        if (stats.hasWarnings()) {
          warn('webpack: Compiled with warnings.');
          log(stats.toString(stats));
        }
      } else {
        if (_args.verbose) {
          log('webpack: Compiling...');
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
  var middleware = multiModeCache.get(cacheId);

  if (!middleware) {
    var newConfig;
    var compiler = project.getServerCompiler({
      type: sysPath.extname(requestUrl).substr(1),
      cb: function cb(config) {
        newConfig = getMulitModeConfig(config, requestUrl);
        return newConfig || config;
      }
    }, _args);

    if (!newConfig) {
      // 如果配置不存在
      return function (req, res, next) {
        res.statusCode = 404;
        res.end('[fet] - 资源入口未找到，请检查项目' + projectName + '的配置文件.');
      };
    }

    middleware = getMiddleWare(compiler);
    multiModeCache.set(cacheId, middleware);
  }

  return middleware;
}

function getWatchPaths(paths, projectCwd) {
  var result = [];
  paths = paths.split(',');
  paths.forEach(function (value) {
    result.push(sysPath.join(projectCwd, value));
  });
  return result;
}

function _default(options) {
  _args = options;
  return function (req, res, next) {
    var url = req.url,
        // url == '/projectname/prd/..../xxx@hash值.js|css';
    filePaths = url.split('/'),
        projectName = filePaths[1],
        // 项目名称
    projectCwd = sysPath.join(process.cwd(), projectName); // 项目的绝对路径
    // 非output.path下的资源不做任何处理

    if (filePaths[2] !== OUTPUT_DIR) {
      next();
      return;
    }

    var project = _services.projectService.getDevProject(projectCwd);

    req.url = '/' + filePaths.slice(3).join('/');
    var requestUrl = req.url.replace('.map', '').slice(1);
    var cacheId = sysPath.join(projectName, requestUrl);
    multiMode(project, projectName, requestUrl, cacheId)(req, res, next);
    var watchPaths = getWatchPaths(options.watch, projectCwd);
    watchPaths.push(project.configFile + '.js');
    watchConfig(projectName, watchPaths, projectCwd); // 默认监听根目录下的build文件夹的所有文件改变
  };
}

;