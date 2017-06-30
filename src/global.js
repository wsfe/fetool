import chalk from 'chalk';
import ora from 'ora';
import logSymbols from 'log-symbols';
import moment from 'moment';

global.fs = require('fs-extra');
global.sysPath = require('path');

global.SINGLE_MODE = 'single';
global.MUTLI_MODE = 'mutli';
global.ENV = {
  DEV: 'development',
  PRD: 'production'
}

global.USER_HOME = process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'];
global.FET_RC = sysPath.join(USER_HOME, '.fetrc');

global.info = console.info;

global.spinner = ora().start();

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

global.logWithTime = function() {
  info(logSymbols.info + ' [' + moment().format('YY.MM.DD HH:mm:ss') + '] ' + [].slice.call(arguments).join(' '));
}