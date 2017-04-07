import { projectService } from '../services';

export default function sync(program) {
  program.command('sync')
    .description('同步到开发机')
    .action((options) => {
      let project = projectService.getProject(process.cwd(), false);
      let rsync = new Sync(project);
      rsync.sync();
    });
};

class Sync {
  constructor(project) {
    this.project = project;
  }

  sync() {}
}