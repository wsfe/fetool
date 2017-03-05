import compiler from './compiler';

export default function initMiddlewares(app) {
  app.use(compiler);
};