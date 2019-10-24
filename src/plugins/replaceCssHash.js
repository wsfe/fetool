import crypto from 'crypto'
import _ from 'lodash'

const HASH_REG = /@\w+/g

function md5(content) {
  return crypto.createHash('md5').update(content).digest('hex')
}

class ReplaceCssHash {
  constructor() {}

  apply (compiler) {
    compiler.hooks.emit.tapAsync("ReplaceCssHashPlugin", (compilation, callback) => {
      let needRemoveAssets = []
      let assets = compilation.assets
      compilation.chunks.forEach(chunk => {
        let filenames = []
        chunk.files.forEach(filename => {
          if (sysPath.extname(filename) === '.css') {
            let file = compilation.assets[filename]
            let hash = md5(file.source())
            let renderedHash = hash.slice(0, 20)
            let newFilename = filename.replace(HASH_REG, () => {
              return `@${renderedHash}`
            })
            assets[newFilename] = file
            filenames.push(newFilename)
            chunk.hash = hash
            chunk.renderedHash = renderedHash
            needRemoveAssets.push(filename)
          }
        })
        chunk.files = filenames
      })
      assets = _.reduce(assets, (result, value, key) => {
        if (needRemoveAssets.indexOf(key) < 0) {
          result[key] = value
        }
        return result
      }, {})
      compilation.assets = assets
      callback()
    })
  }
}

export default ReplaceCssHash
