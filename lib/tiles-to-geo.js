#!/usr/bin/env node

var split = require('split')
var through = require('through2')
var tilebelt = require('@mapbox/tilebelt')
var gs = require('geojson-stream')
var bb = require('turf-bbox-polygon')

module.exports = readSample

// Read a list of tiles from stdin, in the form:
// file.mbtiles z x y [optional additional data]
// Return an object stream of `[z, x, y]` tile objects that also have properties:
// `.source` for the filename and `.data` for whatever other (space delimited)
// data was on the line.
function readSample () {
  return process.stdin
  .pipe(split())
  .pipe(through.obj(function (line, enc, next) {
    if (!line.trim() || /^\s*#/.test(line)) { return next() }
    var parts = line.split(' ')
    var tile = parts.slice(1, 4).map(Number)

    var geo = bb(tilebelt.tileToBBOX([tile[1], tile[2], tile[0]]))
    geo.properties = { tile: tile }
    if (tile.length === 3) {
      this.push(geo)
    }

    next()
  }))
  .pipe(gs.stringify())
  .pipe(process.stdout)
}

if (require.main === module) {
  readSample()
}
