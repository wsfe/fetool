'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = server;
function server(program) {
  program.command('server').description('启动服务器').option('-p, --port [value]', '端口号').action(function (options) {
    console.log('port', options.port);
    console.log('process.cwd', process.cwd());
  });
};