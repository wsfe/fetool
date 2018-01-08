'use strict';

global.download = require('download-git-repo')
global.exec = require('child_process').exec
const fs = require('fs')
const glob = require('glob')
global.async = require('async');
global.Metalsmith = require('metalsmith')
global.Handlebars = require('handlebars')
global.render = require('consolidate').handlebars.render
global.rm = require('rimraf').sync

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = init;
function init(program) {
  program
    .command('init <project-name>')
    .description('初始化项目,生成项目<project-name>')
    .action(function (src) {
      const list = glob.sync('*')
      if (list.filter(name => {
        const fileName = sysPath.resolve(process.cwd(), sysPath.join('.', name))
        const isDir = fs.statSync(fileName).isDirectory()
        return name.indexOf(src) !== -1 && isDir
        }).length !== 0) {
        warn(`${src} already existst!`)
        process.exit()
      }
      const target = sysPath.join(process.cwd(), '.download-temp')
      let cmdStr = `git clone https://github.com/117653599/boilerplate-template.git ${target} && cd ${target} && git checkout master`
      log('generating...')
      exec(cmdStr, (error, stdout, stderr) => {
        if (error) {
          console.log(chalk.red(error))
          process.exit()
        } else {
          const metadata = {
            projectName: src,
            projectVersion: '0.0.1',
            projectDescription: `a project ${src}`
          }
          generator(metadata, src, target)
          .then(() => {
            success('init success');
            process.exit()
          })
          .catch(err => {
            error(err);
            process.exit()
          })
        }
      })
  });
};

function generator(metadata = {}, src, dest = '.') {
  if (!src) {
    return Promise.reject(new Error(`无效的source：${src}`))
  }
  return new Promise((resolve, reject) => {
    Metalsmith(process.cwd())
      .source(sysPath.resolve(dest + '/template'))
      .metadata(metadata)
      .use(template)
      .destination(src)
      .build(function(err){
        rm(dest)
        err ? reject(err) : resolve()

      })
  });
}

const template = function(files, metalsmith, done){
  const keys = Object.keys(files);
  const metadata = metalsmith.metadata();
  async.each(keys, run, done);
  function run(file, done){
    const str = files[file].contents.toString();
    render(str, metadata, function(err, res){
      if (err) return done(err);
      files[file].contents = new Buffer(res);
      done();
    });
  }
}
