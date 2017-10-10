import express from 'express';
import serveStatic from 'serve-static';
import serveIndex from 'serve-index';
import compiler from './compiler';
import logger from './logger';
import htmlCompiler from './htmlCompiler';
import Mock from './mock'
import cors from './cors'

export default function initMiddlewares(app, options) {
  let mockInstance = new Mock(process.cwd());
  app.use(logger);
  app.use(/.*\.(html|eot|ttf|woff|svg)/, cors)
  app.use(mockInstance.loadRules.bind(mockInstance));
  app.use(mockInstance.mockData.bind(mockInstance));
  app.use('*.html', htmlCompiler(process.cwd()));
  app.use(serveIndex(process.cwd()));
  app.use(serveStatic(process.cwd(), {
    index: false
  }));
  app.use(compiler(options));
};