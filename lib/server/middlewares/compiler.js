'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = compiler;

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

function watchConfig(projectName, configFilePath, projectCwd) {
  if (!watchCache[projectName]) {
    var watcher = _chokidar2.default.watch(configFilePath);
    watcher.on('change', function () {
      _services.projectService.getProject(projectCwd, false);
    });
    watchCache[projectName] = watcher;
  }
}

function getConfig(config, requestUrl, entryExtNames) {
  var entryKey = '';
  var reqUrlMatch = requestUrl.match(/^(.+)\.(\w+)$/);
  Object.keys(config.entry).some(function (key) {
    var keyMatch = key.match(/^(.+)(\.\w+)$/);
    if (reqUrlMatch[1] === keyMatch[1] && entryExtNames[reqUrlMatch[2]].indexOf(keyMatch[2]) > -1) {
      entryKey = key;
      return true;
    }
    return false;
  });
  if (entryKey) {
    config.entry = _defineProperty({}, entryKey, config.entry[entryKey]);
    return config;
  }
  return false;
};

function compiler(req, res, next) {
  var url = req.url,
      // url == '/projectname/prd/..../xxx@hash值.js|css';
  filePaths = url.split('/'),
      projectName = filePaths[1],
      // 项目名称
  projectCwd = sysPath.join(process.cwd(), projectName),
      // 项目的绝对路径
  project = _services.projectService.getProject(projectCwd, true),
      config = project.getConfig('local'),
      outputDir = config.output.path || 'prd';

  // 非output.path下的资源不做任何处理
  if (filePaths[2] !== sysPath.relative(projectCwd, outputDir)) {
    next();
    return;
  }

  url = '/' + filePaths.slice(3).join('/').replace(QUERY_REG, '').replace(VER_REG, '');
  req.url = url;
  var requestUrl = url.replace('.map', '').slice(1);
  var cacheId = sysPath.join(projectName, requestUrl);

  if (middlewareCache[cacheId]) {
    middlewareCache[cacheId](req, res, next);
    return;
  }
  // if (middlewareCache[projectName]) {
  //   middlewareCache[projectName](req, res, next);
  //   return;
  // }
  config = getConfig(config, requestUrl, project.config.entryExtNames);
  if (!config) {
    res.statusCode = 404;
    res.end('[ft] - 资源入口未找到，请检查项目' + projectName + '的配置文件.');
    return;
  }

  var compiler = project.getServerCompiler(function () {
    return config;
  });

  var middleware = (0, _webpackDevMiddleware2.default)(compiler, {
    lazy: true
  });

  middlewareCache[cacheId] = middleware;

  middleware(req, res, next);
  watchConfig(projectName, project.configFile, projectCwd);
};