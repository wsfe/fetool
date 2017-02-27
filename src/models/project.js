import Config from './config';
import webpack from 'webpack';

class Project {
  constructor(cwd) {
    this.cwd = cwd;
    this.config = new Config(cwd);
  }

  getServerCompiler(type, cb) {
    let config = this.config.getConfig(type);
    if (cb && typeof cb === 'function') {
      config = cb(config);
    }
    webpack(config);
  }
}

export default Project;