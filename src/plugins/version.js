const FILE_NAME_REG = /^([^\@]*)\@?([^\.]+)(\.(js|css))$/;

export default class Version {

  constructor(verFilePath, entryExtNames) {
    this.verFilePath = verFilePath
    this.entryExtNames = entryExtNames
    this.versions = []
  }

  getKey(fileParse) {
    let name = '',
      extName = fileParse.ext || '.js'
    Object.keys(this.entryExtNames).forEach(key => {
      if (this.entryExtNames[key].indexOf(extName) > -1) {
        name = sysPath.join(fileParse.dir, `${fileParse.name}.${key}`)
      }
    })
    return name
  }

  apply(compiler) {
    compiler.plugin('after-emit', (compilation, callback) => {
      compilation.chunks.forEach(chunk => {
        if (!chunk.name) {
          return
        }
        chunk.files.forEach((filename) => {
          if (/\.js$/.test(filename) || /\.css$/.test(filename)) {
            let matchInfo = filename.match(FILE_NAME_REG),
              key = matchInfo[1] + matchInfo[3],
              hash = matchInfo[2]
            this.versions.push(`${key}#${hash}`)
          }
        })
      })
      fs.appendFile(sysPath.join(this.verFilePath, 'versions.mapping'), this.versions.join('\n') + '\n', (err) => {
        if (err) {
          compilation.errors.push(err)
        }
        callback()
      })
    })
  }
}