import program from 'commander';
import { version } from '../package.json';

program
  .version(version)
  .usage('测试[options] <package>')
  .option('-h, --help', '帮助')
  .option('-v, --version', '版本')
  .command('server [cmd]')
  .description('启动服务器')
  .option('-p, --port [value]', '端口号')
  .action((cmd, options) => {
    console.log('port', options.port);
  });

program.parse(process.argv);