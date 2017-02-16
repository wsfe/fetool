'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = build;
function build(program) {
  program.command('build').description('线上编译').action(function () {
    console.log('build');
  });
};