#ft

## 备注
1. 如果是js里面有样式，并且又配置了extract-text-webpack-plugin,那么服务器这个时候是请求不到相应的css的。
2. 如果配置的是导出统一的样式表，这个时候会出现请求不到相应样式的情况。

## config demo

```
{
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