import webpack from 'webpack';
import moment from 'moment';
import logSymbols from 'log-symbols';

class Progress {
  constructor() {
    let startTime = null;
    let endTime = null;
    return new webpack.ProgressPlugin((percent, msg) => {
      if (percent === 0) {
        spinner.text = 'building...';
        spinner.start();
        startTime = Date.now();
      }
      if (percent === 1) {
        endTime = Date.now();
        const dateFormat = 'YY.MM.DD HH:mm:ss';
        spinner.text = '\x1b[90m' + '[' + moment().format(dateFormat) + '] build complete in ' + (endTime - startTime) + 'ms.';
        spinner.stopAndPersist(logSymbols.info);
        spinner.text = '';
      }
    });
  }
}
export default new Progress();