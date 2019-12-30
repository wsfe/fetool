import path from 'path'
import readMetadata from 'read-metadata'
import validatePackageName from 'validate-npm-package-name'
import Metalsmith from 'metalsmith'
import Handlebars from 'handlebars'
import minimatch from 'minimatch'
import multimatch from 'multimatch'
import async from 'async'
import ask from '../utils/ask'
import { existsSync as exists } from 'fs'
import { execSync as exec, spawn } from 'child_process'
import { handlebars } from 'consolidate'

// 注册基础的 handlebars helper
Handlebars.registerHelper('if_eq', function (a, b, opts) {
  return a === b
    ? opts.fn(this)
    : opts.inverse(this)
})

Handlebars.registerHelper('unless_eq', function (a, b, opts) {
  return a === b
    ? opts.inverse(this)
    : opts.fn(this)
})

export default class Generator {
  /**
   * 根据模板生成项目
   * @param {*} name 项目名
   * @param {*} src 模板来源
   * @param {*} dest 目标文件夹
   */
  generate (name, src, dest) {
    const options = this.getOptions(name, src)
    const metalsmith = Metalsmith(path.join(src, 'template'))
    const data = Object.assign(metalsmith.metadata(), {
      destDirName: name,
      inPlace: dest === process.cwd(),
      noEscape: true
    })
    // 注册helper
    this.registerHelper(options)

    // 执行metalsmith的before函数
    if (options.metalsmith && typeof options.metalsmith.before === 'function') {
      opts.metalsmith.before(metalsmith, opts)
    }

    // 加载中间件
    metalsmith
      .use(this.askQuestions(options.prompts))
      .use(this.filterFiles(options.filters))
      .use(this.renderTemplateFiles(options.skipInterpolation))

    // 执行metalsmith函数，或者metalsmith after函数
    if (typeof options.metalsmith === 'function') {
      options.metalsmith(metalsmith, options)
    } else if (options.metalsmith && typeof options.metalsmith.after === 'function') {
      options.metalsmith.after(metalsmith, options)
    }

    return new Promise((resolve, reject) => {
      metalsmith
        .clean(true)
        .source('.')
        .destination(dest)
        .build((err, files) => {
          if (err) {
            reject(err)
          } else {
            resolve()
            setTimeout(() =>{ // 让程序先执行回调
              this.afterGenerate(data)
            })
          }
        })
    })
  }

  afterGenerate (data) {
    this.sortDependencies(data)
    if (data.autoInstall) {
      const cwd = path.join(process.cwd(), data.inPlace ? '' : data.destDirName)
      this.installDependencies(cwd, data.autoInstall)
        .then(() => {
          return this.runLintFix(cwd, data)
        })
        .then(() => {
          success('项目初始化完毕!')
          process.exit()
        })
        .catch(err => {
          error(err)
          process.exit(1)
        })
    } else {
      process.exit()
    }
  }

  /**
   * 根据配置注册helper
   */
  registerHelper (options) {
    options.helpers && Object.keys(options.helpers).forEach(key => {
      Handlebars.registerHelper(key, options.helpers[key])
    })
  }

  /**
   * metalsmith中间件，用于询问meta配置中的prompts问题
   * @param prompts 问题
   */
  askQuestions (prompts) {
    return (files, metalsmith, done) => {
      ask(prompts, metalsmith.metadata(), done)
    }
  }

  /**
   * metalsmith中间件，用于过滤meta配置中的filters文件
   * @param filters
   */
  filterFiles (filters) {
    return (files, metalsmith, done) => {
      if (!filters) {
        return done()
      }

      const fileNames = Object.keys(files)
      const metalsmithMetadata = metalsmith.metadata()

      Object.keys(filters).forEach(glob => {
        fileNames.forEach(file => {
          if (minimatch(file, glob, { dot: true })) {
            const condition = filters[glob]
            if (!this.evaluate(condition, metalsmithMetadata)) {
              delete files[file]
            }
          }
        })
      })
      done()
    }
  }

  /**
   * metalsmith中间件，用于替换文件中的插值
   * @param skipInterpolation 跳过的文件名的匹配规则
   */
  renderTemplateFiles (skipInterpolation) {
    skipInterpolation = typeof skipInterpolation === 'string'
      ? [skipInterpolation]
      : skipInterpolation

    return (files, metalsmith, done) => {
      const keys = Object.keys(files)
      const metalsmithMetadata = metalsmith.metadata()

      async.each(keys, (file, next) => {
        // 根据规则跳过文件
        if (skipInterpolation && multimatch([file], skipInterpolation, { dot: true }).length) {
          return next()
        }

        const str = files[file].contents.toString()
        // 没有插值的文件也不需要替换
        if (!/{{([^{}]+)}}/g.test(str)) {
          return next()
        }

        handlebars.render(str, metalsmithMetadata, (err, res) => {
          if (err) {
            err.message = `[${file}] ${err.message}`
            return next(err)
          }
          files[file].contents = new Buffer.from(res)
          next()
        })
      }, done)
    }
  }

