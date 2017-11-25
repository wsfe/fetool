import Project from '../models/project'

export default function build(program) {
  program.command('build')
    .description('线上编译')
    .option('-e, --env [value]', '为某个env环境打包')
    .option('-a, --analyze', '启用分析')
    .option('-c, --cache [value]', '是否开启缓存,默认开启')
    .action((options) => {
      let project = new Project(process.cwd(), ENV.PRD);
      if (options.env && !project.userConfig.servers[options.env]) {
        error(options.env, '环境不存在，请选择正确的发布环境');
        process.exit(1);
      }
      if (options.cache === 'false') {
        options.cache = false
      } else {
        options.cache = true
      }
      project.build(options);
    });
};