import Config from './config';
import webpack from 'webpack';

class Project {
  constructor(cwd) {
    this.cwd = cwd;
    this.configFile = sysPath.resolve(this.cwd, 'ft.config');
    this.config = new Config(cwd, this.configFile);
  }

  getServerCompiler(cb) {
    let config = this.config.getConfig('local');
    if (cb && typeof cb === 'function') {
      config = cb(config);
    }
    return webpack(config);
  }

  getConfig(env) {
    return this.config.getConfig(env);
  }
}

export default Project;