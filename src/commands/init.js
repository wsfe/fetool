const path = require('path')
const fs = require('fs')
const download = require('download-git-repo')
const ora = require('ora')
const home = require('user-home')
const inquirer = require('inquirer')
const Metalsmith = require('metalsmith')
const rm = require('rimraf').sync

const metadata = require('../config/init.meta')
const getGitUser = require('../utils/git-user')
const ask = require('../utils/ask')
const filter = require('../utils/filter')
const exists = fs.existsSync
const templatePath = 'wsfe/vue-template'
const tmpPath = path.join(home, '.wsfe-templates/single')

export default function init (program) {
  /**
   * Usage.
   */
  program
    .command('init [projectName]')
    .description('generator a new project from template')
    .option('-c, --clone', 'use git clone')
    .action((rawName, cmd) => {
      /**
       * Setting.
       */
      const inPlace = !rawName || rawName === '.'
      const projectName = inPlace ? path.relative('../', process.cwd()) : rawName
      const to = path.resolve(projectName || '.')
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
              run()
            }
          })
          .catch((err) => {
            error(err)
            process.exit(1)
          })
      } else {
        run()
      }

      /**
       * download and generator project.
       */
      function run () {
        const spinner = ora('download template...')
        spinner.start()
        // Remove if local template exists
        if (exists(tmpPath)) rm(tmpPath)
        download(templatePath, tmpPath, { clone }, err => {
          if (err) {
            spinner.stop()
            error('download failed')
            process.exit(1)
          }
          spinner.succeed()
          generate(projectName, tmpPath, to, err => {
            if (err) {
              error(err)
              process.exit(1)
            }
            console.log()
            success('Generated success')
          })
        })
      }

      /**
       * generate project
       */
      function generate (name, src, dest, done) {
        const opts = getOptions(name)
        const metalsmith = Metalsmith(src)
        const data = Object.assign(metalsmith.metadata(), {
          destDirName: name,
          inPlace: dest === process.cwd(),
          noEscape: true
        })

        metalsmith
          // .use(askQuestions(opts.prompts))
          // .use(filterFiles(opts.filters))
          .clean(false)
          .source('.')
          .destination(dest)
          .build((err, files) => {
            done(err)
            sortDependencies(data)
          })
      }

      /**
       * get options from meta
       */
      function getOptions (name) {
        let opts = metadata
        opts.prompts.name.default = name

        const author = getGitUser()
        if (author) {
          opts.prompts.author.default = author
        }

        return opts
      }

      /**
       * Create a middleware for asking questions.
       *
       * @param {Object} prompts
       * @return {Function}
       */

      function askQuestions (prompts) {
        return (files, metalsmith, done) => {
          ask(prompts, metalsmith.metadata(), done)
        }
      }

      /**
       * Create a middleware for filtering files.
       *
       * @param {Object} filters
       * @return {Function}
       */

      function filterFiles (filters) {
        return (files, metalsmith, done) => {
          filter(files, filters, metalsmith.metadata(), done)
        }
      }

      function sortDependencies (data) {
        const packageJsonFile = path.join(
          data.inPlace ? '' : data.destDirName,
          'package.json'
        )
        const packageJson = JSON.parse(fs.readFileSync(packageJsonFile))
        packageJson.devDependencies = sortObject(packageJson.devDependencies)
        packageJson.dependencies = sortObject(packageJson.dependencies)
        fs.writeFileSync(packageJsonFile, JSON.stringify(packageJson, null, 2) + '\n')
      }

      function sortObject (object) {
        // Based on https://github.com/yarnpkg/yarn/blob/v1.3.2/src/config.js#L79-L85
        const sortedObject = {}
        Object.keys(object)
          .sort()
          .forEach(item => {
            sortedObject[item] = object[item]
          })
        return sortedObject
      }
    })
}
