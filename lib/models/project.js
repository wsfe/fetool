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
    this.config = new _config2.default(cwd, this.configFile);
  }

  _createClass(Project, [{
    key: 'getServerCompiler',
    value: function getServerCompiler(cb) {
      var config = this.config.getConfig('local');
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
  }]);

  return Project;
}();

exports.default = Project;