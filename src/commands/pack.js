import { projectService } from '../services';

export default function pack(program) {
  program.command('pack')
    .description('打包代码')
    .option('-m, --min', '压缩混淆代码')
    .action((options) => {
      let cwd = process.cwd();
      let project = projectService.getProject(cwd, false);
      options.cwd = cwd;
      project.pack(options);
    });
};