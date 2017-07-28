import { projectService } from '../services';

export default function build(program) {
  program.command('build')
    .description('线上编译')
    .option('-a, --analyze', '启用分析')
    .action((options) => {
      let project = projectService.getProject(process.cwd(), ENV.PRD, false);
      project.build(options);
    });
};