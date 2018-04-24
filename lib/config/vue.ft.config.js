'use strict';

var path = require('path');
var webpack = require('webpack');

function resolve(dir) {
  return path.join(__dirname, dir);
}

exports.mode = 'single';

exports.sync = {
  '#_serverName': {
    host: 'ip', // 服务器ip
    post: 123, // 端口
    local: './', // 默认当前目录
    path: '服务器上存放文件的地址'
  }
};

/** 如果需要严格执行的话，需要做配置
exports.lint = { // 基于standard的
  cwd: 'src/js', // 选择需要校验的文件路径，默认是src
  opts: {
    ignore: [],   // glob 形式的排除列表 (一般无须配置)
    fix: false,   // 是否自动修复问题
    globals: [],  // 声明需要跳过检测的定义全局变量
    plugins: [],  // eslint 插件列表
    envs: [],     // eslint 环境
    parser: ''    // js 解析器（例如 babel-eslint）
  }
};
*/

/**
 exports.entryExtNames = {
  css: ['.css', '.scss', '.sass', '.less'],
  js: ['.js', '.jsx', '.vue']
};
 */

function cssLoaders(node_env) {

  var cssLoader = {
    loader: 'css-loader',
    options: {
      minimize: node_env === 'production'
    }

    // generate loader string to be used with extract text plugin
  };function generateLoaders(loader, loaderOptions) {
    var loaders = [cssLoader];
    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {})
      });
    }

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (node_env === 'production') {
      return ExtractTextPlugin.extract({
        use: loaders,
        fallback: 'vue-style-loader'
      });
    } else {
      return ['vue-style-loader'].concat(loaders);
    }
  }

  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    sass: generateLoaders('sass', { indentedSyntax: true }),
    scss: generateLoaders('sass'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  };
}
exports.config = function () {
  return {
    webpackConfig: function webpackConfig(config, node_env) {
      config.resolve.alias = {
        'vue$': 'vue/dist/vue.esm.js',
        '@': resolve('src')
      };
      config.module.rules = config.module.rules.concat([{
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: cssLoaders(node_env)
        }
      }, {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src')]
      }]);
      config.plugins.push(new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: '"' + node_env + '"'
        }
      }));
      return config; // return {jsConfig: jsConfig, cssConfig: cssConfig};
    },
    exports: ['main.js']
  };
};