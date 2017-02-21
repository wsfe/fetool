import webpackMerge from 'webpack-merge';
import _ from 'lodash';

class Config {
  constructor(cwd) {
    this.cwd = cwd;
    this.entryGroups = {};
    this.entryExtNames = {
      css: ['.css', '.scss', '.sass', '.less'],
      js: ['.js', '.jsx', '.vue']
    };
    this.config = {
      context: sysPath.join(cwd, 'src'),
      entry: {},
      output: {
        local: {
          path: './prd/',
          filename: '[name]',
          chunkFilename: '[id].chunk.js'
        },
        dev: {
          path: './dev/',
          filename: '[name]',
          chunkFilename: '[id].chunk.js'
        },
        prd: {
          path: './prd/',
          filename: '[name]',
          chunkFilename: '[id].chunk.min.js'
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
        }, {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }]
      },
      plugins: [],
      resolve: {
        root: [],
        extensions: ['*', '.js', '.css', '.json', '.string', '.tpl'],
        alias: {}
      },
      devtool: 'cheap-source-map'
    };
    this.readConfig();
  }

  getUserConfig(module) {
    delete require.cache[require.resolve(module)];
    return require(module);
  }

  readConfig() {
    let userConfig = this.getUserConfig(sysPath.resolve(this.cwd, 'ft.config'));
    if (!userConfig) {
      console.error('请设置配置文件');
      return this;
    }
    this.setEntryExtNames(userConfig.entryExtNames);
    let extendConfig = userConfig.config;
    if (typeof extendConfig === 'function') {
      extendConfig = extendConfig.call(this, this.cwd);
    }
    if (typeof extendConfig !== 'object') {
      console.error('设置有误，请参考文档');
      return this;
    }

    this.setExports(extendConfig.exports);
    this.setWebpackConfig(extendConfig.webpackConfig);
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
    if (entries && Array.isArray(entries)) {
      entries.forEach((entry) => {
        let name = '';
        if (typeof entry === 'string') {
          name = entry;
        } else if(Array.isArray(entry)) {
          name = entry[entry.length - 1];
        }
        this.config.entry[name] = entry;
      });
    } else {
      console.error('没有exports')
    }
  }

  setWebpackConfig(config = {}) {
    if (typeof config === 'object') {
      webpackMerge(this.config, config);
    } else if(typeof config === 'function') {
      this.config = config(this.config);
    } else {
      console.error('webpackConfig 设置错误');
      return;
    }
    if (this.config.context && !sysPath.isAbsolute(this.config.context)) {
      this.config.context = sysPath.join(this.cwd, this.config.context);
    }

    if (this.config.resolve.alias) {
      let alias = this.config.resolve.alias;
      Object.keys(alias).forEach((name) => {
        alias[name] = sysPath.join(this.cwd, alias[key]);
      });
    }

    let output = this.config.output;
    Object.keys(output).forEach((env) => {
      let op = output[env];
      if (op.path && !sysPath.isAbsolute(op.path)) {
        op.path = sysPath.join(this.cwd, op.path);
      }
    });
  }

  getConfig() {
    return Object.assign({}, this.config);
  }
}

export default Config;