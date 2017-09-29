import Config from './config';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import _ from 'lodash';

class MutliConfig extends Config {
  constructor(project) {
    super(project);
    this.cssConfig = _.cloneDeep(this.baseConfig);
    this.jsConfig = _.cloneDeep(this.baseConfig);
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

  getConfig(type) {
    let config = _.cloneDeep(this[(type || 'base') + 'Config']);
    return config;
  }
}

export default MutliConfig;