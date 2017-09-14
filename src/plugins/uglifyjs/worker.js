import uglifyJS from 'uglify-js'
import { RawSource } from 'webpack-sources'

export default (task, cb) => {
  return new Promise((resolve, reject) => {
    let result = uglifyJS.minify(task.source, task.uglifyOptions)
    if (result.error) {
      error('task.assetName=============', task.assetName)
      cb(result.error)
      reject(result.error)
    } else {
      let source = new RawSource(result.code)
      cb(null, source)
      resolve(source)
    }
  })
}