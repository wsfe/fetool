'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = sync;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _shelljs = require('shelljs');

var _shelljs2 = _interopRequireDefault(_shelljs);

var _project = require('../models/project');

var _project2 = _interopRequireDefault(_project);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function sync(program) {
  program.command('sync <env>') // 同步到名字为env的开发环境
  .description('同步到<env>机器').action(function (env) {
    var project = new _project2.default(process.cwd(), ENV.DEV);
    var syncInstance = new Sync(project);
    syncInstance.sync(env);
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
      var syncConf = this.project.userConfig.servers,
          conf = {};
      if (!syncConf[env]) {
        error('\u8BF7\u67E5\u770B\u914D\u7F6E\u6587\u6863\uFF0C\u914D\u7F6E' + env + '\u670D\u52A1\u5668!');
        process.exit(1);
      }
      conf = syncConf[env];
      conf.user = globalConfig.user ? globalConfig.user + '@' : '';
      conf.local = conf.local || './';

      var default_exclude = ['.idea', '.svn', '.git', '.gitignore', 'yarn.lock', 'ft.config.js', '.DS_Store', 'node_modules', 'src', 'loc', 'env', 'dll'];
      if (conf['exclude'] && conf['exclude'].length > 0) {
        default_exclude = default_exclude.concat(conf.exclude);
        default_exclude = _lodash2.default.uniq(default_exclude);
      }
      default_exclude = default_exclude.map(function (item) {
        return '--exclude=' + item;
      }).join(' ');

      var _args = ['-rzcvp', "--chmod=a='rX,u+w,g+w'", "--rsync-path='" + (conf.sudo ? "sudo " : '') + "rsync'", conf.local, '' + conf.user + conf.host + ':' + conf.path, default_exclude];
      if (conf.port) {
        // 默认是22端口，不过有些机器没有开22，因此需要有这个设置
        _args.push('-e \'ssh -p ' + conf.port + '\'');
      }

      // todo 需要看是否要加--temp-dir这个配置

      var args = _args.join(' ');
      log("[调用] rsync " + args);
      _shelljs2.default.exec('rsync ' + args, function (code, stdout, stderr) {
        if (code) {
          log('[提示] 如遇问题，请问我-----------------我会让你看源码！');
          error(stderr);
          _shelljs2.default.exit(1);
        }
        if (stdout) {
          log(stdout);
          process.exit();
        }
      });
    }
  }]);

  return Sync;
}();