import webpack from 'webpack';
import _ from 'lodash';
import SingleConfig from './single.config';
import MutliConfig from './mutli.config';
import progressPlugin from '../plugins/progress';
import utils from '../utils';

class Project {
  constructor(cwd) {
    this.cwd = cwd;
    this.configFile = sysPath.resolve(this.cwd, 'ft.config');
    let userConfig = this.getUserConfig(this.configFile);
    this.mode = userConfig.mode || MUTLI_MODE;
    if (this.mode === SINGLE_MODE) {
      this.config = new SingleConfig(cwd, userConfig);
    } else if (this.mode === MUTLI_MODE) {
      this.config = new MutliConfig(cwd, userConfig);
    }
  }

  getUserConfig(module) {
    delete require.cache[require.resolve(module)];
    return require(module);
  }

  /**
   * 
   * @param {cb: funtion, type: 'base|js|css'} cb，主要是对config进行再加工，type：主要是指定哪一种配置，分为三种，baseConfig,jsConfig,cssConfig
   */
  getServerCompiler({ cb, type }) {
    let config = {};
    if (this.mode === SINGLE_MODE) {
      config = this.getConfig('local');
    } else {
      config = this.getConfig('local', type);
    }
    if (_.isFunction(cb)) {
      config = cb(config);
    }
    config.plugins.push(progressPlugin);
    return webpack(config);
  }

  getConfig(env, type) {
    return this.config.getConfig(env, type);
  }

  pack(options) {
    let startTime = Date.now();
    let promise = null;
    if (this.mode === SINGLE_MODE) {
      let config = this.getConfig('dev');
      this._setPackConfig(config);
      try {
        utils.fs.deleteFolderRecursive(config.output.path);
      } catch (e) {
        error(e);
      }
      promise = this._getPackPromise([config]);
    } else {
      let cssConfig = this.getConfig('dev', 'css'),
        jsConfig = this.getConfig('dev', 'js');
      this._setPackConfig(cssConfig);
      this._setPackConfig(jsConfig);
      try {
        utils.fs.deleteFolderRecursive(cssConfig.output.path);
      } catch (e) {
        error(e);
      }
      promise = this._getPackPromise([cssConfig, jsConfig]);
    }
    promise.then((statsArr) => {
      statsArr.forEach((stats) => {
        this._logPack(stats);
      });
      let packDuration = Date.now() - packStartTime > 1000
        ? Math.floor((Date.now() - packStartTime) / 1000) + 's'
        : Date.now() - packStartTime + 'ms';
      log('Packing Finished in ' + packDuration + '.\n');
    }).catch((reason) => {
      error(reason.stack || reason);
      if (reason.details) {
        error(reason.details);
      }
    });
  }

  _logPack(stats) {
    let info = stats.toJson({ errorDetails: false });

    if (stats.hasErrors()) {
      info.errors.map((err) => {
        error(err + '\n');
      });
    }

    if (stats.hasWarnings()) {
      info.warnings.map((warning) => {
        warn(warning + '\n');
      });
    }

    stats.assets.map(asset => {
      
    });
  }

  _setPackConfig(config) {
    config.plugins.push(progressPlugin);
  }

  _getPackPromise(configs) {
    let promises = [];
    configs.forEach((config) => {
      let promise = new Promise((resolve, reject) => {
        webpack(config, (err, stats) => {
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

  build(options) { }

}

export default Project;