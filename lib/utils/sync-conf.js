"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function getConfigFile(files) {
  var file = files.find(function (file) {
    return fs.existsSync(sysPath.join(process.cwd(), file));
  });
  return file ? sysPath.join(process.cwd(), file) : false;
}

var errorMessage = function errorMessage(env) {
  return "\u8BF7\u67E5\u770B\u914D\u7F6E\u6587\u6863\uFF0C\u914D\u7F6E\u76F8\u5173".concat(env, "\u670D\u52A1\u5668!");
};

var getSyncConf = function getSyncConf(env) {
  env = env ? env : process.env.npm_config_server;
  var syncConf = {};
  var configPath = getConfigFile(['fet.config.js', 'ft.config.js']);

  if (configPath) {
    delete require.cache[require.resolve(configPath)];

    var userConfig = require(configPath);

    if (!userConfig.servers || !(syncConf = userConfig.servers[env])) {
      error(errorMessage(env));
      process.exit(1);
    }
  } else {
    try {
      var packageJson = fs.readJsonSync(sysPath.join(process.cwd(), 'package.json'));

      if (!packageJson.servers || !(syncConf = packageJson.servers[env])) {
        throw new Error(errorMessage(env));
      }
    } catch (err) {
      error(err);
      process.exit(1);
    }
  }

  return syncConf;
};

var _default = getSyncConf;
exports["default"] = _default;