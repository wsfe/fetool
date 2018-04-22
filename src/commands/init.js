const path = require('path')
const exists = require('fs').existsSync
const download = require('download-git-repo')
const ora = require('ora')
const home = require('user-home')
const inquirer = require('inquirer')
const rm = require('rimraf').sync

const Generate = require('../models/generate')

export default function init (program) {
  /**
   * Usage.
   */
  program
    .command('init [projectName]')
    .description('generator a new project from template')
    .option('-t, --type [value]', 'template type')
    .option('-m, --multi', 'a multi-page application')
    .option('-c, --clone', 'use git clone')
    .action((rawName, cmd) => {
      /**
       * Setting.
       */
      const inPlace = !rawName || rawName === '.'
      const projectName = inPlace ? path.relative('../', process.cwd()) : rawName
      const to = path.resolve(projectName || '.')
      const type = cmd.type
      const multi = cmd.multi
      const clone = cmd.clone

      /**
       * Padding.
       */
      if (inPlace || exists(to)) {
        inquirer
          .prompt([
            {
              type: 'confirm',
              message: inPlace
                ? 'Generate project in current directory?'
                : 'Target directory exists. Continue?',
              name: 'ok'
            }
          ])
          .then(answers => {
            if (answers.ok) {
              run(type, multi)
            }
          })
          .catch(err => {
            error(err)
            process.exit(1)
          })
      } else {
        run(type, multi)
      }

      /**
       * download and generator project.
       */
      function run (type = 'vue', multi) {
        if (multi) type = 'multi'

        const templatePath = `wsfe/fet-templates-${type}`
        const tmpPath = path.join(home, `.fet-templates/${type}`)
        const spinner = ora('download template...')
        spinner.start()
        // Remove if local template exists
        if (exists(tmpPath)) rm(tmpPath)
        download(templatePath, tmpPath, { clone }, err => {
          spinner.stop()
          if (err) {
            error(err)
            process.exit(1)
          }
          new Generate().generate(projectName, tmpPath, to, err => {
            if (err) {
              error(err)
              process.exit(1)
            }
            success('Generate success')
          })
        })
      }
    })
}
