import { projectService } from '../services';

export default function pack(program) {
  program.command('pack')
    .description('打包代码')
    .action((options) => {
      let project = projectService.getProject(process.cwd(), false);
      project.pack(options);
    });
};