'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = sync;

var _services = require('../services');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function sync(program) {
  program.command('sync').description('同步到开发机').option('-i, --init', '初始化sync配置').option('-e, --env <name>', '同步到名字为name的开发环境').action(function (options) {
    var project = _services.projectService.getProject(process.cwd(), false);
    var rsync = new Sync(project);
    if (options.init) {}
    if (options.env) {
      rsync.sync(options.env);
    }
  });
};

var Sync = function () {
  function Sync(project) {
    _classCallCheck(this, Sync);

    this.project = project;
  }

  _createClass(Sync, [{
    key: 'sync',
    value: function sync(env) {
      var globalConfig = JSON.parse(fs.readFileSync(FET_RC, { encoding: 'utf8' }));
      var syncConf = this.project.userConfig.sync;
      if (syncConf[env]) {
        var conf = syncConf[env];

        var default_include = [];
        if (conf['include'] && conf['include']['length'] > 0) {
          default_include = default_include.concat(conf['include']);
        }
        var default_exclude = ['.idea', '.svn', '.git', '.DS_Store', 'node_modules', 'prd', 'loc', 'env', 'dll'];
      }
    }
  }]);

  return Sync;
}();