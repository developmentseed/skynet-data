var split = require('split')
var through = require('through2')
module.exports = function readSample () {
  return process.stdin
  .pipe(split())
  .pipe(through.obj(function (line, enc, next) {
    var tile = line.split(' ').slice(1).map(Number)
    if (tile.length === 3) {
      this.push(tile)
    }
    next()
  }))
}
