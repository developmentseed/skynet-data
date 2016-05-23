var filename = global.mapOptions.source || 'unknown.mbtiles'
var minBuildings = global.mapOptions['min-buildings']

// tile reduce worker script to count osm building features
module.exports = function (layers, tile, write, done) {
  var count = 0
  for (var i = 0; i < layers.osmdata.osm.length; i++) {
    var feat = layers.osmdata.osm.feature(i)
    if (feat.properties.building) { count++ }
  }

  if (count >= minBuildings) {
    write([filename, tile[2], tile[0], tile[1], count].join(' ') + '\n')
  }

  done()
}
