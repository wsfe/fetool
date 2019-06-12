import crypto from 'crypto'
import fs from 'fs'
import nodePath from 'path'

const path = nodePath.posix

/**
 * 获取文件 checksum
 * @param {Buffer} fileBuffer 文件内容
 */
const getFileChecksum = (fileBuffer) => {
  return crypto.createHash('md5').update(fileBuffer).digest('hex')
}

/**
 * 获取某个相对路径下文件的 checksum
 * @param {string} relativePath include 列表相对路径
 * @param {Object} map checksum map
 */
const genChecksumByPath = (relativePath, map) => {
  try {
    const stat = fs.statSync(relativePath)
    if (stat.isDirectory()) {
      try {
        const dirList = fs.readdirSync(relativePath)
        dirList.forEach((dir) => {
          genChecksumByPath(path.join(relativePath, dir), map)
        })
      } catch (e) {}
    } else if (stat.isFile()) {
      try {
        const fileBuffer = fs.readFileSync(relativePath)
        map[relativePath] = getFileChecksum(fileBuffer)
      } catch (e) {}
    }
  } catch (e) {}
}

/**
 * 生成新的 checksum.json 文件
 * @param {string[]} pathList include 路径列表
 * @param {string} localRootPath 本地根路径
 */
const genChecksumJson = (pathList, localRootPath) => {
  if (!Array.isArray(pathList)) return
  const checksumMap = {}
  pathList.forEach((relativePath) => {
    if (typeof relativePath === 'string') {
      genChecksumByPath(path.join(localRootPath, relativePath), checksumMap)
    }
  })
  return checksumMap
}

/**
 *
 * @param {Object} newChecksum 新的 checksum map
 * @param {Object} oldChecksum 旧的 checksum map
 * @returns {Object} 返回两个列表，一个是应上传列表，一个是应删除列表
 */
const compareChecksum = (newChecksum, oldChecksum) => {
  const uploadList = []
  const deleteList = []
  const oldCopy = Object.assign({}, oldChecksum)
  for (let key in newChecksum) {
    // 如果当前遍历路径在旧的 checksum map 中不存在，或者与旧的值不一致，则是需要上传的文件
    if (!oldChecksum.hasOwnProperty(key) || oldChecksum[key] !== newChecksum[key]) {
      uploadList.push(key)
    }
    delete oldCopy[key]
  }
  for (let key in oldCopy) {
    // 需要上传的文件路径已确认，旧的 checksum map 中剩下的则是新的 checksum map 中没有的路径，需要从 ftp 上删除
    if (oldCopy.hasOwnProperty(key)) {
      deleteList.push(key)
    }
  }
  return {
    uploadList,
    deleteList,
  }
}

export {
  genChecksumJson,
  compareChecksum,
}
