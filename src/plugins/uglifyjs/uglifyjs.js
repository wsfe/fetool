import workFarm from 'worker-farm'
import os from 'os'

export default class WorkerManager {
  constructor (compilation, tasks) {
    this.compilation = compilation
    this.tasks = tasks
    this.farm = workFarm({
      maxConcurrentWorkers: this.workCount(tasks),
      maxConcurrentCallsPerWorker: 1,
      maxRetries: 2,
      autoStart: true
    }, require.resolve('./worker'))
  }

  workCount(tasks) {
    return Math.min(tasks.length, Math.max(1, os.cpus().length - 1))
  }

  end() {
    workFarm.end(this.farm)
  }

  minify () {
    let minifies = []
    this.tasks.forEach((task) => {
      let promise = this.farm(task, (err, outputSource) => {
        if (err) {
          this.compilation.errors.push(err)
        } else {
          this.compilation.assets[task.assetName] = outputSource
        }
      })
      minifies.push(promise)
    })
    return Promise.all(minifies).then(this.end.bind(this)).catch(this.end.bind(this))
  }
}