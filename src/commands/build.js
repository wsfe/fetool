import { projectService } from '../services';

export default function build(program) {
  program.command('build')
    .description('线上编译')
    .action((options) => {
      let project = projectService.getProject(process.cwd(), ENV.PRD, false);
      project.build(options);
    });
};