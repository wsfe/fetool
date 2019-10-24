"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = sync;

var _lodash = _interopRequireDefault(require("lodash"));

var _shelljs = _interopRequireDefault(require("shelljs"));

var _syncConf = _interopRequireDefault(require("../utils/sync-conf"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function sync(program) {
  program.command('sync <env>') // 同步到名字为env的开发环境
  .description('同步到<env>机器').action(function (env) {
    var syncConf = (0, _syncConf["default"])(env);
    new Sync(syncConf).sync();
  });
}

;

var Sync =
/*#__PURE__*/
function () {
  function Sync(conf) {
    _classCallCheck(this, Sync);

    this.conf = conf;
  }

  _createClass(Sync, [{
    key: "sync",
    value: function sync() {
      if (this.conf.user) {
        this.conf.user = "".concat(this.conf.user, "@");
      } else {
        var globalConfig = JSON.parse(fs.readFileSync(FET_RC, {
          encoding: 'utf8'
        }));
        this.conf.user = globalConfig.user ? "".concat(globalConfig.user, "@") : '';
      }

      this.conf.local = this.conf.local || './';
      /* exclude 默认是全部，当有设置的时候，根据用户真实的设置来*/

      var default_exclude = ['/*'];

      if (this.conf['exclude'] && this.conf['exclude'].length > 0) {
        // default_exclude = default_exclude.concat(this.conf.exclude);
        default_exclude = _lodash["default"].uniq(this.conf.exclude);
      }

      default_exclude = default_exclude.map(function (item) {
        return "--exclude=".concat(item);
      }).join(' ');
      /* include */

      var default_include = [];

      if (this.conf['include'] && this.conf['include'].length > 0) {
        default_include = default_include.concat(this.conf.include);
        default_include = _lodash["default"].uniq(default_include);
      }

      default_include = default_include.map(function (item) {
        return "--include=".concat(item);
      }).join(' ');
      var _args = ['-rzcvp', process.platform === 'win32' ? "--chmod=a='rX,u+w,g+w'" : "--chmod=a=rx,u+rwx,g+rwx", "--rsync-path='" + (this.conf.sudo ? "sudo " : '') + "rsync'", this.conf.local, "".concat(this.conf.user).concat(this.conf.host, ":").concat(this.conf.path), default_include, default_exclude];

      if (this.conf.port) {
        // 默认是22端口，不过有些机器没有开22，因此需要有这个设置
        _args.push("-e 'ssh -p ".concat(this.conf.port, "'"));
      } // todo 需要看是否要加--temp-dir这个配置


      var args = _args.join(' ');

      log("[调用] rsync " + args);

      _shelljs["default"].exec("rsync ".concat(args), function (code, stdout, stderr) {
        if (code) {
          log('[提示] 如遇问题，请问我-----------------我会让你看源码！');
          error(stderr);

          _shelljs["default"].exit(1);
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