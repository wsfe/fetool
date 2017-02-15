export default function server(program) {
  program.command('server [cmd]')
    .description('启动服务器')
    .option('-p, --port [value]', '端口号')
    .action((cmd, options) => {
      console.log('port', options.port);
    })
    .on('--help', () => {
      console.log(arguments);
    });
};