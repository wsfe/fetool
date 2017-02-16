export default function pack(program) {
  program.command('pack')
  .description('打包代码')
  .action(() => {
    console.log('pack');
  });
};