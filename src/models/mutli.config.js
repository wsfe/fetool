import Config from './config';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

class MutliConfig extends Config {
  constructor(cwd, userConfig) {
    super(cwd, userConfig);
    this.cssConfig = _.cloneDeep(this.baseConfig);
    this.jsConfig = _.cloneDeep(this.baseConfig);
    this.setDefaultModuleRules();
    this.setWebpackConfig(this.extendConfig.webpackConfig);
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
        use: [require.resolve('css-loader'), require.resolve('china-sass-loader')]
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
      let result = webpackConfig(this.jsConfig, this.cssConfig);
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
    this.fixPlugins();
  }

  fixPlugins() {
    let isExitExtractTextPlugin = this.cssConfig.plugins.some((plugin) => {
      return plugin instanceof ExtractTextPlugin;
    });
    if (!isExitExtractTextPlugin) {
      this.cssConfig.plugins.push(new ExtractTextPlugin(this.cssConfig.output.filename.replace('[ext]', '.css')))
    }
  }

  getConfig(env, type) {
    let config = _.cloneDeep(this[type + 'Config']);
    config.output = config.output[env];
    return config;
  }
}

export default MutliConfig;