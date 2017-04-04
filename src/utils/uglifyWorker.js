import path from 'path';
import fs from 'fs';
import uglifyJS from 'uglify-js';
import uglifycss from 'uglifycss';

import crypto from './crypto';

process.on('message', (message) => {
  let cwd = message.cwd,
    assetName = message.assetName;
  let response = {};

  let extname = path.extname(assetName);
  if (extname === '.js' || extname === '.css') {
    let content = fs.readFileSync(path.resolve(cwd, assetName), {encoding: 'utf8'});
    let minifiedCode = null;

    if (extname === '.js'){
      try {
        let minifyResult = uglifyJS.minify(content, {
          compress: {
            dead_code: true
          },
          fromString: true
        });
        minifiedCode = minifyResult.code;
      } catch(e) {
        response.error = Object.assign(e, {assetName: assetName});
      }
    } else if (extname === '.css') {
      minifiedCode = uglifycss.processString(content);
    }

    if (minifiedCode) {
      fs.writeFileSync(path.resolve(cwd, assetName), minifiedCode, {encoding: 'utf8'});
    }
  }

  process.send(response);
});