import webpack from 'webpack';
import _ from 'lodash';
import ComputeCluster from 'compute-cluster';
import shell from 'shelljs';
import mkdirp from 'mkdirp';
import SingleConfig from './single.config';
import MutliConfig from './mutli.config';
import progressPlugin from '../plugins/progress';
import cssIgnoreJSPlugin from '../plugins/cssIgnoreJS';
import utils from '../utils';

const FILE_NAME_REG = /^([^\@]*)\@?([^\.]+)(\.(js|css))$/;

class Project {
  constructor(cwd) {
    this.cwd = cwd;
    this.configFile = sysPath.resolve(this.cwd, 'ft.config');
    let userConfig = this.getUserConfig(this.configFile);
    this.userConfig = userConfig;
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
      let config = this.getConfig(options.min ? 'prd' : 'dev');
      this._setPackConfig(config, options);
      try {
        utils.fs.deleteFolderRecursive(config.output.path);
      } catch (e) {
        error(e);
      }
      promise = this._getPackPromise([config], options);
    } else {
      let cssConfig = this.getConfig(options.min ? 'prd' : 'dev', 'css'),
        jsConfig = this.getConfig(options.min ? 'prd' : 'dev', 'js');
      cssConfig.plugins.push(new cssIgnoreJSPlugin());
      this._setPackConfig(cssConfig, options);
      this._setPackConfig(jsConfig, options);
      try {
        utils.fs.deleteFolderRecursive(cssConfig.output.path);
      } catch (e) {
        error(e);
      }
      promise = this._getPackPromise([cssConfig, jsConfig], options);
    }
    promise.then((statsArr) => {
      this.afterPack(statsArr, options);
      let packDuration = Date.now() - startTime > 1000
        ? Math.floor((Date.now() - startTime) / 1000) + 's'
        : Date.now() - startTime + 'ms';
      log('Packing Finished in ' + packDuration + '.\n');
    }).catch((reason) => {
      error(reason.stack || reason);
      if (reason.details) {
        error(reason.details);
      }
    });
  }

  afterPack(statsArr, options) {
    statsArr.forEach((stats) => {
      this._logPack(stats);
    });
    if (options.min) {
      this._generateVersion(statsArr);
    }
  }

  _generateVersion(statsArr) {
    let verPath = sysPath.join(this.cwd, 'ver');
    if (fs.existsSync(verPath)) {
      shell.rm('-rf', verPath);
    }
    mkdirp.sync(verPath);

    let versions = [];
    statsArr.forEach(stats => {
      let info = stats.toJson({ errorDetails: false });
      info.assets.map(asset => {
        let name = asset.name;
        if (/\.js$/.test(name) || /\.css$/.test(name)) {
          let matchInfo = name.match(FILE_NAME_REG),
          filePath = matchInfo[1] + matchInfo[3],
          version = matchInfo[2];
          versions.push(filePath + '#' + version);
        }
      });
    });
    fs.writeFileSync(sysPath.join(verPath, 'versions.mapping'), versions.join('\n'), 'UTF-8');
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

    info.assets.map(asset => {
      let fileSize = asset.size;
      fileSize = fileSize > 1024
        ? (fileSize / 1024).toFixed(2) + ' KB'
        : fileSize + ' Bytes';
      log(`- ${asset.name} - ${fileSize}`);
    });
  }

  _setPackConfig(config, options) {
    if (options.min) {
      config.devtool = '';
    }
    config.plugins.push(progressPlugin);
  }

  _getPackPromise(configs, options) {
    let promises = [];
    configs.forEach((config) => {
      let promise = new Promise((resolve, reject) => {
        webpack(config, (err, stats) => {
          if (err) {
            reject(err);
            return;
          }
          if (options.min) {
            this._min(stats, config.output.path).then(() => {
              resolve(stats);
            });
          } else {
            resolve(stats);
          }
        });
      });

      promises.push(promise);
    });
    return Promise.all(promises);
  }

  _min(stats, cwd) {
    let cc = new ComputeCluster({
      module: sysPath.resolve(__dirname, '../utils/uglifyWorker.js'),
      max_backlog: -1
    });
    let resolve;
    let promise = new Promise((res, rej) => {
      resolve = res;
    });
    let assets = stats.toJson({
      errorDetails: false
    }).assets;
    let processToRun = assets.length;
    assets.forEach((asset) => {
      cc.enqueue({
        cwd,
        assetName: asset.name
      }, (err, response) => {
        if (response.error) {
          spinner.text = '';
          spinner.stop();
          info('\n');
          spinner.text = `error occured while minifying ${response.error.assetName}`;
          spinner.fail();
          error(`line: ${response.error.line}, col: ${response.error.col} ${response.error.message} \n`);
          spinner.start();
        }
        processToRun--;
        spinner.text = `[Minify] ${assets.length -
          processToRun}/${assets.length} assets`;
        if (processToRun === 0) {
          cc.exit();
          spinner.stop();
          logWithTime('minify complete!');
          resolve();
        }
      });
    });

    spinner.start();

    return promise;
  }

  build(options) {
    let child = shell.exec('fet pack -m');
    if (child.code !== 0) {
      error('Building encounted error while executing: fet pack -m');
      process.exit(1);
    }
  }

}

export default Project;