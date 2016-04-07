var fs = require('fs')
var path = require('path')
var util = require('util')

module.exports = function (layers) {
  var style = fs.readFileSync(path.join(__dirname, 'style.xml'), 'utf8')
  var layerTemplate = fs.readFileSync(path.join(__dirname, 'layer.xml'), 'utf8')

  return util.format(style, layers.map(function (layer, i) {
    return layerTemplate
    .replace(/COLOR/g, layer.color)
    .replace(/STROKE_WIDTH/g, layer['stroke-width'])
    .replace(/FILTER/g, layer.filter ? '(' + layer.filter + ') and ' : '')
  }).join('\n'))
  .replace(/LAYER_ID/g, 'osm')
  .replace(/FORMAT/g, 'png8:m=o:t=0:c=' + (layers.length + 1))
}
