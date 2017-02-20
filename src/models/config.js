import webpackMerge from 'webpack-merge';

class Config {
  constructor(cwd) {
    this.cwd = cwd;
    this.entryGroups = {};
    this.entryExtNames = {
      css: ['.css'],
      js: ['.js', '.jsx']
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
    let userConfig = this.getUserConfig(sysPath.join(this.cwd, 'ft.config'));
    if (!userConfig) {
      console.error('请设置配置文件');
      return this;
    }
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
    let newConfig = Object.assign({}, this.config);
    if (typeof config === 'object') {
      webpackMerge(newConfig, config);
    } else if(typeof config === 'function') {
      newConfig = config(newConfig);
    } else {
      console.error('webpackConfig 设置错误');
      return;
    }
    if (newConfig.context && !sysPath.isAbsolute(newConfig.context)) {
      newConfig.context = sysPath.join(this.cwd, newConfig.context);
    }

    if (newConfig.resolve.alias) {
      let alias = newConfig.resolve.alias;
      Object.keys(alias).forEach((name) => {
        alias[name] = sysPath.join(this.config, alias[key]);
      });
    }

  }
}

export default Config;