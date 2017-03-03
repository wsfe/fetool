'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
// import middlewares from './middlewares';
// import serveStatic from 'serve-static';


var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Server = function () {
  function Server(options) {
    _classCallCheck(this, Server);

    this.app = (0, _express2.default)();
    // middlewares(this.app);
    this.start(options);
  }
  /**
   * @description 启动服务器
   */


  _createClass(Server, [{
    key: 'start',
    value: function start(options) {
      var server = _http2.default.createServer(this.app).listen(options.port, function () {
        console.log('Starting up server, serving at: ', process.cwd());
        console.log('Available on: ', 'http://127.0.0.1:' + options.port);
      });
    }
  }]);

  return Server;
}();

module.exports = Server;