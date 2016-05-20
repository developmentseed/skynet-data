
QA_TILES ?= planet
DATA_TILES ?= data/osm/$(QA_TILES).mbtiles
IMAGE_TILES ?= "tilejson+https://a.tiles.mapbox.com/v4/mapbox.satellite.json?access_token=$(MapboxAccessToken)"
TRAIN_SIZE ?= 1000
CLASSES ?= classes/water-roads-buildings.json
LABEL_RATIO ?= 0
ZOOM_LEVEL ?= ''

data/osm/planet.mbtiles:
	mkdir -p $(dir $@)
	curl https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.planet.mbtiles.gz | gunzip > $@

data/osm/%.mbtiles:
	mkdir -p $(dir $@)
	curl https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.country/$(notdir $@).gz | gunzip > $@

data/all_tiles.txt: $(DATA_TILES)
	tippecanoe-enumerate $^ > $@

data/sample.txt: data/all_tiles.txt
	./sample $^ $(TRAIN_SIZE) $(ZOOM_LEVEL) > $@

data/labels/color: data/sample.txt
	mkdir -p $@
	cat data/sample.txt | ./rasterize-labels $(DATA_TILES) $(CLASSES) $@

data/labels/grayscale: data/labels/color
	mkdir -p $@
	for i in $(wildcard data/labels/color/*.png) ; do cat $$i | ./palette-to-grayscale $(CLASSES) > $@/`basename $$i` ; done

data/labels/label-stats.csv: data/labels/label-counts.txt
	cat data/labels/label-counts.txt | ./label-stats > $@

data/labels/label-counts.txt: data/labels/color data/sample.txt
	cat data/sample.txt | ./label-counts $(CLASSES) data/labels/color > $@

data/images: data/labels/label-counts.txt
	mkdir -p $@
	cat data/labels/label-counts.txt | ./download-images $(IMAGE_TILES) $@ --label-ratio $(LABEL_RATIO)

.PHONY: clean-labels clean-images clean
clean-labels:
	rm -rf data/labels
clean-images:
	rm -rf data/images
clean: clean-images clean-labels
	rm data/sample.txt
