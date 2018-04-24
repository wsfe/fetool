import _ from 'lodash';
import ExtTemplatePath from '../plugins/extTemplatePath';

class Config {
  constructor(project) {
    let cwd = project.cwd;
    this.cwd = cwd;
    this.userConfig = project.userConfig;
    this.NODE_ENV = project.NODE_ENV;
    this.project = project;
    this.entryExtNames = {
      css: ['.css', '.scss', '.sass', '.less'],
      js: ['.js', '.jsx', '.vue']
    };
    // let projectName = process.platform === 'win32' ? cwd.split('\\').pop(): cwd.split('/').pop();
    let projectName = require(sysPath.join(cwd, 'package.json')).name
    this.baseConfig = {
      context: sysPath.join(cwd, 'src'),
      entry: {},
      output: this._getOutputConfig(projectName, this.NODE_ENV),
      module: {
        rules: [{
          test: /\.json$/,
          exclude: /node_modules/,
          use: ['json-loader']
        }, {
          test: /\.(html|string|tpl)$/,
          use: ['html-loader']
        }]
      },
      plugins: [],
      resolve: {
        extensions: ['*', '.js', '.css', '.scss', '.json', '.string', '.tpl', '.vue'],
        alias: {}
      },
      devtool: 'cheap-source-map'
    };
    this.extendConfig = {};
    this.init();
  }

  init() {
    this.setEntryExtNames(this.userConfig.entryExtNames);
    this.baseConfig.plugins.push(new ExtTemplatePath({
      entryExtNames: this.entryExtNames
    }));
    this.extendConfig = this.userConfig.config;
    if (typeof this.extendConfig === 'function') {
      this.extendConfig = this.extendConfig.call(this, this.cwd);
    }
    if (typeof this.extendConfig !== 'object') {
      console.error('设置有误，请参考文档');
      return this;
    }
    this.setExports(this.extendConfig.exports);
    this.fixContext(this.baseConfig);
    this.fixOutput(this.baseConfig);
    // this.config = _.cloneDeep(this.baseConfig);
  }

  /**
   * 根据项目名称和编译环境获取output配置
   * @param {项目名称} projectName 
   * @param {编译环境：local，develop，product} env 
   */
  _getOutputConfig(projectName, env) {
    return {
      [ENV.LOC]: {
        path: './prd/',
        filename: '[noextname][ext]',
        chunkFilename: '[id].chunk.js',
        // publicPath: '//' + sysPath.join('img.chinanetcenter.com', projectName, 'prd/')
        publicPath: `/${projectName}/prd/`
      },
      [ENV.DEV]: {
        path: './dev/',
        filename: '[noextname]@dev[ext]',
        chunkFilename: '[id].chunk@dev.js',
        // publicPath: '//' + sysPath.join('img.chinanetcenter.com', projectName, 'dev/')
        publicPath: `/${projectName}/dev/`
      },
      [ENV.PRD]: {
        path: './prd/',
        filename: '[noextname]@[chunkhash][ext]',
        chunkFilename: '[id].chunk@[chunkhash].js',
        // publicPath: '//' + sysPath.join('img.chinanetcenter.com', projectName, 'prd/')
        publicPath: `/${projectName}/prd/`        
      }
    }[env];
  }

  /**
   * 设置扩展名映射，将一些特殊扩展名映射到相应的js和css对象里面
   * @param {需要输出的对象的扩展名} entryExtNames 
   */
  setEntryExtNames(entryExtNames) {
    if (entryExtNames) {
      if (entryExtNames.js) {
        this.entryExtNames.js = _.concat(this.entryExtNames.js, entryExtNames.js);
        this.entryExtNames.js = _.uniq(this.entryExtNames.js);
      }
      if (entryExtNames.css) {
        this.entryExtNames.css = _.concat(this.entryExtNames.css, entryExtNames.css);
        this.entryExtNames.css = _.uniq(this.entryExtNames.css);
      }
    }
  }

  /**
   * 设置用户需要导出的对象，支持数组，支持map对象
   * @param {用户需要导出的文件对象} entries 
   */
  setExports(entries) {
    if (entries) {
      if (Array.isArray(entries)) {
        entries.forEach((entry) => {
          let name = '';
          if (typeof entry === 'string') {
            name = this.setEntryName(entry);
          } else if (Array.isArray(entry)) {
            name = this.setEntryName(entry[entry.length - 1]);
          }
          this.baseConfig.entry[name] = this.fixEntryPath(entry);
        });
      } else if (_.isPlainObject(entries)) {
        Object.keys(entries).forEach((name) => {
          if (sysPath.extname(name) !== '.js') {
            this.baseConfig.entry[name + '.js'] = entries[name];
          } else {
            this.baseConfig.entry[name] = entries[name];
          }
        });
      }
    } else {
      console.error('没有exports')
    }
  }

  setEntryName(name) {
    if (name.indexOf('./') === 0) {
      return name.substring(2);
    } else if (name[0] == '/') {
      return name.substring(1);
    }
    return name;
  }

  fixEntryPath(entry) {
    if (typeof entry === 'string') {
      return /\w/.test(entry[0]) ? './' + entry : entry;
    } else if (Array.isArray(entry)) {
      entry = entry.map((value) => {
        return /\w/.test(value[0]) ? './' + value : value;
      });
    }
    return entry;
  }

  getConfig() {
    let config = _.cloneDeep(this.baseConfig);
    return config;
  }

  // 处理 context
  fixContext(config) {
    if (config.context && !sysPath.isAbsolute(config.context)) {
      config.context = sysPath.join(cwd, config.context);
    }
  }

  // 处理 alias
  fixAlias(config) {
    if (config.resolve.alias) {
      let alias = config.resolve.alias;
      Object.keys(alias).forEach((name) => {
        if (!/^\w+.+/.test(alias[name])) { // 如果不是已相对路径或者绝对路径为开头的（一般就是查找安装的包，例如vue,lodash等）
          alias[name] = sysPath.resolve(this.cwd, alias[name]);          
        }
      });
    }
  }

  // 处理output
  fixOutput(config) {
    let output = config.output;
    if (output.path && !sysPath.isAbsolute(output.path)) {
      output.path = sysPath.join(this.cwd, output.path);
    }
  }

  getSourceType(name) {
    let ext = sysPath.extname(name);
    let type = 'js';
    Object.keys(this.entryExtNames).forEach((extName) => {
      let exts = this.entryExtNames[extName];
      if (exts.indexOf(ext) > -1) {
        type = extName;
      }
    });
    return type;
  }
}

export default Config;
