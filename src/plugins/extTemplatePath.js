const REGEXP_NO_EXT_NAME = /\[noextname\]/gi;
const REGEXP_EXT = /\[ext\]/gi;

class ExtTemplatePath {
  constructor(options) {
    this.entryExtNames = options.entryExtNames;
  }

  apply(compiler) {
    compiler.plugin('compilation', (compilation, params) => {
      compilation.mainTemplate.plugin('asset-path', (path, data) => {
        let chunk = data.chunk;
        if (chunk && chunk.name) {
          let chunkName = chunk.name;
          let extName = sysPath.extname(path) || '.js';
          for (let key in this.entryExtNames) {
            let exts = this.entryExtNames[key];
            if (exts.indexOf(extName) > -1) {
              extName = '.' + key;
              break;
            }
          }
          // 替换[name]为文件名，如index.js：[name][ext] => index[ext]
          path = path.replace(REGEXP_NO_EXT_NAME, chunkName.replace(/\.\w+$/g, ''));
        }
        return path.replace(REGEXP_EXT, extName);
      });
    })
  }
}

export default ExtTemplatePath;
