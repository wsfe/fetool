import { projectService } from '../services';

export default function sync(program) {
  program.command('sync')
    .description('同步到开发机')
    .option('-i, --init', '初始化sync配置')
    .option('-e, --env <name>', '同步到名字为name的开发环境')
    .action((options) => {
      let project = projectService.getProject(process.cwd(), false);
      let rsync = new Sync(project);
      if (options.init) {}
      if (options.env) {
        rsync.sync(options.env);
      }
    });
};

class Sync {
  constructor(project) {
    this.project = project;
  }

  sync(env) {
    let globalConfig = JSON.parse(fs.readFileSync(FET_RC, { encoding: 'utf8' }));
    let syncConf = this.project.userConfig.sync;
    if (syncConf[env]) {
      
    }
  }
}