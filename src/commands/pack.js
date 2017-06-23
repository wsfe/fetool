import { projectService } from '../services';

export default function pack(program) {
  program.command('pack')
    .description('打包代码')
    .option('-m, --min', '压缩混淆代码')
    .option('-c, --compile [value]', '编译处理') // 编译处理一些比较特殊的文件，例如自定义的html文件
    .action((options) => {
      let cwd = process.cwd();
      let project = projectService.getProject(cwd, ENV.PRD, false);
      options.cwd = cwd;
      if (options.compile === true) {
        options.compile = 'html'; // 默认编译处理自定义的html。
      }
      project.pack(options);
    });
};