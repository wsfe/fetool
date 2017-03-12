'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Project = function () {
  function Project(cwd) {
    _classCallCheck(this, Project);

    this.cwd = cwd;
    this.configFile = sysPath.resolve(this.cwd, 'ft.config');
    this.userConfig = this.getUserConfig(this.configFile);
    this.model = this.userConfig.model || 'mutli';
    this.config = new _config2.default(cwd, this.userConfig.config, this.userConfig.entryExtNames);
  }

  _createClass(Project, [{
    key: 'getUserConfig',
    value: function getUserConfig(module) {
      delete require.cache[require.resolve(module)];
      return require(module);
    }
  }, {
    key: 'getServerCompiler',
    value: function getServerCompiler(cb) {
      var config = this.getConfig('local');
      if (cb && typeof cb === 'function') {
        config = cb(config);
      }
      return (0, _webpack2.default)(config);
    }
  }, {
    key: 'getConfig',
    value: function getConfig(env) {
      return this.config.getConfig(env);
    }
  }, {
    key: 'getSourceType',
    value: function getSourceType(name) {
      var _this = this;

      var ext = sysPath.extname(name);
      var type = 'js';
      Object.keys(this.config.entryExtNames).forEach(function (extName) {
        var exts = _this.config.entryExtNames[extName];
        if (exts.indexOf(ext) > -1) {
          type = extName;
        }
      });
      return type;
    }
  }]);

  return Project;
}();

exports.default = Project;