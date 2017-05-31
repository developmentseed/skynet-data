var fs = require('fs')
var path = require('path')
const blank = new Buffer('89504e470d0a1a0a0000000d494844520000010000000100010300000066bc3a2500000003504c5445000000a77a3dda0000001f494441546881edc1010d000000c2a0f74f6d0e37a00000000000000000be0d210000019a60e1d50000000049454e44ae426082', 'hex');

module.exports = function writeTile (output, source, tile, cb, removeBlank) {
  if(!removeBlank){
    removeBlank=false
  }
  var filename = path.join(output, tile.join('-') + '.png')
  fs.exists(filename, function (exists) {
    if (exists) { return cb() }
    console.log('Reading ' + tile)
    source.getTile(tile[0], tile[1], tile[2], function (err, image, opts) {
      if (err) {
        // report errors to screen, but don't actually fail
        console.error('Error processing tile ' + tile, err.message || err)
        if (cb) { return cb() }
      }
      //skip images which are blank if the label ratio > 0
      if(!removeBlank || !blank.equals(image)){
        console.log('Writing ' + filename)
        fs.writeFileSync(filename, image)
      }else{
        console.log(filename + " blank, not Writing") 
      }
      if (cb) { cb() }
    })
  })
}

