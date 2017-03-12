#ft

## 备注
1. 目前有两种模式，多页面和单页面模式。单页面模式只会导出一份样式表。多页面模式提倡，样式表独立出来，然后js里面的样式不被提取出来。

## 解决方案
1. 如果是要导出统一的样式，那么项目中的exports中，不应该有以样式后缀为结尾的文件，统一由webpack插件生成。不过这会产生一个问题，就是：在有很多文件的时候，出现，server只能有一个web-dev-middleware，这个时候每次请求，webpack都会为每个entry进行编译，速度会比较慢。这种是比较适用于entry比较少的情况。
2. 如果是根据不同的页面，产生不同的样式。这样是没有什么限制的。

## config demo

```
{
  mode: 'multi',  // 默认是多页面的应用，单页应用选择填写single。
  entryExtNames: {
    css: ['.css', '.scss', '.sass', '.less'],
    js: ['.js', '.jsx', '.vue']
  },
  config: {
    exports: [
      "js/module/home/index.js",
      "css/index.css",
      "css/base.css",
      "css/module/index.less"
    ],
    webpackConfig: function(config) {
      // do what you want todo
      return config;
    },
    cssWebpackConfig: function(config) {
      // do what you want todo
      return config;
    }
  }
}
```