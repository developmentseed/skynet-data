var split = require('split')
var through = require('through2')
var argv = require('minimist')(process.argv.slice(2))

var minLabelRatio = parseFloat(argv['label-ratio'])

module.exports = function readSample () {
  return process.stdin
  .pipe(split())
  .pipe(through.obj(function (line, enc, next) {
    if (!line.trim() || /^\s*#/.test(line)) { return next() }
    var parts = line.split(' ')
    var tile = parts.slice(1, 4).map(Number)
    tile.source = parts[0]
    tile.data = parts.slice(4)

    if (minLabelRatio >= 0) {
      if (tile.data.length === 0) { return next(new Error('Cannot filter by label ratio because data does not include class counts.\n' + line)) }
      var freqs = tile.data.map(Number)
      var sum = freqs.reduce((a, b) => a + b, 0)
      // Assumes the LAST class is background
      var ratio = (sum - freqs[freqs.length - 1]) / sum
      if (ratio <= minLabelRatio) { return next() }
    }

    if (tile.length === 3) {
      this.push(tile)
    }

    next()
  }))
}
