import Config from './config';
import webpackMerge from 'webpack-merge';
import _ from 'lodash';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

class SingleConfig extends Config {
  constructor(cwd, userConfig) {
    super(cwd, userConfig);
    this.setDefaultModuleRules();
    this.setWebpackConfig(this.extendConfig.webpackConfig);
  }

  setDefaultModuleRules() {
    this.baseConfig.module.rules = _.concat(this.baseConfig.module.rules, [{
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
    }])
  }

  setWebpackConfig(webpackConfig = {}) {
    if (typeof webpackConfig === 'object') {
      webpackMerge(this.baseConfig, webpackConfig);
    } else if (typeof webpackConfig === 'function') {
      this.baseConfig = webpackConfig(this.baseConfig);
    } else {
      console.error('webpackConfig 设置错误');
      return;
    }
    this.fixContext(this.baseConfig);
    this.fixAlias(this.baseConfig);
    this.fixOutput(this.baseConfig);
    this.fixPlugins();
  }

  fixPlugins() {
    let isExitExtractTextPlugin = this.baseConfig.plugins.some((plugin) => {
      return plugin instanceof ExtractTextPlugin;
    });
    if (!isExitExtractTextPlugin) {
      this.baseConfig.plugins.push(new ExtractTextPlugin('style.css'))
    }
  }
}

export default SingleConfig;