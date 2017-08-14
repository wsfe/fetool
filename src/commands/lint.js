import standard from 'standard';
import chalk from 'chalk';
import table from 'text-table';
import { projectService } from '../services';

/**
 * Given a word and a count, append an s if count is not one.
 * @param {string} word A word in its singular form.
 * @param {int} count A number controlling whether word should be pluralized.
 * @returns {string} The original word with an s on the end if count is not one.
 */
function pluralize (word, count) {
  return (count === 1 ? word : word + 's');
}

function processResults(results) {
  let output = '\n';
  let total = 0;

  results.forEach(function (result) {
    let messages = result.messages;

    if (messages.length === 0) {
      return;
    }

    total += messages.length;
    output += chalk.underline(result.filePath) + '\n';

    output += table(
      messages.map(function (message) {
        let messageType;

        messageType = chalk.red('error');

        return [
          '',
          message.line || 0,
          message.column || 0,
          messageType,
          message.message.replace(/\.$/, ''),
          chalk.dim(message.ruleId || '')
        ];
      }),
      {
        align: ['', 'r', 'l'],
        stringLength: function (str) {
          return chalk.stripColor(str).length;
        }
      }
    ).split('\n').map(function (el) {
      return el.replace(/(\d+)\s+(\d+)/, function (m, p1, p2) {
        return chalk.dim(p1 + ':' + p2);
      });
    }).join('\n') + '\n\n';
  });

  if (total > 0) {
    output += chalk.red.bold([
      '\u2716 ', total, pluralize(' problem', total), '\n'
    ].join(''));
  }

  return total > 0 ? output : '';
}

export default function lint(program) {
  program.command('lint')
    .description('检测代码')
    .action(() => {
      let project = projectService.getProject(process.cwd(), ENV.PRD, false);
      let lintConfig = project.userConfig.lint || {};
      let opts = lintConfig.opts || {};
      opts.cwd = sysPath.join(process.cwd(), lintConfig.cwd ? lintConfig.cwd : 'src');
      spinner.text = 'start lint';
      standard.lintFiles([], opts, (err, results) => {
        spinner.stop();
        if (err) {
          error(err);
          process.exit(1);
        }
        let parseResult = processResults(results.results);
        if (parseResult) {
          console.log();
        } else {
          success('lint success');
        }
        process.exit();
      });
    });
}