'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = server;

var _server = require('../server');

var _server2 = _interopRequireDefault(_server);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function server(program) {
  program.command('server').description('启动服务器').option('-p, --port [value]', '端口号').option('-s, --https', '开启 https 服务').option('-v, --verbose', '显示详细编译信息').action(function (options) {
    options.port = options.port || 80;
    new _server2.default(options);
  });
};