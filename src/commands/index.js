let commands = [];

fs.readdirSync(__dirname)
  .filter(fileName => fileName !== 'index.js')
  .forEach(fileName => {
    let command = require('./' + fileName).default;
    commands.push(command);
  });

export default function run(program) {
  commands.forEach(command => command(program));
};