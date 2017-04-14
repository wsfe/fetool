#ft

## ft2.0设计核心说明
目前ft2.0支持两种模式：多页面和单页面模式。单页面模式只会导出一份样式表。多页面模式提倡，样式表独立出来，然后js里面的样式不被提取出来。大家可以根据自己的需要来选择想要的模式。

## 安装
npm 安装方式安装
```
npm i -g fet
```
yarn 方式安装
```
yarn global add fet
```

## 命令行说明
请安装fet之后，在命令行运行`fet`查看命令说明，如果对某个命令感兴趣请运行`fet commandName -h`查看。

## config demo

```
{
  mode: 'multi',  // 默认是多页面的应用，单页应用选择填写single。
  lint: { // 基于standard的
    cwd: 'src/js', // 选择需要校验的文件路径，默认是src
    opts: {
      ignore: [],   // glob 形式的排除列表 (一般无须配置)
      fix: false,   // 是否自动修复问题
      globals: [],  // 声明需要跳过检测的定义全局变量
      plugins: [],  // eslint 插件列表
      envs: [],     // eslint 环境
      parser: ''    // js 解析器（例如 babel-eslint）
    }
  },
  sync: { // 配置同步到哪台机器
    dev1: {
      host: 10.8.203.61,
      port: 63501,
      local: './', // 默认当前目录
      path: '/usr/local/src',
      sudo: false
    },
    dev2: {
      host: 10.8.203.61,
      port: 63501,
      path: '/usr/local/src',
      sudo: false
    }
  }
  entryExtNames: { // 告诉ft2.0哪些后缀是属于js或者css，ft才能根据这些来选择编译配置
    css: ['.css', '.scss', '.sass', '.less'],
    js: ['.js', '.jsx', '.vue']
  },
  config: {
    exports: [ // 要编译压缩的文件
      "js/module/home/index.js",
      "css/index.css",
      "css/base.css",
      "css/module/index.less"
    ],
    webpackConfig: function(jsConfig, cssConfig) {
      // do what you want todo
      // 当对样式没有特殊配置时，可以直接返回jsConfig就行，否则就要两者都返回。
      return jsConfig; // return {jsConfig: jsConfig, cssConfig: cssConfig};
    }
  }
}
```