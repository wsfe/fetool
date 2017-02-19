

class Config {
  constructor(cwd) {
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
          filename: '[name][ext]',
          chunkFilename: '[id].chunk.js'
        },
        dev: {
          path: './dev/',
          filename: '[name][ext]',
          chunkFilename: '[id].chunk.js'
        },
        prd: {
          path: './prd/',
          filename: '[name].min[ext]',
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
      requireRules: [],
      devtool: 'cheap-source-map'
    };
  }
}

export default Config;