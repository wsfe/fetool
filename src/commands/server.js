import Server from '../server';

export default function server(program) {
  program.command('server')
    .description('启动服务器')
    .option('-p, --port [value]', '端口号')
    .option('-s, --https', '开启 https 服务')
    .option('-v, --verbose', '显示详细编译信息')
    .action((options) => {
      options.port =  options.port || 80;
      new Server(options);
      // console.log('process.cwd', process.cwd());
    });
};