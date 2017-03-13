import SingleConfig from './single.config';
import MutliConfig from './mutli.config';
import webpack from 'webpack';

class Project {
  constructor(cwd) {
    this.cwd = cwd;
    this.configFile = sysPath.resolve(this.cwd, 'ft.config');
    let userConfig = this.getUserConfig(this.configFile);
    this.model = userConfig.model || 'mutli';
    if (this.model === 'single') {
      this.config = new SingleConfig(cwd, userConfig);
    } else if (this.model === 'mutli') {
      this.config = new MutliConfig(cwd, userConfig);
    }
  }

  getUserConfig(module) {
    delete require.cache[require.resolve(module)];
    return require(module);
  }

  getServerCompiler(cb) {
    let config = this.getConfig('local');
    if (cb && typeof cb === 'function') {
      config = cb(config);
    }
    return webpack(config);
  }

  getConfig(env, type) {
    return this.config.getConfig(env, type);
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