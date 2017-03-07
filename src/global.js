require('colors');

global.fs = require('fs');
global.sysPath = require('path');

global.info = console.info;

global.success = function() {
  info((' √ ' + [].slice.call(arguments).join(' ')).green);
};

global.warn = function() {
  info((' ∆ ' + [].slice.call(arguments).join(' ')).yellow);  
};

global.error = function() {
  info((' X ' + [].slice.call(arguments).join(' ')).red);  
};

global.log = function() {
  info('[ft] '.cyan + [].slice.call(arguments).join(' '));  
};