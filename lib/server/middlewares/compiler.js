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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

function compiler(req, res, next) {
  var url = req.url,
      // url == '/projectname/prd/..../xxx@hash值.js|css';
  filePaths = url.split('/'),
      projectName = filePaths[1],
      // 项目名称
  projectCwd = sysPath.join(process.cwd(), projectName),
      // 项目的绝对路径
  project = _services.projectService.getProject(projectCwd, true),
      outputDir = project.config.output.local.path || 'prd';

  // 非output.path下的资源不做任何处理
  if (filePaths[2] !== sysPath.relative(projectCwd, outputDir)) {
    next();
    return;
  }

  url = '/' + filePaths.slice(3).join('/').replace(QUERY_REG, '').replace(VER_REG, '');
  req.url = url;
  var requestUrl = url.replace('.map', '').slice(1);
  // let cacheId = sysPath.join(projectName, requestUrl);

  // if (middlewareCache[cacheId]) {
  //   middlewareCache[cacheId](req, res, next);
  //   return;
  // }
  if (middlewareCache[projectName]) {
    middlewareCache[projectName](req, res, next);
    return;
  }

  var compiler = project.getServerCompiler();
  var middleware = (0, _webpackDevMiddleware2.default)(compiler, {
    lazy: true
  });

  middlewareCache[projectName] = middleware;

  middleware(req, res, next);
  watchConfig(projectName, project.configFile, projectCwd);
};