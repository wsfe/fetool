/**
 * 控制 Promise 并发数，在所有 Promise 都完成后才执行 resolve
 * @param {Function[]} fnArray 返回 Promise 的函数数组
 * @param {number} options.concurrent 同时进行的 Promise 数量上限
 * @param {boolean} options.rejectOnError 失败后立即执行 reject ，表现与 Promise.all 相同
 */

const batchPromise = (
  fnArray,
  {
    concurrent = Infinity,
    rejectOnError = false,
  } = {}) => {
  let i = 0
  const pendingPromise = []
  const returnValue = []
  return new Promise((resolve, reject) => {
    const execute = () => {
      if (i === fnArray.length) {
        if (!pendingPromise.length) resolve(returnValue)
        return
      }
      while (pendingPromise.length < concurrent && i !== fnArray.length) {
        const currentIndex = i
        const fn = fnArray[i++]
        if (typeof fn === 'function') {
          const p = fn()
          if (p instanceof Promise) {
            pendingPromise.push(p)
            p.then((value) => {
              returnValue[currentIndex] = value
            }).catch((error) => {
              returnValue[currentIndex] = error
              if (rejectOnError) reject(error)
            }).then(() => {
              pendingPromise.splice(pendingPromise.indexOf(p), 1)
              if (i === fnArray.length) {
                if (!pendingPromise.length) resolve(returnValue)
              } else {
                execute()
              }
            })
          } else returnValue[currentIndex] = p
        } else returnValue[currentIndex] = fn
      }
    }
    execute()
  })
}

export default batchPromise
