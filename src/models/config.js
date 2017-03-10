import webpackMerge from 'webpack-merge';
import _ from 'lodash';
import ExtTemplatePath from '../plugins/extTemplatePath';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

class Config {
  constructor(cwd, configFile) {
    this.cwd = cwd;
    this.configFile = configFile;
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
          filename: '[noextname][ext]',
          chunkFilename: '[id].chunk.js'
        },
        dev: {
          path: './dev/',
          filename: '[noextname][ext]',
          chunkFilename: '[id].chunk.js'
        },
        prd: {
          path: './prd/',
          filename: '[noextname]@[chunkhash][ext]',
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
          // use: ['style-loader', 'css-loader']
          use: ExtractTextPlugin.extract({
            fallback: require.resolve('style-loader'),
            use: require.resolve('css-loader')
          })
        }, {
          test: /\.less$/,
          // use: ['style-loader', 'css-loader', 'less-loader']
          use: ExtractTextPlugin.extract({
            fallback: require.resolve('style-loader'),
            use: [require.resolve('css-loader'), require.resolve('less-loader')]
          })
        }, {
          test: /\.(scss|sass)$/,
          // use: ['style-loader', 'css-loader', 'less-loader']
          use: ExtractTextPlugin.extract({
            fallback: require.resolve('style-loader'),
            use: [require.resolve('css-loader'), require.resolve('china-sass-loader')]
          })
        }]
      },
      plugins: [
        // new ExtractTextPlugin({
        //   filename: 'sytle.css',
        //   allChunks: true
        // }),
        new ExtTemplatePath({
          entryExtNames: this.entryExtNames
        })
      ],
      resolve: {
        extensions: ['*', '.js', '.css', '.scss', '.json', '.string', '.tpl'],
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
    let userConfig = this.getUserConfig(this.configFile);
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

    this.setWebpackConfig(extendConfig.webpackConfig);
    this.setExports(extendConfig.exports);
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
          this.config.entry[name] = this.fixEntryPath(entry);
        });
      } else if (_.isPlainObject(entries)) {
        Object.keys(entries).forEach((name) => {
          if (sysPath.extname(name) !== '.js') {
            this.config.entry[name + '.js'] = entries[name];
          } else {
            this.config.entry[name] = entries[name];
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

  setWebpackConfig(webpackConfig = {}) {
    if (typeof webpackConfig === 'object') {
      webpackMerge(this.config, webpackConfig);
    } else if (typeof webpackConfig === 'function') {
      this.config = webpackConfig(this.config);
    } else {
      console.error('webpackConfig 设置错误');
      return;
    }

    // 处理 context
    if (this.config.context && !sysPath.isAbsolute(this.config.context)) {
      this.config.context = sysPath.join(this.cwd, this.config.context);
    }

    // 处理 alias
    if (this.config.resolve.alias) {
      let alias = this.config.resolve.alias;
      Object.keys(alias).forEach((name) => {
        alias[name] = sysPath.join(this.cwd, alias[name]);
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

  getConfig(env) {
    let config = _.cloneDeep(this.config);
    config.output = config.output[env];
    let isExitExtractTextPlugin = config.plugins.some((plugin) => {
      return plugin instanceof ExtractTextPlugin;
    });
    if (!isExitExtractTextPlugin) {
      config.plugins.push(new ExtractTextPlugin(config.output.filename.replace('[ext]', '.css')))
    }
    return config;
  }

}

export default Config;