# 代理格式
{
  projectName: {
    port: xxx
  }
}

# ft2.0
ft2.0是ft1.0的升级版，设计思想是来自[fekit](https://github.com/rinh/fekit)，基本上所有命令的设计都是来自`fekit`，继承了`fekit`的核心优点。ft2.0除了支持多页应用以外，还支持单页应用。从ft1.0迁移到ft2.0的成本很低，只要稍微修改下配置文件就够了，相应的配置说明，请查看下面的配置文档。ft2.0默认内置了`json-loader`,`html-loader`

## ft2.0解决了如下问题：
1. 线上源码与本地源码映射关系（本地代理，类似`fiddler`的匹配替换功能），方便调试
2. 多项目并行开发需要切换启用不同服务不同端口问题
3. 代码快速部署开发机

## ft2.0设计核心说明
目前ft2.0支持两种模式：多页面和单页面模式。核心引擎是webpack，因此可以支持市面上的所有前端框架。

### 单页模式
单页面模式会导出两份样式表，一份是`base.css`，这份样式表主要是存放第三方的样式表或者我们自定义的基础样式表,另一份是跟业务相关的css样式表。我们提供了[vue的脚手架](https://github.com/wsfe/vue-boilerplate)，多页面模式提倡，样式表独立出来，然后js里面的样式不被提取出来。大家可以根据自己的需要来选择想要的模式。

### 多页模式
项目当中避免不了多页应用，尤其对于2b系统，几十个页面，有时候多达200个页面（这种系统设计本身就不合理）。webpack如果要配置多页应用，还是挺麻烦的，而且编译的时候很慢。ft2.0进行了特殊处理，让开发者在配置多页应用的时候简单方便，同时采用缓存式中间件，以及多进程编译，提升编译速度。

## 安装
npm 安装方式安装
```
npm i -g fet-cli
```
yarn 方式安装
```
yarn global add fet-cli
```

## 命令说明
请安装fet之后，在命令行运行`fet`查看命令说明，如果对某个命令感兴趣请运行`fet commandName -h`查看。

### server
用于启动服务器，支持多项目并行开发。（ps：别人需要多个webpack server，我这边只需要一个fet server）,默认开启mock服务。
* `-p`:设置服务端口，默认是80
* `-w`:设置需要监听的文件，默认是监听`ft.config.js`以及`build`文件夹。如果要新增可以用逗号隔开，例如：'src/home,base'。
* `-s`:开启HTTPS服务，如果没有配置全局的证书，那么会启用默认证书，默认证书是没有经过认证的，在目前的浏览器，会引起不可预知的错误。因此，建议不要用默认证书。如果需要配置经过认证的证书，请执行`fet config https-key <path-to-your-key>`，以及`fet config https-crt <path-to-your-crt>`。
* `-v`:提示server是否显示详细的编译信息，默认不开启。

#### server mock
server默认开启mock服务，支持的方式是在每个html页面下创建前缀一样，后缀加一个mock的js文件。例如：一个html文件叫abc.html那么如果需要mock，就需要创建一个abc.mock.js文件。mock文件的格式如下：
```
module.exports = [
  {
    url: '请求的url地址',
    method: 'get|post|put等，默认get',
    //response: 'response支持function或者url，如果是url的话mock server会转发相应的请求到response指定的接口',
    response: function(req) {
      // 返回mockjs格式的json数据
      return {
        "name|1-10": "★"
      }
    }
  }
]
```

### pack
对代码进行打包，但是不进行编译，可为不同的环境打包代码。
* `-e`:设置要打包的环境，对应的值，是配置文件里面`servers`这个字段对应的配置。可能由于一个项目同时有多个迭代，因此会有多个开发机以及其对应的域名，因此经常需要配置这个环境变量。
* `-m`:打包并压缩代码，与执行`fet build`效果是一样的
* `-c`:编译特殊文件，默认编译html。ft2.0支持`include`标签，用户引入公共部分代码，类似`jsp`里面的`include`。

### build
对代码进行打包并且压缩，同时支持打包分析，给使用者提供代码优化思路。
* `-a`:启用分析，对打包结果进行分析。
* `-c`:开启缓存，默认开启，当值为false时，关闭缓存。
* `-e`:设置要打包的环境，对应的值，是配置文件里面`servers`这个字段对应的配置。可能由于一个项目同时有多个迭代，因此会有多个开发机以及其对应的域名，因此经常需要配置这个环境变量。默认是指向全局的global配置的`domain`配置，如果全局配置也没有，那么默认空。

### sync <env>
将代码发送到相应的机器上，必须支持`rsync`。`env`的值是和配置文件里面的`servers`这个字段的配置有关的。

### config [key] [value]
配置全局变量，目前提供的全局变量配置有如下：
* `https-key`&`https-crt`:这两个配置主要是用于`server`开启HTTPS。
* `user`: 配置`sync`命令中默认的用户名。只要配置了这个，对项目执行`sync`命令，ft2.0首先会去匹配`servers`这个配置字段里面对应服务器的`user`字段，如果没有设置，直接使用全局的配置。
* `domain`:配置默认的域名。在`pack`和`build`的时候会用到。主要是用于设置`publicPath`的时候要用。

### lint
基于[standard](https://github.com/standard/standard)的代码检测命令。对应配置文件里面的`lint`字段。

## 配置说明

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
  servers: { // 配置同步到哪台机器
    dev1: {
      host: 10.8.203.61,
      domain: '//dev1.wangsu.com',
      port: 63501,
      local: './', // 默认当前目录
      path: '/usr/local/src/abc', //服务器端要存放的地址
      sudo: false
    },
    dev2: {
      host: 10.8.203.190,
      domain: '//beta1.wangsu.com',
      port: 63501,
      path: '/usr/local/src/dec',
      sudo: false
    }
  },
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
    webpackConfig: function(jsConfig, cssConfig, options, context) {
    // webpackConfig: function(config, options, context) { // 根据不同的模式，有不同的选择，单页模式，没有cssConfig
      // do what you want todo
      // 当对样式没有特殊配置时，可以直接返回jsConfig就行，否则就要两者都返回。
      return jsConfig; // return {jsConfig: jsConfig, cssConfig: cssConfig};
    }
  }
}
```

## todo list
1. 修复重复打包问题，提取出公共包
2. 完善`init`命令(当前命令还不太完善，请先不使用)
3. 新增热更新功能