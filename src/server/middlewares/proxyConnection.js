import {URL} from 'url'

export default (req, res, next) => {
  if (req.header('proxy-connection')) {
    try {
      let reqUrl = new URL(req.url).pathname
      req.url = reqUrl
      req.originalUrl = reqUrl
    } catch(e) {
      next()
      return
    }
  }
  next()
}
