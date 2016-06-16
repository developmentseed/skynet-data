
QA_TILES ?= planet
DATA_TILES ?= data/osm/$(QA_TILES).mbtiles
BBOX ?= '-180,-85,180,85'
IMAGE_TILES ?= "tilejson+https://a.tiles.mapbox.com/v4/mapbox.satellite.json?access_token=$(MapboxAccessToken)"
TRAIN_SIZE ?= 1000
CLASSES ?= classes/water-roads-buildings.json
LABEL_RATIO ?= 0
ZOOM_LEVEL ?= ''

# Download OSM QA tiles
data/osm/planet.mbtiles:
	mkdir -p $(dir $@)
	curl https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.planet.mbtiles.gz | gunzip > $@

data/osm/%.mbtiles:
	mkdir -p $(dir $@)
	curl https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.country/$(notdir $@).gz | gunzip > $@

# Make a list of all the tiles within BBOX
data/all_tiles.txt: $(DATA_TILES)
	tippecanoe-enumerate $^ | node lib/read-sample.js --bbox='$(BBOX)' > $@

# Make a random sample from all_tiles.txt of TRAIN_SIZE tiles, possibly
# 'overzooming' them to zoom=ZOOM_LEVEL
data/sample.txt: data/all_tiles.txt
	./sample $^ $(TRAIN_SIZE) $(ZOOM_LEVEL) > $@

# Rasterize the data tiles to bitmaps where each pixel is colored according to
# the class defined in CLASSES
# (no class / background => black)
data/labels/color: data/sample.txt
	mkdir -p $@
	cp $(CLASSES) data/labels
	cat data/sample.txt | \
	  parallel --pipe --block 10K './rasterize-labels $(DATA_TILES) $(CLASSES) $@'

data/labels/label-counts.txt: data/labels/color data/sample.txt
	cat data/sample.txt | \
		parallel --pipe --block 10K --group './label-counts $(CLASSES) data/labels/color' > $@

data/labels/label-stats.csv: data/labels/label-counts.txt
	cat data/labels/label-counts.txt | ./label-stats > $@

# Once we've generated label bitmaps, we can make a version of the original sample
# filtered to tiles with the ratio (pixels with non-background label)/(total pixels)
# above the LABEL_RATIO threshold
data/sample-filtered.txt: data/labels/label-counts.txt
	cat $^ | node lib/read-sample.js --label-ratio $(LABEL_RATIO) > $@

data/labels/grayscale: data/sample-filtered.txt
	mkdir -p $@
	cat $^ | \
		cut -d' ' -f2,3,4 | sed 's/ /-/g' | \
		parallel 'cat data/labels/color/{}.png | ./palette-to-grayscale $(CLASSES) > $@/{}.png'

data/images: data/sample-filtered.txt
	mkdir -p $@
	cat data/sample-filtered.txt | ./download-images $(IMAGE_TILES) $@

.PHONY: prune-labels
prune-labels: data/sample-filtered.txt
	cat data/sample-filtered.txt | \
		cut -d' ' -f2,3,4 | sed 's/ /-/g' > data/labels/color/include.txt
	find data/labels/color -name *.png | grep -Fvf data/labels/color/include.txt | xargs rm
	rm data/labels/color/include.txt
	touch data/labels/label-counts.txt
	touch data/sample-filtered.txt

# Make train & val lists, with 80% of data -> train, 20% -> val
data/train.txt: data/sample-filtered.txt data/labels/grayscale data/images
	cat data/sample-filtered.txt | \
		./slice --start 0 \
			--end $$(($$(cat data/sample-filtered.txt | wc -l) * 4 / 5)) \
			--labels $$(cd data && pwd -P)/labels/grayscale \
			--images $$(cd data && pwd -P)/images > $@

data/val.txt: data/sample-filtered.txt data/labels/grayscale data/images
	cat data/sample-filtered.txt | \
		./slice \
			--start $$(($$(cat data/sample-filtered.txt | wc -l) * 4 / 5)) \
			--end Infinity \
			--labels $$(cd data && pwd -P)/labels/grayscale \
			--images $$(cd data && pwd -P)/images > $@

.PHONY: clean-labels clean-images clean
clean-labels:
	rm -rf data/labels
clean-images:
	rm -rf data/images
clean: clean-images clean-labels
	rm data/sample.txt
