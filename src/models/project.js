import webpack from 'webpack';
import _ from 'lodash';
import ComputeCluster from 'compute-cluster';
import shell from 'shelljs';
import mkdirp from 'mkdirp';
import url from 'url';
import SingleConfig from './single.config';
import MutliConfig from './mutli.config';
import progressPlugin from '../plugins/progress';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import cssIgnoreJSPlugin from '../plugins/cssIgnoreJS';
import utils from '../utils';

const FILE_NAME_REG = /^([^\@]*)\@?([^\.]+)(\.(js|css))$/;
const INCLUDE_REG = /<include\s+(.*\s)?src\s*=\s*"(\S+)".*><\/include>/g

class Project {
  /**
   * Project 构造函数
   * @param {当前的工作目录} cwd 
   * @param {运行环境，'development或者production'} env 
   */
  constructor(cwd, env) {
    this.cwd = cwd;
    this.NODE_ENV = env;
    this.configFile = sysPath.resolve(this.cwd, 'ft.config');
    let userConfig = this.getUserConfig(this.configFile);
    this.userConfig = userConfig;
    this.mode = userConfig.mode || MUTLI_MODE;
    if (this.mode === SINGLE_MODE) {
      this.config = new SingleConfig(this);
    } else if (this.mode === MUTLI_MODE) {
      this.config = new MutliConfig(this);
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
  getServerCompiler({ cb, type } = {}) {
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
    spinner.text = 'start pack';
    spinner.start();
    let startTime = Date.now(); // 编译开始时间
    let outputPath;
    let promise = null;
    if (this.mode === SINGLE_MODE) { // 如果是单页模式
      let config = this.getConfig(options.min ? 'prd' : 'dev');
      outputPath = config.output.path;
      this._setPackConfig(config, options);
      this._setPublicPath(config, options.env);
      fs.removeSync(outputPath);
      promise = this._getPackPromise([config], options);
    } else { // 如果是多页模式
      let cssConfig = this.getConfig(options.min ? 'prd' : 'dev', 'css'),
        jsConfig = this.getConfig(options.min ? 'prd' : 'dev', 'js');
      outputPath = cssConfig.output.path;
      cssConfig.plugins.push(new cssIgnoreJSPlugin());
      this._setPackConfig(cssConfig, options);
      this._setPackConfig(jsConfig, options);
      this._setPublicPath(cssConfig, options.env);
      this._setPublicPath(jsConfig, options.env);
      fs.removeSync(outputPath); // cssConfig和jsConfig的out.path是一样的，所以只需要删除一次就行。
      promise = this._getPackPromise([cssConfig, jsConfig], options);
    }
    promise.then((statsArr) => {
      this.afterPack(statsArr, options);
      let packDuration = Date.now() - startTime > 1000
        ? Math.floor((Date.now() - startTime) / 1000) + 's'
        : Date.now() - startTime + 'ms';
      log('Packing Finished in ' + packDuration + '.\n');
      if (!options.analyze) { // 如果需要分析数据，就不要退出进程
        process.exit(); // 由于编译html比编译js快，所以可以再这边退出进程。
      }
    }).catch((reason) => {
      error(reason.stack || reason);
      if (reason.details) {
        error(reason.details);
      }
      process.exit();
    });

    if (options.compile === 'html') { // 如果需要编译html
      this._compileHtml(outputPath);
    }
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
    config.devtool = '';
    // if (options.min) {
    //   config.devtool = '';
    // }
    config.plugins.push(progressPlugin);
    config.plugins.push(new webpack.optimize.ModuleConcatenationPlugin());
    if (options.analyze) { // 是否启用分析
      config.plugins.push(new BundleAnalyzerPlugin());
    }
  }

  _setPublicPath(config, env) {
    let domain = env? `${this.userConfig.servers[env]['domain']}`: '//img.chinanetcenter.com';
    config.output.publicPath = `${domain}${config.output.publicPath}`;
  }

  _getPackPromise(configs, options) {
    let promises = [];
    let configsLen = configs.length;
    configs.forEach((config) => {
      let promise = new Promise((resolve, reject) => {
        webpack(config, (err, stats) => {
          configsLen--;
          if (configsLen === 0) {
            spinner.text = 'end pack';
            spinner.text = '';
            spinner.stop();
          }
          if (err) {
            reject(err);
            return;
          }
          if (options.min) {
            spinner.start();
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

  /**
   * 压缩编译之后的代码代码
   * @param {编译之后的数据} stats 
   * @param {文件路径} cwd 
   */
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

    return promise;
  }

  /**
   * 用来编译自定义的html
   * @param {输出路径} outputPath 
   */
  _compileHtml(outputPath) {
    let dist = sysPath.join(outputPath, 'html');
    fs.copy(sysPath.join(this.cwd, 'src/html'), dist, err => {
      if (err) {
        error('compile html failed:');
        error(err);
      } else {
        utils.fs.readFileRecursiveSync(dist, ['html', 'htm'], (filePath, content) => {
          content = content.toString();
          let contentChange = false; // 默认内容没有更改
          content = content.replace(INCLUDE_REG, ($0, $1, $2, $3) => {
            contentChange = true;
            return fs.readFileSync(url.resolve(filePath, $2), 'utf8');
          });
          if (contentChange) { // 如果内容更改了，那么就重写如文件里面
            fs.writeFileSync(filePath, content);
          }
        });
        success('compile html success!');
      }
    });
  }

  build(options) {
    this.pack(Object.assign({
      min: true
    }, options || {}));
  }

}

export default Project;