import Config from './config';

class Project {
  constructor(cwd) {
    this.cwd = cwd;
    this.config = new Config(cwd);
  }
}

export default Project;