'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _workerFarm = require('worker-farm');

var _workerFarm2 = _interopRequireDefault(_workerFarm);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WorkerManager = function () {
  function WorkerManager(compilation, tasks) {
    _classCallCheck(this, WorkerManager);

    this.compilation = compilation;
    this.tasks = tasks;
    this.farm = (0, _workerFarm2.default)({
      maxConcurrentWorkers: this.workCount(tasks),
      maxConcurrentCallsPerWorker: 1,
      maxRetries: 2,
      autoStart: true
    }, require.resolve('./worker'));
  }

  _createClass(WorkerManager, [{
    key: 'workCount',
    value: function workCount(tasks) {
      return Math.min(tasks.length, Math.max(1, _os2.default.cpus().length - 1));
    }
  }, {
    key: 'end',
    value: function end() {
      _workerFarm2.default.end(this.farm);
    }
  }, {
    key: 'minify',
    value: function minify() {
      var _this = this;

      var minifies = [];
      this.tasks.forEach(function (task) {
        var promise = _this.farm(task, function (err, outputSource) {
          if (err) {
            _this.compilation.errors.push(err);
          } else {
            _this.compilation.assets[task.assetName] = outputSource;
          }
        });
        minifies.push(promise);
      });
      return Promise.all(minifies).then(this.end.bind(this)).catch(this.end.bind(this));
    }
  }]);

  return WorkerManager;
}();

exports.default = WorkerManager;