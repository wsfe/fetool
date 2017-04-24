'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (options) {
  verbose = options.verbose;
  return function (req, res, next) {
    var url = req.url,
        // url == '/projectname/prd/..../xxx@hash值.js|css';
    filePaths = url.split('/'),
        projectName = filePaths[1],
        // 项目名称
    projectCwd = sysPath.join(process.cwd(), projectName),
        // 项目的绝对路径
    project = _services.projectService.getProject(projectCwd, true),
        baseConfig = project.getConfig('local', 'base'),
        outputDir = baseConfig.output.path || 'prd';

    // 非output.path下的资源不做任何处理
    // if (filePaths[2] !== sysPath.relative(projectCwd, outputDir)) { // 不知道为毛之前可以用relative这个函数，现在就不行了
    if (filePaths[2] !== outputDir.replace(/\W*(\w+)\W*/g, function ($0, $1) {
      return $1;
    })) {
      // 暂时这么解决
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

var _services = require('../../services');

var _webpackDevMiddleware = require('webpack-dev-middleware');

var _webpackDevMiddleware2 = _interopRequireDefault(_webpackDevMiddleware);

var _chokidar = require('chokidar');

var _chokidar2 = _interopRequireDefault(_chokidar);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var QUERY_REG = /\?.+$/;
var VER_REG = /@[\d\w]+(?=\.\w+)/;
var middlewareCache = {};
var watchCache = {};
var verbose = false; // 显示编译的详细信息

function watchConfig(projectName, configFilePath, projectCwd) {
  if (!watchCache[projectName]) {
    var watcher = _chokidar2.default.watch(configFilePath);
    watcher.on('change', function () {
      _services.projectService.getProject(projectCwd, ENV.DEV, false);
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
};

/**
 * 获取webpack-dev-middleware中间件
 * @param {webpack编译器} compiler 
 */
function getMiddleWare(compiler) {
  return (0, _webpackDevMiddleware2.default)(compiler, {
    lazy: true,
    quiet: true,
    reporter: function reporter(_ref) {
      var state = _ref.state,
          stats = _ref.stats,
          options = _ref.options;

      if (state) {
        if (verbose) {
          Object.keys(stats.compilation.assets).forEach(function (key) {
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
          log('webpack: Compiling...');
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
  return function (req, res, next) {
    if (middlewareCache[projectName]) {
      middlewareCache[projectName](req, res, next);
      return;
    }
    var compiler = project.getServerCompiler();
    var middleware = getMiddleWare(compiler);
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
  return function (req, res, next) {
    req.url = url;
    var requestUrl = url.replace('.map', '').slice(1);
    var cacheId = sysPath.join(projectName, requestUrl);

    if (middlewareCache[cacheId]) {
      middlewareCache[cacheId](req, res, next);
      return;
    }

    var newConfig = void 0;
    var compiler = project.getServerCompiler({
      type: sysPath.extname(requestUrl).substr(1),
      cb: function cb(config) {
        newConfig = getMulitModeConfig(config, requestUrl);
        return newConfig ? newConfig : config;
      }
    });
    if (!newConfig) {
      res.statusCode = 404;
      res.end('[ft] - 资源入口未找到，请检查项目' + projectName + '的配置文件.');
      return;
    }

    var middleware = getMiddleWare(compiler);
    middlewareCache[cacheId] = middleware;
    middleware(req, res, next);
  };
}

;