const FILE_NAME_REG = /^([^\@]*)\@?([^\.]+)(\.(js|css))$/;

export default class Version {

  constructor(verFilePath, entryExtNames) {
    this.verFilePath = verFilePath
    this.entryExtNames = entryExtNames
    this.versions = []
  }

  apply(compiler) {
    // compiler.plugin('compilation', (compilation) => {
    //   compilation.plugin('chunk-asset', (chunk, filename) => {
    //     if (/\.js$/.test(filename) || /\.css$/.test(filename)) {
    //       let matchInfo = filename.match(FILE_NAME_REG),
    //         filePath = matchInfo[1] + matchInfo[3],
    //         version = matchInfo[2];
    //         console.log(filePath)
    //       this.versions.push(filePath + '#' + version);
    //     }
    //   })
    // })
    compiler.plugin('after-emit', (compilation, callback) => {
      compilation.chunks.forEach(chunk => {
        let fileParse = sysPath.parse(chunk.name),
          extName = fileParse.ext || '.js',
          name = ''
        Object.keys(this.entryExtNames).forEach(key => {
          if (this.entryExtNames[key].indexOf(extName) > -1) {
            name = sysPath.join(fileParse.dir, `${fileParse.name}.${key}`)
          }
        })
        this.versions.push(`${name}#${chunk.renderedHash}`)
      })
      fs.appendFile(sysPath.join(this.verFilePath, 'versions.mapping'), this.versions.join('\n') + '\n', (err) => {
        if (err) {
          callback(err)
        }
        callback()
      })
    })
  }
}