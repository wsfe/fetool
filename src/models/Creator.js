import path from 'path'
import download from 'download-git-repo'
import ora from 'ora'
import home from 'user-home'
import inquirer from 'inquirer'
import { sync as rm } from 'rimraf'
import { existsSync as exists } from 'fs'
import Generator  from './Generator'

export default class Creator {
  /**
   * 创建项目的类
   * @param {String} projectName 项目名
   * @param {String} destDir 目标文件夹
   */
  constructor (projectName, destDir) {
    this.projectName = projectName
    this.destDir = destDir
  }

  /**
   * 创建项目的入口
   * @param {Object} options 命令参数
   */
  create (options) {
    this.confirmCreate() // 确认创建
      .then(() => {
        if (options.url) {
          return Promise.resolve({ templatePath: options.url })
        }
        return this.selectTemplate() // 选择模板
      })
      .then(({templatePath, clone}) => {
        // templatePath: 模板的下载路径
        // clone: 是否使用git clone
        return this.downloadTemplate(templatePath, options.clone || clone ) // 下载模板
      })
      .then(tmpPath => {
        // tmpPath: 存放模板的本地路径
        // 生成项目
        return new Generator()
          .generate(this.projectName, tmpPath, this.destDir)
      })
      .then(() => {
        success('项目创建成功')
      })
      .catch(err => {
        this.exit(err)
      })
  }


  /**
   * 确定创建，防止误操作
   */
  confirmCreate () {
    return new Promise((resolve, reject) => {
      if (this.inCurrent || exists(this.destDir)) {
        inquirer
          .prompt([
            {
              type: 'confirm',
              message: this.inCurrent
                ? '在当前文件夹创建项目?'
                : '目标文件夹已存在, 是否覆盖并继续?',
              name: 'inCurrent'
            }
          ])
          .then(answers => {
            if (answers.inCurrent) {
              resolve()
            }
          })
          .catch(this.exit)
      } else {
        resolve()
      }
    })
  }

  /**
   * 选择模板
   */
  selectTemplate () {
    const { templatePathMap, templateList } = this.getTemplateData()
    return inquirer
      .prompt([
        {
          type: 'list',
          message: '请选择一种模板',
          name: 'template',
          default: templateList[0],
          choices: templateList
        }
      ])
      .then(({ template }) => {
        let templatePath = templatePathMap[template]
        let clone = false
        // 是否私有库
        const isPrivate = /^private:/.test(templatePath)
        if (isPrivate) {
          // 替换private为direct
          templatePath = templatePath.replace(/^private/, 'direct')
          // 如果不是zip，则使用git clone
          if (!/zip$/.test(templatePath)) {
            clone = true
          }
        }
        return {
          templatePath,
          clone
        }
      })
      .catch(this.exit)
  }

  /**
   * 下载模板
   */
  downloadTemplate (templatePath, clone) {
    const tmpPath = path.join(home, '.fet-template') // 模板在本地存放的位置
    // 如果已经下载过，则将其删除【因为要更新】
    if (exists(tmpPath)) {
      rm(tmpPath)
    }
    return new Promise((resolve, reject) => {
      const spinner = ora('模板下载中...')
      spinner.start()
      download(templatePath, tmpPath, { clone }, err => {
        spinner.stop()
        if (err) {
          this.exit(err)
        }
        resolve(tmpPath)
      })
    })
  }

  /**
  * 获取模版数据
  */
  getTemplateData () {
    let globalConfig = JSON.parse(fs.readFileSync(FET_RC, { encoding: 'utf8' }))
    let templatePathMap = {
      'vue(单页)': 'wsfe/fet-templates-vue', // 单页应用
      'multi(多页)': 'wsfe/fet-templates-multi', // 多页应用
      'component(组件)': 'wsfe/fet-templates-component' // 组件
    }
    Object.keys(globalConfig).forEach(key => {
      if (globalConfig[key]) {
        const matchs = key.match(/^template-(.+)$/)
        if (matchs && matchs.length >= 2) {
          templatePathMap[matchs[1]] = globalConfig[key]
        }
      }
    })
    return {
      templatePathMap,
      templateList: Object.keys(templatePathMap)
    }
  }

  /**
   * 错误退出
   */
  exit (err) {
    error(err)
    process.exit(1)
  }
}
