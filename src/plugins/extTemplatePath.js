const REGEXP_NO_EXT_NAME = /\[noextname\]/gi;
const REGEXP_EXT = /\[ext\]/gi;

class ExtTemplatePath {
  constructor(options) {
    this.entryExtNames = options.entryExtNames;
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('ExtTemplatePathPlugin', compilation => {
      compilation.mainTemplate.hooks.assetPath.tap('AssetPath', (filename, data) => {
        let chunk = data.chunk;
        let extName = sysPath.extname(filename) || '.js';
        if (chunk && chunk.name) {
          let chunkName = chunk.name;
          for (let key in this.entryExtNames) {
            let exts = this.entryExtNames[key];
            if (exts.indexOf(extName) > -1) {
              extName = '.' + key;
              break;
            }
          }
          // 替换[name]为文件名，如index.js：[name][ext] => index[ext]
          filename = filename.replace(REGEXP_NO_EXT_NAME, chunkName.replace(/\.\w+$/g, ''));
        }
        return filename.replace(REGEXP_EXT, extName);
      })
    })
  }
}

export default ExtTemplatePath;
