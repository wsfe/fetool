import './global';
import program from 'commander';
import commands from './commands';
import { version } from '../package.json';

program
  .version(version)
  .usage('测试[options] <package>')
  .option('-h, --help', '帮助')
  .option('-v, --version', '版本');
commands(program);

export function run(argv) {
  if (!argv[2]) { // 如果没有其他命令的话
    program.help();
    console.log();
    return;
  }
  program.parse(argv);
};