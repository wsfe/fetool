import Config from './config';
import webpackMerge from 'webpack-merge';
import _ from 'lodash';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

class SingleConfig extends Config {
  constructor(project) {
    super(project);
    this.setWebpackConfig(this.extendConfig.webpackConfig);
  }

  setWebpackConfig(webpackConfig = {}) {
    if (typeof webpackConfig === 'object') {
      webpackMerge(this.baseConfig, webpackConfig);
    } else if (typeof webpackConfig === 'function') {
      this.baseConfig = webpackConfig.call(this, this.baseConfig, {env: this.NODE_ENV, plugins: {ExtractTextPlugin}}, this);
    } else {
      error('webpackConfig 设置错误');
      return;
    }
    this.fixContext(this.baseConfig);
    this.fixAlias(this.baseConfig);
    this.fixOutput(this.baseConfig);
  }
}

export default SingleConfig;