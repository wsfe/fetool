import express from 'express';
import serveStatic from 'serve-static';
import serveIndex from 'serve-index';
import httpProxy from 'http-proxy-middleware'
import compiler from './compiler';
import logger from './logger';
import htmlCompiler from './htmlCompiler';
import cors from './cors'
import webpackStatic from './webpackStatic'
import hashReplacer from './hashReplacer'

function proxy(app) {
  const conf = app.get('fet');
  Object.keys(conf).forEach(projectName => {
    const project = conf[projectName]
    app.use(`/${projectName}`, httpProxy({
      target: `http://localhost:${project.port}`,
      changeOrigin: true
    }))
  })
}

export default function initMiddlewares(app, options, conf) {
  app.use(logger);
  app.use(hashReplacer)
  proxy(app)
  app.use(/.*\.(html|eot|ttf|woff|svg|json)/, cors)
  app.use(webpackStatic)
  app.use('*.html', htmlCompiler(process.cwd()));
  app.use(serveIndex(process.cwd()));
  app.use(serveStatic(process.cwd(), {
    index: false
  }));
  app.use(compiler(options));
};
