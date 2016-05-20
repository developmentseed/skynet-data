var fs = require('fs')
var path = require('path')

module.exports = function writeTile (output, source, tile, cb) {
  console.log('Reading ' + tile)
  source.getTile(tile[0], tile[1], tile[2], function (err, image, opts) {
    if (err) {
      // report errors to screen, but don't actually fail
      console.error('Error processing tile ' + tile, err.message || err)
      if (cb) { return cb() }
    }

    var filename = path.join(output, tile.join('-') + '.png')
    console.log('Writing ' + filename)
    fs.writeFileSync(filename, image)
    if (cb) { cb() }
  })
}

