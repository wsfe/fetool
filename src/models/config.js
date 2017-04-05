import _ from 'lodash';
import ExtTemplatePath from '../plugins/extTemplatePath';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

class Config {
  constructor(cwd, userConfig) {
    this.cwd = cwd;
    this.userConfig = userConfig;
    this.entryExtNames = {
      css: ['.css', '.scss', '.sass', '.less'],
      js: ['.js', '.jsx', '.vue']
    };
    this.baseConfig = {
      context: sysPath.join(cwd, 'src'),
      entry: {},
      output: {
        local: {
          path: './prd/',
          filename: '[noextname][ext]',
          chunkFilename: '[id].chunk.js',
          publicPath: '//' + sysPath.join('img.chinanetcenter.com', 'projectDir', 'prd/')
        },
        dev: {
          path: './dev/',
          filename: '[noextname]@dev[ext]',
          chunkFilename: '[id].chunk@dev.js',
          publicPath: '//' + sysPath.join('img.chinanetcenter.com', 'projectDir', 'dev/')
        },
        prd: {
          path: './prd/',
          filename: '[noextname]@[chunkhash][ext]',
          chunkFilename: '[id].chunk.min.js',
          publicPath: '//' + sysPath.join('img.chinanetcenter.com', 'projectDir', 'prd/')
        }
      },
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
        extensions: ['*', '.js', '.css', '.scss', '.json', '.string', '.tpl'],
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
    this.config = _.cloneDeep(this.baseConfig);
  }

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

  getConfig(env) {
    let config = _.cloneDeep(this.baseConfig);
    config.output = config.output[env];
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
        alias[name] = sysPath.join(this.cwd, alias[name]);
      });
    }
  }

  // 处理output
  fixOutput(config) {
    let output = config.output;
    Object.keys(output).forEach((env) => {
      let op = output[env];
      if (op.path && !sysPath.isAbsolute(op.path)) {
        op.path = sysPath.join(this.cwd, op.path);
      }
    });
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
