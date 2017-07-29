import { projectService } from '../services';

export default function pack(program) {
  program.command('pack')
    .description('打包代码')
    .option('-e, --env [value]', '为某个env环境打包')
    .option('-m, --min', '压缩混淆代码')
    .option('-c, --compile [value]', '编译处理') // 编译处理一些比较特殊的文件，例如自定义的html文件
    .action((options) => {
      let cwd = process.cwd();
      let project = projectService.getProject(cwd, ENV.DEV, false);
      if (options.env && !project.userConfig.servers[options.env]) {
        error(options.env, '环境不存在，请选择正确的发布环境');
        process.exit(1);
      }
      options.cwd = cwd;
      if (options.compile === true) {
        options.compile = 'html'; // 默认编译处理自定义的html。
      }
      project.pack(options);
    });
};