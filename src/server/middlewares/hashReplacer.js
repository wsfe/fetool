
const OUTPUT_DIR = 'prd'
const QUERY_REG = /\?.+$/
const VER_REG = /@[\d\w]+(?=\.\w+)/

export default function replaceHash(req, res, next) {
  const filePaths = req.url.split('/')

  // 如果url == '/projectname/prd/..../xxx@hash值.js|css'，那么把这些hash都删除掉。
  if (filePaths[2] === OUTPUT_DIR) {
    req.url = req.url.replace(QUERY_REG, '').replace(VER_REG, '')
  }
  next()
}