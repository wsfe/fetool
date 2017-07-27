import Config from './config';
import webpackMerge from 'webpack-merge';
import _ from 'lodash';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

class SingleConfig extends Config {
  constructor(project) {
    super(project);
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
      this.baseConfig = webpackConfig.call(this, this.baseConfig, {env: this.NODE_ENV, plugins: {ExtractTextPlugin}}, this);
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
    let isExitExtractTextPlugin = this.baseConfig.plugins.some((plugin) => { // 判断是否是整个项目共用一个ExtractTextPlugin
      return plugin instanceof ExtractTextPlugin;
    });
    if (!isExitExtractTextPlugin) {
      let filename = 'base@[chunkhash].css';
      if (this.NODE_ENV === ENV.LOC) {
        filename = 'base.css';
      } else if (this.NODE_ENV === ENV.DEV){
        filename = 'base@dev.css';
      }
      this.baseConfig.plugins.push(new ExtractTextPlugin({
        filename
      }));
    }
  }
}

export default SingleConfig;