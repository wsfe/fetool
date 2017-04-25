import express from 'express';
import serveStatic from 'serve-static';
import serveIndex from 'serve-index';
import compiler from './compiler';
import logger from './logger';

export default function initMiddlewares(app, options) {
  app.use(logger);
  app.use(serveIndex(process.cwd()));
  app.use(serveStatic(process.cwd(), {
    index: false
  }));
  app.use(compiler(options));
  // app.use(express.static(process.cwd(), {
  //   index: false,
  //   redirect: false
  // }));
};