#ft

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