  /**
   * 对package.js中的dependencies进行排序
   * @param data prompts（询问）中获取的数据
   */
  sortDependencies (data) {
    const packageJsonFile = path.join(
      data.inPlace ? '' : data.destDirName,
      'package.json'
    )
    const packageJson = JSON.parse(fs.readFileSync(packageJsonFile))
    packageJson.devDependencies = this.sortObject(packageJson.devDependencies)
    packageJson.dependencies = this.sortObject(packageJson.dependencies)
    fs.writeFileSync(packageJsonFile, JSON.stringify(packageJson, null, 2) + '\n')
  }

  /**
   * 安装依赖
   * @param cwd
   * @param executable
   */
  installDependencies (cwd, executable = 'npm') {
    log('正在安装依赖...')
    return this.runCommand(executable, ['install'], {
      cwd
    })
  }

  /**
   * 在项目中执行npm run lint --fix
   * @param cwd
   * @param data
   */
  runLintFix (cwd, data) {
    if (data.lint) {
      log('正在执行eslint --fix')
      const args =
        data.autoInstall === 'npm'
          ? ['run', 'lint', '--', '--fix']
          : ['run', 'lint', '--fix']
      return this.runCommand(data.autoInstall, args, {
        cwd
      })
    }
    return Promise.resolve()
  }

  /**
   * 获取模板中的配置项
   * @param name 项目名
   * @param dir 模板所在文件夹
   */
  getOptions (name, dir) {
    let options = this.getMetadata(dir)

    this.setDefault(options, 'name', name)
    this.setNameValidator(options)

    const author = this.getGitUser()
    if (author) {
      this.setDefault(options, 'author', author)
    }
    return options
  }

  /**
   * 设置选项的默认值
   * @param options 选项
   * @param key 属性
   * @param val 值
   */
  setDefault (options, key, val) {
    const prompts = options.prompts || (options.prompts = {})
    if (!prompts[key] || typeof prompts[key] !== 'object') {
      prompts[key] = {
        type: 'string',
        default: val
      }
    } else if (prompts[key].default === undefined || prompts[key].default === null) {
      prompts[key].default = val
    }
  }

  /**
   * 重载选项中name的验证函数，用于验证是否符合npm的包名称规则
   * @param options 选项
   */
  setNameValidator (options) {
    const name = options.prompts.name
    const customValidate = name.validate
    name.validate = name => {
      const its = validatePackageName(name)
      if (!its.validForNewPackages) {
        const errors = (its.errors || []).concat(its.warning || [])
        return 'Sorry, ' + errors.join(' and ') + '.'
      }
      if (typeof customValidate === 'function') {
        return customValidate(name)
      }
      return true
    }
  }

  /**
   * 获得模板中的meta数据，存放在meta.json或者meta.js
   * @param dir 模板所在文件夹
   */
  getMetadata (dir) {
    const jsonFile = path.join(dir, 'meta.json')
    const jsFile = path.join(dir, 'meta.js')
    let metadata = {}

    // 读取json文件
    if (exists(jsonFile)) {
      metadata = readMetadata(jsonFile)
    }
    // 读取js文件
    if (exists(jsFile)) {
      const data = require(path.resolve(jsFile))
      if (data !== Object(data)) { // 不是一个对象
        throw new Error('meta.js导出的不是个对象')
      }
      metadata = data
    }
    return metadata
  }

  /**
   * 拿到git config设置的name和email
   */
  getGitUser () {
    let name
    let email

    try {
      name = exec('git config --get user.name')
      email = exec('git config --get user.email')
    } catch (e) {}

    name = name && JSON.stringify(name.toString().trim()).slice(1, -1)
    email = email && (' <' + email.toString().trim() + '>')
    return (name || '') + (email || '')
  }

  /**
   * 执行过滤语句
   * @param exp 语句
   * @param data 数据
   */
  evaluate (exp, data) {
    /* eslint-disable no-new-func */
    const fn = new Function('data', 'with (data) { return ' + exp + '}')
    try {
      return fn(data)
    } catch (e) {
      error('在执行过滤语句的时候出错: ' + exp)
    }
  }

  /**
   * 对对象的属性进行排序
   * 基于https://github.com/yarnpkg/yarn/blob/v1.3.2/src/config.js#L79-L85
   * @param object 对象
   */
  sortObject (object) {
    if (!object) return
    const sortedObject = {}
    Object.keys(object)
      .sort()
      .forEach(item => {
        sortedObject[item] = object[item]
      })
    return sortedObject
  }

  /**
   * 执行命令
   * @param cmd
   * @param args
   * @param options
   */
  runCommand (cmd, args, options) {
    return new Promise((resolve, reject) => {
      const spwan = spawn(
        cmd,
        args,
        Object.assign(
          {
            cwd: process.cwd(),
            stdio: 'inherit',
            shell: true
          },
          options
        )
      )

      spwan.on('exit', () => {
        resolve()
      })
    })
  }
}
