import url from 'url'
import utils from '../utils'

const INCLUDE_REG = /<include\s+(.*\s)?src\s*=\s*"(\S+)".*><\/include>/g

export default class HtmlCompiler {
  constructor(cwd, outputPath) {
    this.cwd = cwd
    this.outputPath = outputPath
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tapAsync('HtmlCompilerPlugin', (compilation, callback) => {
      let sourcePath = sysPath.join(this.cwd, this.outputPath) // 待编译的地址，相对于webpack配置的contex这个字段
      let dist = sysPath.join(compiler.options.output.path, 'html') // 默认存放到html文件夹
      fs.copy(sourcePath, dist, err => {
        if (err) {
          error('compile html failed:')
          callback(err)
        } else {
          try {
            utils.fs.readFileRecursiveSync(dist, ['html', 'htm'], (filePath, content) => {
              content = content.toString();
              let contentChange = false; // 默认内容没有更改
              content = content.replace(INCLUDE_REG, ($0, $1, $2, $3) => {
                contentChange = true;
                return fs.readFileSync(url.resolve(filePath, $2), 'utf8');
              });
              if (contentChange) { // 如果内容更改了，那么就重写如文件里面
                fs.writeFileSync(filePath, content);
              }
            });
            success('compile html success!');
          } catch(err) {
            compilation.errors.push(err)
          }
          callback()
        }
      });
    })
  }
}
