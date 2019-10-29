import webpack from 'webpack';
import moment from 'moment';
import logSymbols from 'log-symbols';
import ora from 'ora'

class Progress {
  constructor() {
    let startTime = null;
    let endTime = null;
    const spinner = ora('building....').start()
    return new webpack.ProgressPlugin((percent, msg) => {
      if (percent === 0) {
        startTime = Date.now();
      } else if (percent !== 1) {
        spinner.text = `progress:${percent.toFixed(2)}`;
      }
      if (percent === 1) {
        endTime = Date.now();
        const dateFormat = 'YY.MM.DD HH:mm:ss';
        let text = '\x1b[90m' + '[' + moment().format(dateFormat) + '] build complete in ' + (endTime - startTime) + 'ms.';
        spinner.succeed(logSymbols.info + text);
      }
    });
  }
}
export default Progress;