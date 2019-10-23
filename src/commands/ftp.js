import FTP from 'ftp'
import nodePath from 'path'
import _ from 'lodash'
import { genChecksumJson, compareChecksum } from '../utils/checksum'
import batchPromise from '../utils/batch-promise'
import getSyncConf from '../utils/sync-conf'

const path = nodePath.posix

const batchConfig = {}

const CHECKSUM_JSON = 'checksum.json'

const ftpClient = new FTP()

/**
 * 获取旧 checksum map
 * @param {FTP} client FTP 实例
 * @param {string} checksumPath 从远程获取旧 checksum 的路径
 */
const getOldChecksumMap = (client, checksumPath) => {
  return new Promise((resolve) => {
    client.get(checksumPath, (err, stream) => {
      if (err) {
        resolve({})
        return
      }
      stream.setEncoding('utf8')
      let str = ''
      stream.on('data', (chunk) => {
        str += chunk
      })
      stream.on('end', () => {
        let map = {}
        try {
          map = JSON.parse(str)
        } catch (e) {}
        resolve(map)
      })
    })
  })
}

const operateSingleFile = (type, client, ...args) => {
  return new Promise((resolve, reject) => {
    const remoteRootPath = args[args.length - 2]
    const relativePath = args[args.length - 1]
    const remotePath = path.join(remoteRootPath, relativePath)
    args.splice(args.length - 2, 2, remotePath)
    const executeOperation = () => {
      client[type](...args, (err) => {
        const result = {
          type,
          file: relativePath,
          success: true,
        }
        if (err) {
          reject(Object.assign(result, { success: false }))
          error(`${type} ${relativePath} fail, `, err)
        }
        else {
          resolve(result)
          log(`${type} ${relativePath} success`)
        }
      })
    }
    if (type === 'put') {
      // 上传文件之前先确保服务器上有对应文件夹
      const remoteDir = path.parse(remotePath).dir
      client.mkdir(remoteDir, true, (err) => {
        // console.log('mkdir error', err)
        executeOperation()
      })
    } else {
      executeOperation()
    }
  })
}

/**
 * 批量上传文件
 * @param {FTP} client FTP 实例
 * @param {string[]} uploadList 上传路径列表
 * @param {string} remoteRootPath 远程根路径
 */
const uploadFiles = (client, uploadList, remoteRootPath) => {
  return batchPromise(uploadList.map((uploadPath) => {
    return operateSingleFile.bind(null, 'put', client, uploadPath, remoteRootPath, uploadPath)
  }), batchConfig)
}

/**
 * 批量删除远程文件
 * @param {FTP} client FTP 实例
 * @param {string[]} deleteList 要删除的路径列表
 * @param {string} remoteRootPath 远程根路径
 */
const deleteFiles = (client, deleteList, remoteRootPath) => {
  return batchPromise(deleteList.map((deletePath) => {
    return operateSingleFile.bind(null, 'delete', client, remoteRootPath, deletePath)
  }), batchConfig)
}

/**
 * 上传修正后的 checksum.json ，没有上传或删除成功的 hash 不会被更新
 */
const uploadChecksumJson = (client, newChecksum, oldChecksum, uploadResult, deleteResult, remoteRootPath) => {
  return new Promise((resolve, reject) => {
    const currectChecksum = Object.assign({}, newChecksum)
    uploadResult.concat(deleteResult).forEach((result) => {
      if (!result.success) {
        currectChecksum[result.file] = oldChecksum[result.file]
      }
    })
    client.put(Buffer.from(JSON.stringify(currectChecksum), 'utf8'), path.join(remoteRootPath, CHECKSUM_JSON), (err) => {
      if (err) {
        error(`put ${CHECKSUM_JSON} fail`)
        reject(err)
      } else {
        log(`put ${CHECKSUM_JSON} success`)
        resolve()
      }
    })
  })
}

/**
 * 通过 FTP 同步至服务器
 * @param {string} host 远程地址
 * @param {string} rowRootPath 远程根路径
 * @param {string} localRootPath 本地根路径
 * @param {string[]} include 要上传的路径列表
 */
const syncViaFTP = (host, rowRootPath, localRootPath, include) => {
  return new Promise((resolve, reject) => {
    const dirs = path.normalize(rowRootPath).split(path.sep)
    const remoteRootPath = dirs[dirs.length - 1] || dirs[dirs.length - 2]
    const checksumPath = path.join(remoteRootPath, CHECKSUM_JSON)
    ftpClient.on('ready', () => {
      // 生成新的 checksum.json 文件
      const newChecksum = genChecksumJson(include, localRootPath)
      // 从服务器获取旧 checksum.json 文件
      getOldChecksumMap(ftpClient, checksumPath).then((oldChecksum) => {
        // 比较新旧 checksum.json ，获取上传与删除列表
        const { uploadList, deleteList } = compareChecksum(newChecksum, oldChecksum)
        Promise.all([
          // 上传文件到服务器
          uploadFiles(ftpClient, uploadList, remoteRootPath),
          // 从服务器删除不必要文件
          deleteFiles(ftpClient, deleteList, remoteRootPath),
        ]).then(([uploadResult, deleteResult]) => {
          const successPutCount = uploadResult.filter((result) => result.success).length
          const failedPutCount = uploadResult.length - successPutCount
          const successDeleteCount = deleteResult.filter((result) => result.success).length
          const failedDeleteCount = deleteResult.length - successDeleteCount
          log('')
          log('------ Send via FTP results ------')
          log(`Sent ${successPutCount} file(s) successfully.`)
          log(`Failed to send ${failedPutCount} file(s).`)
          log(`Deleted ${successDeleteCount} file(s) successfully.`)
          log(`Failed to delete ${failedDeleteCount} file(s).`)
          log('------ Send via FTP results ------')
          log('')
          return uploadChecksumJson(ftpClient, newChecksum, oldChecksum, uploadResult, deleteResult, remoteRootPath)
        }).catch((e) => {
          error(e)
        }).then(() => {
          ftpClient.end()
          resolve()
        })
      })
    })
    ftpClient.on('error', (err) => {
      if (err) {
        error(err)
        if (err.code === 530) {
          error('FTP 服务器连接失败')
          process.exit(1)
        }
      }
    })
    ftpClient.connect({
      host,
    })
  })
}

export default function ftp(program) {
  program.command('ftp <env>') // 同步到名字为env的开发环境
    .description('通过FTP同步到<env>机器')
    .action((env) => {
      const syncConf = getSyncConf(env)
      const host = syncConf.host
      const path = syncConf.path
      const local = syncConf.local || './'
      let default_include = []
      if (syncConf['include'] && syncConf['include'].length > 0) {
        default_include = default_include.concat(syncConf.include)
        default_include = _.uniq(default_include)
      }
      syncViaFTP(host, path, local, default_include).then(() => {
        process.exit()
      })
    });
};
