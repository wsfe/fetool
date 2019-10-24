

export default class CompilerLogger {

  apply(compiler) {
    compiler.hooks.done.tap('CompilerLoggerPlugin', (stats) => {
      let info = stats.toJson({ errorDetails: false });

      if (stats.hasErrors()) {
        info.errors.map((err) => {
          error(err + '\n');
        });
      }

      if (stats.hasWarnings()) {
        info.warnings.map((warning) => {
          warn(warning + '\n');
        });
      }

      info.assets.map(asset => {
        let fileSize = asset.size;
        fileSize = fileSize > 1024
          ? (fileSize / 1024).toFixed(2) + ' KB'
          : fileSize + ' Bytes';
        log(`- ${asset.name} - ${fileSize}`);
      });
    })
  }
}
