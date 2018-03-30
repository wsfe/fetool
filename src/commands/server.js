import Server from '../server';

export default function server(program) {
  program.command('server')
    .description('启动服务器')
    .option('-p, --port <value>', '端口号')
    .option('-w, --watch [value]', '要监听的文件夹,或者文件,默认监听build文件夹')
    .option('-s, --https', '开启 https 服务')
    .option('-v, --verbose', '显示详细编译信息，默认不显示')
    .option('-h, --hot', '开启热更新，默认不开启')
    .option('-c, --config <value>', '代理配置路径，默认是服务器启动目录下的fet.conf')
    .action((options) => {
      options.port = options.port || 80;
      options.watch = options.watch && options.watch != true ? options.watch : 'build';
      options.config = options.config && options.config !== true ? options.config : sysPath.join(process.cwd(), 'fet.proxy.conf')
      new Server(options)
    });
};