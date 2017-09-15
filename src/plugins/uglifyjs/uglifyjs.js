import workerFarm from 'worker-farm'
import os from 'os'
import pify from 'pify'
import { RawSource } from 'webpack-sources'

export default class WorkerManager {
  constructor (compilation, tasks) {
    this.compilation = compilation
    this.tasks = tasks
    this.farm = workerFarm({
      maxConcurrentWorkers: this.workCount(tasks),
      maxConcurrentCallsPerWorker: 1,
      maxRetries: 2,
      autoStart: true
    }, require.resolve('./worker'), ['minify'])
    this._minify = pify(this.farm.minify)
  }

  workCount(tasks) {
    return Math.min(tasks.length, Math.max(1, os.cpus().length - 1))
    // return Math.min(tasks.length, Math.max(1, os.cpus().length - 1))
  }

  end() {
    workerFarm.end(this.farm)
  }

  minify () {
    let minifies = []
    this.tasks.forEach((task) => {
      let promise = this._minify(task).then((code) => {
        this.compilation.assets[task.assetName] = new RawSource(code)
      }).catch((err) => {
        this.compilation.errors.push(err)
      })
      minifies.push(promise)
    })
    return Promise.all(minifies).then(this.end.bind(this)).catch(this.end.bind(this))
  }
}