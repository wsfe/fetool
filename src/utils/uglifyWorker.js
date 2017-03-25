import path from 'path';
import fs from 'fs';
import {parser, uglify} from 'uglify-js';
import uglifycss from 'uglifycss';

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
        let ast = parser.parse(content);
        minifiedCode = uglify.gen_code(ast);
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
});