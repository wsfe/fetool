'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = pack;
function pack(program) {
  program.command('pack').description('打包代码').action(function () {
    console.log('pack');
  });
};