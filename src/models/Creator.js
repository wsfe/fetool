import Generator  from './Generator'

const path = require('path')
const exists = require('fs').existsSync
const download = require('download-git-repo')
const ora = require('ora')
const home = require('user-home')
const inquirer = require('inquirer')
const rm = require('rimraf').sync

export default class Creator {
  constructor (projectName, destDir) {
    this.projectName = projectName
    this.destDir = destDir
  }

  create (options) {
    this.confirmCreate() // 确认创建
      .then(() => {
        return this.selectTemplate() // 选择模板
      })
      .then(({templatePath, clone}) => {
        return this.downloadTemplate(templatePath, clone) // 下载模板
      })
      .then(tmpPath => {
        new Generator().generate(this.projectName, path.join(home, '/Documents/wangsu/fet-templates-vue'), this.destDir, err => {
          if (err) {
            this.exit(err)
          }
          success('项目创建成功')
        })
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
      'spa': 'wsfe/fet-templates-vue', // 单页应用
      'mpa': 'wsfe/fet-templates-multi' // 多页应用
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
