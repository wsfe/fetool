export default (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  next()
}