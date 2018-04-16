const path = require('path')
const fs = require('fs')
const download = require('download-git-repo')
const ora = require('ora')
const home = require('user-home')
const inquirer = require('inquirer')
const Metalsmith = require('metalsmith')
const match = require('minimatch')
const multimatch = require('multimatch')
const async = require('async')
const Handlebars = require('handlebars')
const render = require('consolidate').handlebars.render
const rm = require('rimraf').sync
const spawn = require('child_process').spawn

const ask = require('../utils/ask')
const evaluate = require('../utils/eval')
const getOptions = require('../utils/options')

const exists = fs.existsSync

export default function init (program) {
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
              chooseTemplate()
            }
          })
          .catch(err => {
            error(err)
            process.exit(1)
          })
      } else {
        chooseTemplate()
      }

      /**
       * choose a template: vue/angular/react
       */
      function chooseTemplate () {
        run()
        // inquirer
        //   .prompt([
        //     {
        //       type: 'list',
        //       message: 'what template do you want?',
        //       name: 'templateName',
        //       choices: [
        //         'vue',
        //         'angular',
        //         'react'
        //       ],
        //       default: 'vue'
        //     }
        //   ])
        //   .then(answers => {
        //     run(answers.templateName)
        //   })
        //   .catch(err => {
        //     error(err)
        //     process.exit(1)
        //   })
      }

      /**
       * download and generator project.
       */
      function run (type = 'vue') {
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

// register handlebars helper
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
class Generate {
  /**
   * Generate a template given a `src` and `dest`.
   *
   * @param {String} name
   * @param {String} src
   * @param {String} dest
   * @param {Function} done
   */
  generate (name, src, dest, done) {
    const opts = getOptions(name, src)
    const metalsmith = Metalsmith(path.join(src, 'template'))
    const data = Object.assign(metalsmith.metadata(), {
      destDirName: name,
      inPlace: dest === process.cwd(),
      noEscape: true
    })

    opts.helpers && Object.keys(opts.helpers).map(key => {
      Handlebars.registerHelper(key, opts.helpers[key])
    })

    if (opts.metalsmith && typeof opts.metalsmith.before === 'function') {
      opts.metalsmith.before(metalsmith, opts)
    }

    metalsmith
      .use(this.askQuestions(opts.prompts))
      .use(this.filterFiles(opts.filters))
      .use(this.renderTemplateFiles(opts.skipInterpolation))

    if (typeof opts.metalsmith === 'function') {
      opts.metalsmith(metalsmith, opts)
    } else if (opts.metalsmith && typeof opts.metalsmith.after === 'function') {
      opts.metalsmith.after(metalsmith, opts)
    }

    metalsmith
      .clean(true)
      .source('.')
      .destination(dest)
      .build((err, files) => {
        done(err)
        this.sortDependencies(data)
        if (data.autoInstall) {
          const cwd = path.join(process.cwd(), data.inPlace ? '' : data.destDirName)
          this.installDependencies(cwd, data.autoInstall)
            .then(() => {
              return this.runLintFix(cwd, data)
            })
            .then(() => {
              success('Project initialization finished!')
              process.exit()
            })
            .catch(err => {
              error(err)
              process.exit(1)
            })
        } else {
          process.exit()
        }
      })

    return data
  }

  /**
   * Create a middleware for asking questions.
   *
   * @param {Object} prompts
   * @return {Function}
   */

  askQuestions (prompts) {
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

  filterFiles (filters) {
    return (files, metalsmith, done) => {
      if (!filters) {
        return done()
      }
      const fileNames = Object.keys(files)
      const metalsmithMetadata = metalsmith.metadata()
      Object.keys(filters).forEach(glob => {
        fileNames.forEach(file => {
          if (match(file, glob, { dot: true })) {
            const condition = filters[glob]
            if (!evaluate(condition, metalsmithMetadata)) {
              delete files[file]
            }
          }
        })
      })
      done()
    }
  }

  /**
   * Template in place plugin.
   *
   * @param {String || Array} skipInterpolation 跳过的文件名的匹配规则
   * @return {Function}
   */
  renderTemplateFiles (skipInterpolation) {
    skipInterpolation = typeof skipInterpolation === 'string'
      ? [skipInterpolation]
      : skipInterpolation
    return (files, metalsmith, done) => {
      const keys = Object.keys(files)
      const metalsmithMetadata = metalsmith.metadata()
      async.each(keys, (file, next) => {
        // skipping files with skipInterpolation option
        if (skipInterpolation && multimatch([file], skipInterpolation, { dot: true }).length) {
          return next()
        }
        const str = files[file].contents.toString()
        // do not attempt to render files that do not have mustaches
        if (!/{{([^{}]+)}}/g.test(str)) {
          return next()
        }
        render(str, metalsmithMetadata, (err, res) => {
          if (err) {
            err.message = `[${file}] ${err.message}`
            return next(err)
          }
          files[file].contents = new Buffer(res)
          next()
        })
      }, done)
    }
  }

  /**
   * Sorts dependencies in package.json alphabetically.
   * They are unsorted because they were grouped for the handlebars helpers
   * @param {object} data Data from questionnaire
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

  sortObject (object) {
    // Based on https://github.com/yarnpkg/yarn/blob/v1.3.2/src/config.js#L79-L85
    const sortedObject = {}
    Object.keys(object)
      .sort()
      .forEach(item => {
        sortedObject[item] = object[item]
      })
    return sortedObject
  }

  /**
   * Runs `npm install` in the project directory
   * @param {string} cwd Path of the created project directory
   * @param {object} data Data from questionnaire
   */
  installDependencies (cwd, executable = 'npm', color) {
    log('Installing project dependencies ...')
    return this.runCommand(executable, ['install'], {
      cwd
    })
  }

  /**
   * Runs `npm run lint -- --fix` in the project directory
   * @param {string} cwd Path of the created project directory
   * @param {object} data Data from questionnaire
   */
  runLintFix (cwd, data, color) {
    if (data.lint) {
      log('Running eslint --fix to comply with chosen preset rules...')
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
   * Spawns a child process and runs the specified command
   * By default, runs in the CWD and inherits stdio
   * Options are the same as node's child_process.spawn
   * @param {string} cmd
   * @param {array<string>} args
   * @param {object} options
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
