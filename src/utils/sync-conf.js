function getConfigFile (files) {
  let file = files.find(file => {
    return fs.existsSync(sysPath.join(process.cwd(), file))
  })
  return file ? sysPath.join(process.cwd(), file) : false
}

const errorMessage = function (env) {
  return `请查看配置文档，配置相关${env}服务器!`
}

const getSyncConf = function (env) {
  env = env ? env : process.env.npm_config_server
  let syncConf = {}
  let configPath = getConfigFile(['fet.config.js', 'ft.config.js'])
  if (configPath) {
    delete require.cache[require.resolve(configPath)]
    let userConfig = require(configPath)
    if (!userConfig.servers || !(syncConf = userConfig.servers[env])) {
      error(errorMessage(env))
      process.exit(1)
    }
  } else {
    try {
      let packageJson = fs.readJsonSync(sysPath.join(process.cwd(), 'package.json'))
      if (!packageJson.servers || !(syncConf = packageJson.servers[env])) {
        throw(new Error(errorMessage(env)))
      }
    } catch(err) {
      error(err)
      process.exit(1)
    }
  }
  return syncConf
}

export default getSyncConf
