
QA_TILES ?= planet
IMAGE_TILES ?= "tilejson+https://a.tiles.mapbox.com/v4/mapbox.satellite.json?access_token=$(MapboxAccessToken)"
TRAIN_SIZE ?= 1000
CLASSES ?= classes/water-roads-buildings.json

data/osm/planet.mbtiles:
	mkdir -p $(dir $@)
	curl https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.planet.mbtiles.gz | gunzip > $@

data/osm/%.mbtiles:
	mkdir -p $(dir $@)
	curl https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.country/$(notdir $@).gz | gunzip > $@

data/sample.txt: data/osm/$(QA_TILES).mbtiles
	tippecanoe-enumerate $^ | ./sample $(TRAIN_SIZE) > $@

.PHONY: data/labels
data/labels: data/sample.txt
	mkdir -p $@
	cat data/sample.txt | ./rasterize-labels data/osm/$(QA_TILES).mbtiles $(CLASSES) $@

.PHONY: data/images
data/images:
	mkdir -p $@
	cat data/sample.txt | ./download-images $(IMAGE_TILES) $@
