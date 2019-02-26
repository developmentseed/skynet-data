#!/usr/bin/env node

const cover = require('@mapbox/tile-cover')
const bb = require('turf-bbox-polygon')
const argv = require('minimist')(process.argv.slice(2))

const bbox = argv.bbox
const zoom = argv.zoom
const mbtiles = argv.mbtiles

const geo = bb(bbox.split(',').map(b => +b))

cover.tiles(geo.geometry, {
  min_zoom: parseInt(zoom, 10),
  max_zoom: parseInt(zoom, 10)
}).forEach(function (tile) {
  console.log([mbtiles, tile[2], tile[0], tile[1]].join(' '))
})
