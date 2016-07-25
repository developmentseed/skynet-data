var filename = global.mapOptions.source || 'unknown.mbtiles'

// tile reduce worker script to list tiles that have at least one building or
// road
module.exports = function (layers, tile, write, done) {
  var count = 0
  for (var i = 0; i < layers.osmdata.osm.length; i++) {
    var feat = layers.osmdata.osm.feature(i)
    if (feat.properties.building || feat.properties.highway) {
      write([filename, tile[2], tile[0], tile[1], count].join(' ') + '\n')
      break
    }
  }

  done()
}
