import Project from '../models/project'

export default function build(program) {
  program.command('build')
    .description('线上编译')
    .option('-a, --analyze', '启用分析')
    .action((options) => {
      let project = new Project(process.cwd(), ENV.PRD);
      project.build(options);
    });
};