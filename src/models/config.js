import webpackMerge from 'webpack-merge';
import _ from 'lodash';
import ExtTemplatePath from '../plugins/extTemplatePath';

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
        }, {
          test: /\.less$/,
          use: ['style-loader', 'css-loader', 'less-loader']
        }]
      },
      plugins: [
        new ExtTemplatePath({
          entryExtNames: this.entryExtNames
        })
      ],
      resolve: {
        root: [],
        extensions: ['*', '.js', '.css', '.json', '.string', '.tpl'],
        alias: {}
      },
      devtool: 'cheap-source-map'
    };
    this.cssConfig = {};
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
    this.setWebpackConfig(extendConfig.webpackConfig); // 全局的webpack配置
    this.setCSSWebpackConfig(extendConfig.cssWebpackConfig); // 默认已经对css做了处理，但是如果要自定义的话也是可以的，不过这个时候，需要自己配置
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
            name = entry;
          } else if (Array.isArray(entry)) {
            name = entry[entry.length - 1];
          }
          this.config.entry[name] = entry;
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

  setWebpackConfig(webpackConfig = {}) {
    if (typeof webpackConfig === 'object') {
      webpackMerge(this.config, webpackConfig);
    } else if (typeof webpackConfig === 'function') {
      this.config = webpackConfig(this.config);
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

  setCSSWebpackConfig(webpackConfig = {}) {
    this.cssConfig = Object.assign({}, this.config);
    if (typeof webpackConfig === 'object') {
      webpackMerge(this.cssConfig, webpackConfig);
    } else if (typeof webpackConfig === 'function') {
      this.cssConfig = webpackConfig(this.cssConfig);
    }
  }

  getConfig(isCss) {
    return isCss ? Object.assign({}, this.cssConfig) : Object.assign({}, this.config);
  }
}

export default Config;