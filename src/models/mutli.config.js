import Config from './config';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import _ from 'lodash';

class MutliConfig extends Config {
  constructor(project) {
    super(project);
    this.cssConfig = _.cloneDeep(this.baseConfig);
    this.jsConfig = _.cloneDeep(this.baseConfig);
    this.setDefaultModuleRules();
    this.separateEntry();
    this.setWebpackConfig(this.extendConfig.webpackConfig);
  }

  /**
   * 将entry进行分类
   */
  separateEntry() {
    this.cssConfig.entry = {};
    this.jsConfig.entry = {};
    let entry = this.baseConfig.entry;
    Object.keys(entry).forEach((key) => {
      let type = this.getSourceType(key);
      this[type + 'Config'].entry[key] = entry[key];
    });
  }

  setDefaultModuleRules() {
    this.cssConfig.module.rules = _.concat(this.cssConfig.module.rules, [{
      test: /\.css$/,
      use: ExtractTextPlugin.extract({
        fallback: require.resolve('style-loader'),
        use: require.resolve('css-loader')
      })
    }, {
      test: /\.less$/,
      use: ExtractTextPlugin.extract({
        fallback: require.resolve('style-loader'),
        use: [require.resolve('css-loader'), require.resolve('less-loader')]
      })
    }, {
      test: /\.(scss|sass)$/,
      use: ExtractTextPlugin.extract({
        fallback: require.resolve('style-loader'),
        use: [require.resolve('css-loader'), require.resolve('sass-loader')]
      })
    }]);

    this.jsConfig.module.rules = _.concat(this.jsConfig.module.rules, [{
      test: /\.css$/,
      use: [require.resolve('style-loader'), require.resolve('css-loader')]
    }, {
      test: /\.less$/,
      use: [require.resolve('style-loader'), require.resolve('css-loader'), require.resolve('less-loader')]
    }, {
      test: /\.(scss|sass)$/,
      use: [require.resolve('style-loader'), require.resolve('css-loader'), require.resolve('sass-loader')]
    }]);
  }

  setWebpackConfig(webpackConfig = {}) {
    if (typeof webpackConfig === 'function') {
      let result = webpackConfig.call(this, this.jsConfig, this.cssConfig, {env: this.NODE_ENV, plugins: { ExtractTextPlugin }}, this);
      if (result.jsConfig) {
        this.jsConfig = result.jsConfig;
      } else {
        this.jsConfig = result;
      }
      if (result.cssConfig) {
        this.cssConfig = result.cssConfig;
      }
    } else {
      console.error('webpackConfig 设置错误');
      return;
    }
    this.fixContext(this.jsConfig);
    this.fixAlias(this.jsConfig);
    this.fixOutput(this.jsConfig);

    this.fixContext(this.cssConfig);
    this.fixAlias(this.cssConfig);
    this.fixOutput(this.cssConfig);
  }

  /**
   * 
   * @param {配置文件} config 
   * @description 补充那些没有添加上去的插件，有可能jsconfig可以不需要，不过这里都添加上去了，之后如果出现bug，就需要处理。
   */
  fixPlugins(config) {
    let isExitExtractTextPlugin = config.plugins.some((plugin) => {
      return plugin instanceof ExtractTextPlugin;
    });
    if (!isExitExtractTextPlugin) {
      config.plugins.push(new ExtractTextPlugin(config.output.filename.replace('[ext]', '.css')))
    }
  }

  getConfig(env, type) {
    let config = _.cloneDeep(this[(type || 'base') + 'Config']);
    config.output = config.output[env];
    this.fixPlugins(config);
    return config;
  }
}

export default MutliConfig;