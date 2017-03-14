import chalk from 'chalk';

global.fs = require('fs');
global.sysPath = require('path');

global.SINGLE_MODE = 'single';
global.MUTLI_MODE = 'mutli';

global.info = console.info;

global.success = function() {
  info(chalk.green(' √ ' + [].slice.call(arguments).join(' ')));
};

global.warn = function() {
  info(chalk.yellow(' ∆ ' + [].slice.call(arguments).join(' ')));
};

global.error = function() {
  info(chalk.bold.red(' X '), chalk.bold.red([].slice.call(arguments).join(' ')));
};

global.log = function() {
  console.log(chalk.cyan('[ft] '), [].slice.call(arguments).join(' '));
};