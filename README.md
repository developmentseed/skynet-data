# skynet-data

A pipeline to simplify building a set of training data for aerial-imagery- and
OpenStreetMap- based machine learning.  The idea is to use [OSM QA
Tiles](https://osmlab.github.io/osm-qa-tiles/) to generate "ground truth"
images where each color represents some category derived from OSM features.
Being map tiles, it's then pretty easy to match these up with the desired input
imagery.

 - OSM QA tile data [copyright OpenStreetMap contributors](http://www.openstreetmap.org/copyright) and licensed under [ODbL](http://opendatacommons.org/licenses/odbl/)
 - Mapbox Satellite data can be [traced for noncommercial purposes](https://www.mapbox.com/tos/#[YmtMIywt]).

## Install

 - Install [tippecanoe](https://github.com/mapbox/tippecanoe)
 - Clone this repo and `npm install`

## Use

The `make` commands below work off the following variables (with defaults as
listed):

```
# location of image files
IMAGE_TILES ?= "tilejson+https://a.tiles.mapbox.com/v4/mapbox.satellite.json?access_token=$(MapboxAccessToken)"
# which osm-qa tiles extract to download; e.g. united_states_of_america
QA_TILES=planet
# number of images (tiles) to sample
TRAIN_SIZE=1000
# define label classes output
CLASSES=classes/water-roads-buildings.json
```

### Sample available tiles

`make data/sample.txt`

This just does a simple random sample of the available tiles in the given
`mbtiles` set, using `tippecanoe-enumerate`. For more intelligent filtering,
consider using `tippecanoe-decode` to examine (geojson) contents of each tile.

### Labels

Build label images: `make data/labels/color` or `make data/labels/grayscale`.
Uses the `CLASSES` json file to set up the rendering of OSM data to images that
represent per-pixel category labels.  See `classes/water-roads-buildings.json`
for an example.  Rendering is with `mapnik`; see [the
docs](https://github.com/mapnik/mapnik/wiki/Filter) for more on `filter`
syntax.

### Images

Download aerial images from a tiled source: `make data/images`

Heads up: the default, Mapbox Satellite, will need you to set the
`MapboxAccessToken` variable, and will cost you map views!

### Preview

Preview the generated data by opening up `preview.html?accessToken=<mapbox
access token>` in a local web server.

