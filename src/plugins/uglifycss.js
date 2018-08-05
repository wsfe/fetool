import uglifycss from 'uglifycss'
import { RawSource } from 'webpack-sources'

class UglifyCSS {
  constructor(options) {
  }
  apply(compiler) {
    compiler.plugin('emit', (compilation, callback) => {
      compilation.chunks.forEach((chunk) => {
        chunk.files.forEach((filename) => {
          if (sysPath.extname(filename) === '.css') {
            let file = compilation.assets[filename];
            let code = uglifycss.processString(file.source())
            compilation.assets[filename] = new RawSource(code)
          }
        })
      })
      callback()
    })
  }
}

export default UglifyCSS
