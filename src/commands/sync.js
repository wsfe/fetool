import { projectService } from '../services';
import _ from 'lodash';
import shell from 'shelljs';

export default function sync(program) {
  program.command('sync [env]') // 同步到名字为env的开发环境
    .description('同步到开发机')
    .action((env) => {
      let project = projectService.getProject(process.cwd(), false);
      let syncInstance = new Sync(project);
      syncInstance.sync(options.env);
    });
};

class Sync {
  constructor(project) {
    this.project = project;
  }

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
    conf.user = globalConfig.user? `${globalConfig.user}@`: '';
    conf.local = conf.local || './';

    let default_exclude = ['.idea', '.svn', '.git', '.DS_Store', 'node_modules', 'prd', 'loc', 'env', 'dll'];
    if (conf['exclude'] && conf['exclude'].length > 0) {
      default_exclude = default_exclude.concat(conf.exclude);
      default_exclude = _.uniq(default_exclude);
    }
    default_exclude = default_exclude.map((item) => {
      return `--exclude=${item}`;
    }).join(' ');

    let _args = [
      '-rzcvp',
      "--chmod=a='rX,u+w,g+w'",
      "--rsync-path='" + (conf.sudo? "sudo ": '') + "rsync'",
      conf.local,
      `${conf.user}${conf.host}:${conf.path}`,
      default_exclude
    ];
    if (conf.port) { // 默认是22端口，不过有些机器没有开22，因此需要有这个设置
      _args.push(`-e \'ssh -p ${conf.port}\'`);
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
      }
    });
  }
}