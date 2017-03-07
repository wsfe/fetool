import Config from './config';
import webpack from 'webpack';

class Project {
  constructor(cwd) {
    this.cwd = cwd;
    this.configFile = sysPath.resolve(this.cwd, 'ft.config');
    this.config = new Config(cwd, this.configFile);
  }

  getServerCompiler(cb) {
    let config = this.getConfig('local');
    if (cb && typeof cb === 'function') {
      config = cb(config);
    }
    return webpack(config);
  }

  getConfig(env) {
    return this.config.getConfig(env);
  }

  getSourceType(name) {
    let ext = sysPath.extname(name);
    let type = 'js';
    Object.keys(this.config.entryExtNames).forEach((extName) => {
      let exts = this.config.entryExtNames[extName];
      if (exts.indexOf(ext) > -1) {
        type = extName;
      }
    });
    return type;
  }
}

export default Project;