var bbox = require('@turf/bbox')
var tilebelt = require('@mapbox/tilebelt')

module.exports = function (data, tile, writeData, done) {
  var tileBbox = tilebelt.tileToBBOX(tile)
  var bboxes = data.osmdata.buildingsgeojson.features.map(feature => {
    return bbox(feature) // feature to bounding box
  }).map(bb => {
    return [
      bb[0] - tileBbox[0],
      bb[1] - tileBbox[1],
      bb[2] - tileBbox[0],
      bb[3] - tileBbox[1]
    ] // bbox coordinates shifted to tile origin
  }).map(bb => {
    return bb.map((b, i) => {
      var pixel = Math.max(0,
        Math.min(255,
          Math.round(b / global.mapOptions.pixelsPerDegree) // convert to tile pixels
        )
      )
      // flip the y axis
      return (i % 2 === 0) ? pixel : 255 - pixel
    })
  })
  writeData(`${JSON.stringify(bboxes)} ${tile[2]}-${tile[0]}-${tile[1]}\n`)
  done(null, true)
}
