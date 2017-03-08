import express from 'express';
import compiler from './compiler';
import logger from './logger';

export default function initMiddlewares(app, options) {
  app.use(logger);
  app.use(express.static(process.cwd(), {
    index: false,
    redirect: false
  }));
  app.use(compiler(options));
};