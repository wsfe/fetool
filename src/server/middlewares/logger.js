import morgan from 'morgan';
import moment from 'moment';
import chalk from 'chalk';

morgan(':date :status :method :url :response-time');

function getStatus(status) {
  switch (true) {
    case status >= 500:
      return chalk.yellow(status);
    case status >= 400:
      return chalk.red(status);
    case status >= 200:
      return chalk.green(status);
    default:
      return chalk.gray(status);
  }
}

export default morgan((tokens, req, res) => {
  let now = chalk.gray('[' + moment().format('MM.DD HH:mm:ss') + ']');
  let status = getStatus(tokens.status(req, res));
  return [
    now,
    status,
    chalk.magenta(tokens.method(req, res)),
    tokens.url(req, res),
    chalk.gray(tokens['response-time'](req, res)), 'ms'
  ].join(' ');
});