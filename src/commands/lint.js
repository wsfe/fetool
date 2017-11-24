import standard from 'standard';
// import chalk from 'chalk';
// import table from 'text-table';
// import stripAnsi from 'strip-ansi'
import formatter from 'eslint-friendly-formatter'
import Project from '../models/project';

export default function lint(program) {
  program.command('lint')
    .description('检测代码')
    .action(() => {
      let project = new Project(process.cwd(), ENV.PRD);
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
        let parseResult = formatter(results.results);
        if (parseResult) {
          console.log(parseResult);
        } else {
          success('lint success');
        }
        process.exit();
      });
    });
}