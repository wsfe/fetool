import './global';
import program from 'commander';
import commands from './commands';
import { version } from '../package.json';

program
  .version(version)
  .usage('ft2.0 开发工具');
commands(program);

export function run(argv) {
  if (!argv[2]) { // 如果没有其他命令的话
    program.help();
    return;
  }
  program.parse(argv);
};