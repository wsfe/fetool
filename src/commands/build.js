export default function build(program) {
  program.command('build')
  .description('线上编译')
  .action(() => {
    console.log('build');
  });
};