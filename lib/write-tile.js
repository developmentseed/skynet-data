var fs = require('fs')
var path = require('path')

module.exports = function writeTile (output, source, tile, cb) {
  console.log('Reading ' + tile)
  source.getTile(tile[0], tile[1], tile[2], function (err, image, opts) {
    if (err && err.message === 'Tile does not exist') {
      console.error('Warning: missing tile', tile)
      if (cb) { return cb() }
      return
    } else if (err) {
      if (cb) { return cb(err) }
      throw err
    }

    var filename = path.join(output, tile.join('-') + '.png')
    console.log('Writing ' + filename)
    fs.writeFileSync(filename, image)
    if (cb) { cb() }
  })
}

