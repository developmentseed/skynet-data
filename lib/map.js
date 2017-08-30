var bbox = require('@turf/bbox')
var tilebelt = require('@mapbox/tilebelt')

module.exports = function (data, tile, writeData, done) {
  var tileBbox = tilebelt.tileToBBOX(tile)
  var bboxes = data.osmdata.buildingsgeojson.features.map(feature => {
    return bbox(feature) // feature to bounding box
  }).map(bb => {
    return [
      bb[0] - tileBbox[0],
      bb[3] - tileBbox[1], // intentionally out of order because latitude maximum becomes y minimum
      bb[2] - tileBbox[0],
      bb[1] - tileBbox[1]
    ] // bbox coordinates shifted to tile origin
  }).map(bb => {
    return bb.map((b, i) => {
      var pixel = Math.round(b / global.mapOptions.pixelsPerDegree) // convert to tile pixels
      var flipped = (i % 2 === 0) ? pixel : 255 - pixel // flip the y axis
      var buffered = flipped + (i > 1 ? 1 : -1) * global.mapOptions.pixelBuffer // buffer
      return Math.max(0, Math.min(255, buffered)) // clamp to the correct range
    })
  })
  writeData(`${JSON.stringify(bboxes)} ${tile[2]}-${tile[0]}-${tile[1]}\n`)
  done(null, true)
}
