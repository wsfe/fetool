const FILE_NAME_REG = /^([^\@]*)\@?([^\.]+)(\.(js|css))$/;

export default class Version {

  constructor(verFilePath, entryExtNames) {
    this.verFilePath = verFilePath
    this.entryExtNames = entryExtNames
    this.versions = []
    this.versionsJson = {}
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

  generateMapping() {
    return new Promise((resolve, reject) => {
      fs.appendFile(sysPath.join(this.verFilePath, 'versions.mapping'), this.versions.join('\n') + '\n', (err) => {
        if (err) {
          reject(err)
        }
        resolve()
      })
    })
  }

  generateJson() {
    return new Promise((resolve, reject) => {
      let filePath = sysPath.join(this.verFilePath, 'versions.json')
      fs.access(filePath, (err) => {
        if (err) { // 如果不存在
          fs.outputJson(filePath, this.versionsJson).then(() => {
            resolve()
          }).catch(err => {
            reject(err)
          })
        } else {
          fs.readJson(filePath).then(existedVersions => {
            return fs.writeJson(filePath, Object.assign(existedVersions, this.versionsJson))
          }).then(() => {
            resolve()
          }).catch(err => {
            reject(err)
          })
        }
      })
    })
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tapAsync('VersionPlugin', (compilation, callback) => {
      compilation.chunks.forEach(chunk => {
        if (!chunk.name) { // 如果是异步加载形成的chunk，就不会有name这个属性，因此也不需要放到版本号表里面
          return
        }
        chunk.files.forEach((filename) => {
          // 如果是entry里面对象有样式文件（一般在多页应用中出现）,那么会存在chunk.files的长度为2，但是实际中有一个后缀为.js的文件是不存在的，当时在导出的时候已经把它给过滤了。例如：entry里面有个配置是styles/index.less，那么chunk.files的值为[styles/index@哈希值.js,styles/index@哈希值.css]这个时候styles/index@哈希值.js根本不存在compilation.assets里面，因此要删除
          if ((/\.js$/.test(filename) || /\.css$/.test(filename)) && compilation.assets[filename]) {
            let matchInfo = filename.match(FILE_NAME_REG),
              key = matchInfo[1] + matchInfo[3],
              hash = matchInfo[2]
            this.versions.push(`${key}#${hash}`)
            this.versionsJson[key] = hash
          }
        })
      })
      Promise.all([this.generateMapping(), this.generateJson()]).then(() => {
        callback()
      }).catch(err => {
        compilation.errors.push(err)
        callback()
      })
    })
  }
}
