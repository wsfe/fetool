'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Config = function Config(cwd) {
  _classCallCheck(this, Config);

  this.entryGroups = {};
  this.entryExtNames = {
    css: ['.css'],
    js: ['.js', '.jsx']
  };
  this._config = {
    cwd: cwd,
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
};

exports.default = Config;