'use strict';

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

exports.config = function () {
  return {
    /**
     * 根据不同的mode有不同的参数，最后一个参数是表示当前的环境是开发环境还是生产环境，一般只有build的时候才会是生产环境
     * node_env值'development'或者'production'
     */
    webpackConfig: function webpackConfig(jsConfig, cssConfig, node_env) {
      // webpackConfig: function (config, node_env) {
      // do what you want todo
      // 当对样式没有特殊配置时，可以直接返回jsConfig就行，否则就要两者都返回。
      return jsConfig; // return {jsConfig: jsConfig, cssConfig: cssConfig};
    },
    exports: [
      // 要导出的文件,相对于src文件路径，于ft配置一样
    ]
  };
};