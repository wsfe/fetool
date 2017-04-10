import { projectService } from '../services';
import _ from 'lodash';
import shell from 'shelljs';

export default function sync(program) {
  program.command('sync')
    .description('同步到开发机')
    .option('-i, --init', '初始化sync配置')
    .option('-e, --env <name>', '同步到名字为name的开发环境')
    .action((options) => {
      let project = projectService.getProject(process.cwd(), false);
      let syncInstance = new Sync(project);
      if (options.init) {
        syncInstance.initConfig();
      }
      if (options.env) {
        syncInstance.sync(options.env);
      }
    });
};

class Sync {
  constructor(project) {
    this.project = project;
  }

  initConfig() {}

  sync(env) {
    let globalConfig = JSON.parse(fs.readFileSync(FET_RC, { encoding: 'utf8' }));
    let syncConf = this.project.userConfig.sync,
      conf = {};
    if (syncConf[env]) {
      conf = syncConf[env];
    } else {
      for (let key in syncConf) {
        conf = syncConf[key];
        break;
      }
    }
    conf[user] = conf[user]? `${conf[user]}@`: '';

    let default_exclude = ['.idea', '.svn', '.git', '.DS_Store', 'node_modules', 'prd', 'loc', 'env', 'dll'];
    if (conf['exclude'] && conf['exclude'].length > 0) {
      default_exclude = default_exclude.concat(conf['exclude']);
      default_exclude = _.uniq(default_exclude);
    }
    default_exclude = default_exclude.map((item) => {
      return `--exclude${item}`;
    }).join(' ');

    let _args = [
      '-rzcvp',
      "--chmod=a='rX,u+w,g+w'",
      "--rsync-path='" + (conf.sudo? "sudo ": '') + "rsync'",
      `${conf[user]}${conf[host]}:${conf[path]}`,
    ];
    if (conf[port]) { // 默认是22端口，不过有些机器没有开22，因此需要有这个设置
      _args.push(`-e \'ssh -p ${conf[port]}\'`);
    }

    // todo 需要看是否要加--temp-dir这个配置

    let args = _args.join(' ');
    log("[调用] rsync " + args);
    shell.exec('rsync ${args}', (code, stdout, stderr) => {
      if (code) {
        log('[提示] 如遇问题，请问我-----------------我会让你看源码！');
        error(stderr);
        shell.exit(1);
      }
      if (stdout) {
        log(stdout);
      }
    });
  }
}