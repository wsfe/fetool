import _ from 'lodash'
import UglifyJS from './uglifyjs'

/**
 * 参考webpack-parallel-uglify-plugin以及uglifyjs-webpack-plugin
 */
export default class Plugin {
  constructor(options = {}) {
    this.options = _.merge({
      compress: {
        dead_code: true
      }
    })
  }

  apply(compiler) {
    compiler.plugin('emit', (compilation, callback) => {
      let tasks = []
      Object.keys(compilation.assets).filter((filename) => {
        return sysPath.extname(filename) === '.js'
      }).forEach((filename) => {
        let asset = compilation.assets[filename]
        tasks.push({
          assetName: filename,
          source: asset.source(),
          uglifyOptions: this.options
        })
      })
      new UglifyJS(compilation, tasks)
        .minify()
        .then(callback, callback)
    })
  }
}