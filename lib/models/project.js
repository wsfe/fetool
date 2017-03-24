'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _single = require('./single.config');

var _single2 = _interopRequireDefault(_single);

var _mutli = require('./mutli.config');

var _mutli2 = _interopRequireDefault(_mutli);

var _progress = require('../plugins/progress');

var _progress2 = _interopRequireDefault(_progress);

var _cssIgnoreJS = require('../plugins/cssIgnoreJS');

var _cssIgnoreJS2 = _interopRequireDefault(_cssIgnoreJS);

var _utils = require('../utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Project = function () {
  function Project(cwd) {
    _classCallCheck(this, Project);

    this.cwd = cwd;
    this.configFile = sysPath.resolve(this.cwd, 'ft.config');
    var userConfig = this.getUserConfig(this.configFile);
    this.mode = userConfig.mode || MUTLI_MODE;
    if (this.mode === SINGLE_MODE) {
      this.config = new _single2.default(cwd, userConfig);
    } else if (this.mode === MUTLI_MODE) {
      this.config = new _mutli2.default(cwd, userConfig);
    }
  }

  _createClass(Project, [{
    key: 'getUserConfig',
    value: function getUserConfig(module) {
      delete require.cache[require.resolve(module)];
      return require(module);
    }

    /**
     * 
     * @param {cb: funtion, type: 'base|js|css'} cb，主要是对config进行再加工，type：主要是指定哪一种配置，分为三种，baseConfig,jsConfig,cssConfig
     */

  }, {
    key: 'getServerCompiler',
    value: function getServerCompiler(_ref) {
      var cb = _ref.cb,
          type = _ref.type;

      var config = {};
      if (this.mode === SINGLE_MODE) {
        config = this.getConfig('local');
      } else {
        config = this.getConfig('local', type);
      }
      if (_lodash2.default.isFunction(cb)) {
        config = cb(config);
      }
      config.plugins.push(_progress2.default);
      return (0, _webpack2.default)(config);
    }
  }, {
    key: 'getConfig',
    value: function getConfig(env, type) {
      return this.config.getConfig(env, type);
    }
  }, {
    key: 'pack',
    value: function pack(options) {
      var _this = this;

      var startTime = Date.now();
      var promise = null;
      if (this.mode === SINGLE_MODE) {
        var config = this.getConfig('dev');
        this._setPackConfig(config);
        try {
          _utils2.default.fs.deleteFolderRecursive(config.output.path);
        } catch (e) {
          error(e);
        }
        promise = this._getPackPromise([config]);
      } else {
        var cssConfig = this.getConfig('dev', 'css'),
            jsConfig = this.getConfig('dev', 'js');
        cssConfig.plugins.push(new _cssIgnoreJS2.default());
        this._setPackConfig(cssConfig);
        this._setPackConfig(jsConfig);
        try {
          _utils2.default.fs.deleteFolderRecursive(cssConfig.output.path);
        } catch (e) {
          error(e);
        }
        promise = this._getPackPromise([cssConfig, jsConfig]);
      }
      promise.then(function (statsArr) {
        statsArr.forEach(function (stats) {
          _this._logPack(stats);
        });
        var packDuration = Date.now() - startTime > 1000 ? Math.floor((Date.now() - startTime) / 1000) + 's' : Date.now() - startTime + 'ms';
        log('Packing Finished in ' + packDuration + '.\n');
      }).catch(function (reason) {
        error(reason.stack || reason);
        if (reason.details) {
          error(reason.details);
        }
      });
    }
  }, {
    key: '_logPack',
    value: function _logPack(stats) {
      var info = stats.toJson({ errorDetails: false });

      if (stats.hasErrors()) {
        info.errors.map(function (err) {
          error(err + '\n');
        });
      }

      if (stats.hasWarnings()) {
        info.warnings.map(function (warning) {
          warn(warning + '\n');
        });
      }

      info.assets.map(function (asset) {
        var fileSize = asset.size;
        fileSize = fileSize > 1024 ? (fileSize / 1024).toFixed(2) + ' KB' : fileSize + ' Bytes';
        log('- ' + asset.name + ' - ' + fileSize);
      });
    }
  }, {
    key: '_setPackConfig',
    value: function _setPackConfig(config) {
      config.plugins.push(_progress2.default);
    }
  }, {
    key: '_getPackPromise',
    value: function _getPackPromise(configs) {
      var promises = [];
      configs.forEach(function (config) {
        var promise = new Promise(function (resolve, reject) {
          (0, _webpack2.default)(config, function (err, stats) {
            if (err) {
              reject(err);
              return;
            }
            resolve(stats);
          });
        });

        promises.push(promise);
      });
      return Promise.all(promises);
    }
  }, {
    key: 'build',
    value: function build(options) {}
  }]);

  return Project;
}();

exports.default = Project;