'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _lruCache = require('lru-cache');

var _lruCache2 = _interopRequireDefault(_lruCache);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _mockjs = require('mockjs');

var _mockjs2 = _interopRequireDefault(_mockjs);

var _validUrl = require('valid-url');

var _validUrl2 = _interopRequireDefault(_validUrl);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _chokidar = require('chokidar');

var _chokidar2 = _interopRequireDefault(_chokidar);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MockMiddleware = function () {
  function MockMiddleware(cwd) {
    var _this = this;

    _classCallCheck(this, MockMiddleware);

    this.cwd = cwd;
    this.responseCache = new _lruCache2.default({
      max: 50,
      maxAge: 1000 * 60 * 60 * 24 * 3, // 超过3天就清除缓存
      dispose: function dispose(key, value) {
        _this.watchCache[key].close();
        delete _this.watchCache[key];
      }
    });
    this.watchCache = {};
  }

  _createClass(MockMiddleware, [{
    key: '_getUnMatchedRule',
    value: function _getUnMatchedRule(rules) {
      return rules.findIndex(function (rule) {
        return !rule.url || !rule.response;
      });
    }
  }, {
    key: '_getRules',
    value: function _getRules(mockfile) {
      delete require.cache[require.resolve(mockfile)];
      return require(mockfile);
    }
  }, {
    key: '_handleRemoteRequest',
    value: function _handleRemoteRequest(rule, req, res) {
      var options = {
        url: rule.response,
        headers: Object.assign({}, req.headers, { host: _url2.default.parse(rule.response).hostname }),
        json: true
      };
      _request2.default[req.method.toLocaleLowerCase()](options, function (err, response, body) {
        if (err) {
          res.status(500).end(JSON.stringify(err));
        } else if (response.statusCode !== 200) {
          res.sendStatus(response.statusCode);
        } else {
          res.json(body);
        }
      });
    }
  }, {
    key: '_findRule',
    value: function _findRule(rules, method, path) {
      return rules.find(function (rule) {
        rule.method = rule.method ? rule.method : 'GET';
        if (rule.method.toUpperCase() === method.toUpperCase() && (_lodash2.default.isString(rule.url) && rule.url === path || rule.url.toString().indexOf('RegExp') > -1 && rule.url.test(path))) {
          return true;
        }
        return false;
      });
    }
  }, {
    key: '_mock',
    value: function _mock(rules, req, res) {
      var rule = this._findRule(rules, req.method, req.path);
      if (_lodash2.default.isFunction(rule.response)) {
        res.json(_mockjs2.default.mock(rule.response(req)));
      } else if (_lodash2.default.isObject(rule.response)) {
        res.json(_mockjs2.default.mock(rule.response));
      } else if (_validUrl2.default.isUri(rule.response) && !sysPath.isAbsolute(rule.response)) {
        // TODO 看看isUri的作用，有可能此判断条件只要一个就行了
        this._handleRemoteRequest(rule, req, res);
      }
    }

    /**
     * 加载mock规则
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */

  }, {
    key: 'loadRules',
    value: function loadRules(req, res, next) {
      var _this2 = this;

      var url = req.path;
      if (!this.responseCache.has(url)) {
        var parseObj = sysPath.parse(url),
            ext = parseObj.ext.toUpperCase();
        if (ext !== '.HTM' && ext !== '.HTML') {
          return next();
        }
        var mockfile = sysPath.join(this.cwd, parseObj.dir, parseObj.name + '.mock.js');
        var exit = fs.pathExistsSync(mockfile);
        if (exit) {
          try {
            var rules = this._getRules(mockfile);
            if (!_lodash2.default.isArray(rules)) {
              error(mockfile + '\u5FC5\u987B\u8FD4\u56DE\u6570\u7EC4');
              return next();
            }
            var unMatchedRuleIndex = this._getUnMatchedRule(rules);
            if (unMatchedRuleIndex > -1) {
              error(mockfile + '\u7B2C' + unMatchedRuleIndex + '\u9879\u4E0D\u7B26\u5408\u89C4\u8303');
              return next();
            }
            this.responseCache.set(url, rules);
            // 监听mock文件的变化
            var watcher = this.watchCache[url] = _chokidar2.default.watch(mockfile);
            watcher.on('change', function (path, stats) {
              _this2.responseCache.del(url);
            });
          } catch (err) {
            error(err.message);
          }
        }
      }
      next();
    }

    /**
     * 模拟数据
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */

  }, {
    key: 'mockData',
    value: function mockData(req, res, next) {
      if (req.xhr) {
        var urlParseObj = _url2.default.parse(req.headers.referer);
        var rules = this.responseCache.get(urlParseObj.pathname);
        if (!rules) {
          return res.sendStatus(404);
        }
        return this._mock(rules, req, res);
      }
      next();
    }
  }]);

  return MockMiddleware;
}();

exports.default = MockMiddleware;