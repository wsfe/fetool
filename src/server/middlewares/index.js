import compiler from './compiler';

export default function initMiddlewares(app) {
  this.app.use(compiler);
};