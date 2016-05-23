var filename = global.mapOptions || 'unknown.mbtiles'
module.exports = function (layers, tile, write, done) {
  var count = 0
  for (var i = 0; i < layers.osmdata.osm.length; i++) {
    var feat = layers.osmdata.osm.feature(i)
    if (feat.properties.building) { count++ }
  }

  write([filename, tile[2], tile[0], tile[1], count].join(' ') + '\n')

  done()
}
