import uglifyJS from 'uglify-js'

export function minify(task, cb) {
  let result = uglifyJS.minify(task.source, task.uglifyOptions)
  if (result.error) {
    cb(result.error)
  } else {
    cb(null, result.code)
  }
}