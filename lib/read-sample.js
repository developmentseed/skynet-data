#!/usr/bin/env node

var split = require('split')
var through = require('through2')
var tilebelt = require('@mapbox/tilebelt')

module.exports = readSample

// Read a list of tiles from stdin, in the form:
// file.mbtiles z x y [optional additional data]
// Return an object stream of `[z, x, y]` tile objects that also have properties:
// `.source` for the filename and `.data` for whatever other (space delimited)
// data was on the line.
function readSample (argv) {
  return process.stdin
  .pipe(split())
  .pipe(through.obj(function (line, enc, next) {
    if (!line.trim() || /^\s*#/.test(line)) { return next() }
    var parts = line.split(' ')
    var tile = parts.slice(1, 4).map(Number)
    tile.source = parts[0]
    tile.data = parts.slice(4)

    if (argv['label-ratio'] >= 0) {
      if (tile.data.length === 0) { return next(new Error('Cannot filter by label ratio because data does not include class counts.\n' + line)) }
      var freqs = tile.data.map(Number)
      var sum = freqs.reduce((a, b) => a + b, 0)
      // Assumes the LAST class is background
      var ratio = (sum - freqs[freqs.length - 1]) / sum
      if (ratio <= argv['label-ratio']) { return next() }
    }

    if (argv.bbox) {
      var bb = argv.bbox.split(',').map(Number)
      var tb = tilebelt.tileToBBOX([tile[1], tile[2], tile[0]])
      var noIntersection = bb[0] > tb[2] || tb[0] > bb[2] || // W > E
        bb[1] > tb[3] || tb[1] > bb[3] // S > N
      if (noIntersection) { return next() }
    }

    if (tile.length === 3) {
      this.push(tile)
    }

    next()
  }))
}

if (require.main === module) {
  readSample(require('minimist')(process.argv.slice(2)))
  .on('data', function (tile) {
    console.log(tile.source + ' ' + tile.concat(tile.data).join(' '))
  })
}
