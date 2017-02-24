import Config from './config';
import webpack from 'webpack';

class Project {
  constructor(cwd) {
    this.cwd = cwd;
    this.config = new Config(cwd);
  }

  getServerCompiler(isCss, cb) {
    let config = this.config.getConfig(isCss);
    if (cb && typeof cb === 'function') {
      cb(config);
    }
    webpack(config);
  }
}

export default Project;