'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = lint;

var _standard = require('standard');

var _standard2 = _interopRequireDefault(_standard);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _textTable = require('text-table');

var _textTable2 = _interopRequireDefault(_textTable);

var _services = require('../services');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Given a word and a count, append an s if count is not one.
 * @param {string} word A word in its singular form.
 * @param {int} count A number controlling whether word should be pluralized.
 * @returns {string} The original word with an s on the end if count is not one.
 */
function pluralize(word, count) {
  return count === 1 ? word : word + 's';
}

function processResults(results) {
  var output = '\n';
  var total = 0;

  results.forEach(function (result) {
    var messages = result.messages;

    if (messages.length === 0) {
      return;
    }

    total += messages.length;
    output += _chalk2.default.underline(result.filePath) + '\n';

    output += (0, _textTable2.default)(messages.map(function (message) {
      var messageType = void 0;

      messageType = _chalk2.default.red('error');

      return ['', message.line || 0, message.column || 0, messageType, message.message.replace(/\.$/, ''), _chalk2.default.dim(message.ruleId || '')];
    }), {
      align: ['', 'r', 'l'],
      stringLength: function stringLength(str) {
        return _chalk2.default.stripColor(str).length;
      }
    }).split('\n').map(function (el) {
      return el.replace(/(\d+)\s+(\d+)/, function (m, p1, p2) {
        return _chalk2.default.dim(p1 + ':' + p2);
      });
    }).join('\n') + '\n\n';
  });

  if (total > 0) {
    output += _chalk2.default.red.bold(['\u2716 ', total, pluralize(' problem', total), '\n'].join(''));
  }

  return total > 0 ? output : '';
}

function lint(program) {
  program.command('lint').description('检测代码').action(function () {
    var project = _services.projectService.getProject(process.cwd(), false);
    var opts = project.userConfig.lint || {};
    opts.cwd = sysPath.join(process.cwd(), opts.cwd ? opts.cwd : 'src');
    spinner.text = 'start lint';
    _standard2.default.lintFiles([], opts, function (err, results) {
      spinner.stop();
      if (err) {
        error(err);
        return;
      }
      console.log(processResults(results.results));
    });
  });
}