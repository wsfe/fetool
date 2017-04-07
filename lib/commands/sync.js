'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = sync;

var _services = require('../services');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function sync(program) {
  program.command('sync').description('同步到开发机').action(function (options) {
    var project = _services.projectService.getProject(process.cwd(), false);
    var rsync = new Sync(project);
    rsync.sync();
  });
};

var Sync = function () {
  function Sync(project) {
    _classCallCheck(this, Sync);

    this.project = project;
  }

  _createClass(Sync, [{
    key: 'sync',
    value: function sync() {}
  }]);

  return Sync;
}();