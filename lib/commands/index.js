'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = run;
var commands = [];

fs.readdirSync(__dirname).filter(function (fileName) {
  return fileName !== 'index.js';
}).forEach(function (fileName) {
  var command = require('./' + fileName).default;
  commands.push(command);
});

function run(program) {
  commands.forEach(function (command) {
    return command(program);
  });
};