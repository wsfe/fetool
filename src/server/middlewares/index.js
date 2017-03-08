import compiler from './compiler';
import logger from './logger';

export default function initMiddlewares(app, options) {
  app.use(logger);
  app.use(compiler(options));
};