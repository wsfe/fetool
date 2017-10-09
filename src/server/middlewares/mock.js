import _ from 'lodash'
import LRU from 'lru-cache'
import url from 'url'
import Mock from 'mockjs'
import validUrl from 'valid-url'
import request from 'request'
import chokidar from 'chokidar'

class MockMiddleware {
  constructor(cwd) {
    this.cwd = cwd
    this.responseCache = new LRU({
      max: 50,
      maxAge: 1000 * 60 * 60 * 24 * 3, // 超过3天就清除缓存
      dispose: (key, value) => {
        this.watchCache[key].close()
        delete this.watchCache[key]
      }
    })
    this.watchCache = {};
  }

  _getUnMatchedRule(rules) {
    return rules.findIndex((rule) => {
      return !rule.url || !rule.response
    })
  }

  _getRules(mockfile) {
    delete require.cache[require.resolve(mockfile)];
    return require(mockfile)
  }

  _handleRemoteRequest(rule, req, res) {
    let options = {
      url: rule.response,
      headers: Object.assign({}, req.headers, {host: url.parse(rule.response).hostname}),
      json: true
    }
    request[req.method.toLocaleLowerCase()](options, (err, response, body) => {
      if (err) {
        res.status(500).end(JSON.stringify(err))
      } else if (response.statusCode !== 200) {
        res.sendStatus(response.statusCode)
      } else {
        res.json(body)
      }
    })
  }

  _findRule(rules, method, path) {
    return rules.find((rule) => {
      rule.method = rule.method ? rule.method : 'GET'
      if (rule.method.toUpperCase() === method.toUpperCase() && (_.isString(rule.url) && rule.url === path || rule.url.toString().indexOf('RegExp') > -1 && rule.url.test(path))) {
        return true
      }
      return false
    })
  }

  _mock(rules, req, res) {
    let rule = this._findRule(rules, req.method, req.path)
    if (_.isFunction(rule.response)) {
      res.json(Mock.mock(rule.response(req)))
    } else if (_.isObject(rule.response)) {
      res.json(Mock.mock(rule.response))
    } else if (validUrl.isUri(rule.response) && !sysPath.isAbsolute(rule.response)) { // TODO 看看isUri的作用，有可能此判断条件只要一个就行了
      this._handleRemoteRequest(rule, req, res)
    }
  }

  /**
   * 加载mock规则
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  loadRules(req, res, next) {
    let url = req.path
    if (!this.responseCache.has(url)) {
      let parseObj = sysPath.parse(url),
        ext = parseObj.ext.toUpperCase()
      if (ext !== '.HTM' && ext !== '.HTML') {
        return next()
      }
      let mockfile = sysPath.join(this.cwd, parseObj.dir, `${parseObj.name}.mock.js`)
      let exit = fs.pathExistsSync(mockfile);
      if (exit) {
        try {
          let rules = this._getRules(mockfile)
          if (!_.isArray(rules)) {
            error(`${mockfile}必须返回数组`)
            return next();
          }
          let unMatchedRuleIndex = this._getUnMatchedRule(rules);
          if (unMatchedRuleIndex > -1) {
            error(`${mockfile}第${unMatchedRuleIndex}项不符合规范`)
            return next();
          }
          this.responseCache.set(url, rules)
          // 监听mock文件的变化
          let watcher = this.watchCache[url] = chokidar.watch(mockfile)
          watcher.on('change', (path, stats) => {
            this.responseCache.del(url)
          })
        } catch(err) {
          error(err.message)
        }
      }
    }
    next()
  }

  /**
   * 模拟数据
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  mockData(req, res, next) {
    if (req.xhr) {
      let urlParseObj = url.parse(req.headers.referer)
      let rules = this.responseCache.get(urlParseObj.pathname)
      if (!rules) {
        return res.sendStatus(404)
      }
      return this._mock(rules, req, res)
    }
    next()
  }
}

export default MockMiddleware;