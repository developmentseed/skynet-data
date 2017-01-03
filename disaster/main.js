'use strict'

const tr = require('tile-reduce')
const path = require('path')

// usage: node disaster/main.js /path/to/nepal.mbtiles path/to/tomnod.mbtiles damage_points_layer_name > damage.geojson
// and then tippecanoe -z 17 -l osm -P -ps -fo data/damage.mbtiles damage.geojson

const osmtiles = process.argv[2]
const damagetiles = process.argv[3]
const damageLayer = process.argv[4] || 'damage'

tr({
  log: false,
  zoom: 12,
  map: path.join(__dirname, 'tag-damage.js'),
  sources: [
    {
      name: 'osmdata',
      mbtiles: osmtiles,
      layers: ['osm'],
      raw: true
    },
    {
      name: 'damage',
      mbtiles: damagetiles,
      layers: [damageLayer]
    }
  ],
  sourceCover: 'osmdata',
  mapOptions: {
    damageLayer: damageLayer
  }
})
