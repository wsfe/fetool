import _ from 'lodash';
import shell from 'shelljs';
import Project from '../models/project';

export default function sync(program) {
  program.command('sync <env>') // 同步到名字为env的开发环境
    .description('同步到<env>机器')
    .action((env) => {
      env = env ? env : process.env.npm_config_server
      fs.readJson(sysPath.join(process.cwd(), 'package.json'), (err, conf) => {
        let syncConf
        if (err && err.code !== 'ENOENT') { // 如果是读取文件出错
          error(err)
          process.exit(1)
        }
        if (!err && conf.servers) { // 如果不在配置里面
          syncConf = conf.servers[env]
        } else {
          let project = new Project(process.cwd(), ENV.DEV);
          syncConf = project.userConfig.servers[env]
        }
        if (syncConf) {
          new Sync(syncConf).sync()
        } else {
          error(`请查看配置文档，配置相关${env}服务器!`)
          process.exit(1)
        }
      })
    });
};

class Sync {
  constructor (conf) {
    this.conf = conf
  }

  sync () {
    if (this.conf.user) {
      this.conf.user = `${this.conf.user}@`
    } else {
      let globalConfig = JSON.parse(fs.readFileSync(FET_RC, { encoding: 'utf8' }))
      this.conf.user = globalConfig.user ? `${globalConfig.user}@`: ''
    }
    this.conf.local = this.conf.local || './';

    let default_exclude = ['.idea', '.svn', '.git', '.gitignore', 'yarn.lock', 'ft.config.js', '.DS_Store', 'node_modules', 'src', 'loc', 'env', 'dll'];
    if (this.conf['exclude'] && this.conf['exclude'].length > 0) {
      default_exclude = default_exclude.concat(this.conf.exclude);
      default_exclude = _.uniq(default_exclude);
    }
    default_exclude = default_exclude.map((item) => {
      return `--exclude=${item}`;
    }).join(' ');

    let _args = [
      '-rzcvp',
      "--chmod=a='rX,u+w,g+w'",
      "--rsync-path='" + (this.conf.sudo? "sudo ": '') + "rsync'",
      this.conf.local,
      `${this.conf.user}${this.conf.host}:${this.conf.path}`,
      default_exclude
    ];
    if (this.conf.port) { // 默认是22端口，不过有些机器没有开22，因此需要有这个设置
      _args.push(`-e \'ssh -p ${this.conf.port}\'`);
    }

    // todo 需要看是否要加--temp-dir这个配置

    let args = _args.join(' ');
    log("[调用] rsync " + args);
    shell.exec(`rsync ${args}`, (code, stdout, stderr) => {
      if (code) {
        log('[提示] 如遇问题，请问我-----------------我会让你看源码！');
        error(stderr);
        shell.exit(1);
      }
      if (stdout) {
        log(stdout);
        process.exit();
      }
    });
  }
}