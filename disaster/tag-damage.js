'use strict'

const extent = require('@turf/bbox')
const inside = require('@turf/inside')

const damageLayer = global.mapOptions.damageLayer

module.exports = function (tileLayers, tile, write, done) {
  const damage = tileLayers.damage[damageLayer].features

  for (var i = 0; i < tileLayers.osmdata.osm.length; i++) {
    const ft = tileLayers.osmdata.osm.feature(i)
    if (ft.properties.building) {
      const building = ft.toGeoJSON(tile[0], tile[1], tile[2])
      tagBuilding(building, damage)
      write(JSON.stringify(building) + '\n')
    }
  }

  done()
}

function tagBuilding (building, damage) {
  const bbox = extent(building)

  building.properties = { damaged: 'no' }

  for (let i = 0; i < damage.length; i++) {
    const point = damage[i]
    if (!/Damaged Building|Major Destruction/.test(point.properties.tag_type)) {
      continue
    }
    const coords = point.geometry.coordinates
    if (coords[0] < bbox[0] ||
        coords[0] > bbox[2] ||
        coords[1] < bbox[1] ||
        coords[1] > bbox[3]) {
      continue
    }
    if (!inside(point, building)) {
      continue
    }
    building.properties.damaged = 'yes'
  }
}
