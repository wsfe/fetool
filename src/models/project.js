import webpack from 'webpack';
import _ from 'lodash';
import shell from 'shelljs';
import mkdirp from 'mkdirp';
// import UglifyJSPlugin from 'uglifyjs-webpack-plugin';
import ParallelUglifyPlugin from 'webpack-parallel-uglify-plugin';
import SingleConfig from './single.config';
import MutliConfig from './mutli.config';
import {
  progressPlugin,
  UglifyCSSPlugin,
  HtmlCompilerPlugin,
  VersionPlugin,
  CssIgnoreJSPlugin,
  CompilerLoggerPlugin,
  UglifyJSPlugin
} from '../plugins';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

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
      this._setHtmlComplierPlugin(config, options);
      this._setPublicPath(config, options.env);
      fs.removeSync(outputPath);
      promise = this._getPackPromise([config], options);
    } else { // 如果是多页模式
      let cssConfig = this.getConfig(options.min ? 'prd' : 'dev', 'css'),
        jsConfig = this.getConfig(options.min ? 'prd' : 'dev', 'js'),
        configs = [jsConfig]; // 默认会有js配置
      outputPath = jsConfig.output.path;
      if (!_.isEmpty(cssConfig.entry)) {
        cssConfig.plugins.push(new CssIgnoreJSPlugin());
        this._setPackConfig(cssConfig, options);
        this._setPublicPath(cssConfig, options.env);
        configs.push(cssConfig);
      }
      this._setPackConfig(jsConfig, options);
      this._setHtmlComplierPlugin(jsConfig, options);
      this._setPublicPath(jsConfig, options.env);
      fs.removeSync(outputPath); // cssConfig和jsConfig的out.path是一样的，所以只需要删除一次就行。
      promise = this._getPackPromise(configs, options);
    }
    this._clearVersion();
    promise.then((statsArr) => {
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
  }

  /**
   * 清理版本号文件夹
   */
  _clearVersion() {
    let verPath = sysPath.join(this.cwd, 'ver');
    if (fs.existsSync(verPath)) {
      shell.rm('-rf', verPath);
    }
    mkdirp.sync(verPath);
  }

  _setPackConfig(config, options) {
    config.devtool = '';
    // if (options.min) {
    //   config.devtool = '';
    // }
    config.plugins.push(progressPlugin);
    config.plugins.push(new webpack.optimize.ModuleConcatenationPlugin());
    // config.plugins.push(new CompilerLoggerPlugin());
    if (options.min) {
      config.plugins.push(new UglifyJSPlugin());
      config.plugins.push(new UglifyCSSPlugin());
      config.plugins.push(new VersionPlugin(sysPath.join(this.cwd, 'ver'), this.config.entryExtNames));
    }
    if (options.analyze) { // 是否启用分析
      config.plugins.push(new BundleAnalyzerPlugin());
    }
  }

  _setHtmlComplierPlugin(config, options) {
    if (options.compile === 'html') {
      config.plugins.push(new HtmlCompilerPlugin(this.cwd, options.path));
    }
  }

  _setPublicPath(config, env) {
    let domain = '//img.chinanetcenter.com';
    if (env) { // 如果指定了环境
      domain = `${this.userConfig.servers[env]['domain']}`;
    } else { // 如果没有指定环境
      let globalConfig = JSON.parse(fs.readFileSync(FET_RC, { encoding: 'utf8' }));
      if (globalConfig.domain) { // 如果有设置全局的默认域名
        domain = globalConfig.domain;
      }
    }
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
          resolve(stats);
        });
      });

      promises.push(promise);
    });
    return Promise.all(promises);
  }

  build(options) {
    this.pack(Object.assign({
      min: true
    }, options || {}));
  }

}

export default Project;