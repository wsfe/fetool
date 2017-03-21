import { projectService } from '../services';

export default function build(program) {
  program.command('build')
    .description('线上编译')
    .action(() => {
      let project = projectService.getProject(process.cwd(), false);
      project.build(options);
    });
};