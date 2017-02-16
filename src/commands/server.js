export default function server(program) {
  program.command('server')
    .description('启动服务器')
    .option('-p, --port [value]', '端口号')
    .action((options) => {
      console.log('port', options.port);
    });
};