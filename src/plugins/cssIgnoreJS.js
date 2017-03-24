import _ from 'lodash';

/**
 * 对于多页面模式，我们需要删除生成css文件的时候，生成的多余js文件
 */
class CSSIgnoreJS {
  constructor() {}

  apply(compiler) {
    compiler.plugin('emit', (compilation, callback) => {
      let assets = {};
      Object.keys(compilation.assets).forEach((key) => {
        if (!/.*\.js(\.map)?$/.test(key)) { // 如果不是js
          assets[key] = compilation.assets[key];
        }
      });
      compilation.assets = assets;
      callback();
    });
  }
}

export default CSSIgnoreJS;