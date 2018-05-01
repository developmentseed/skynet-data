# skynet-data

A pipeline to simplify building a set of training data for aerial-imagery- and
OpenStreetMap- based machine learning.  The idea is to use [OSM QA
Tiles](https://osmlab.github.io/osm-qa-tiles/) to generate "ground truth"
images where each color represents some category derived from OSM features.
Being map tiles, it's then pretty easy to match these up with the desired input
imagery.

 - OSM QA tile data
   [copyright OpenStreetMap contributors](http://www.openstreetmap.org/copyright)
   and licensed under
   [ODbL](http://opendatacommons.org/licenses/odbl/)
 - Mapbox Satellite data can be
   [traced for noncommercial purposes](https://www.mapbox.com/tos/#[YmtMIywt]).

## Quick Start

### Pre-built docker image

The easiest way to use this is via the
[`developmentseed/skynet-data` docker image](https://hub.docker.com/r/developmentseed/skynet-data):

First, create a `docker.env` file with the contents including your MapboxAccessToken:

```
MapboxAccessToken=YOUR_TOKEN
```

Then run:

```sh
docker run -v /path/to/output/dir:/workdir/data --env-file docker.env developmentseed/skynet-data download-osm-tiles

docker run -v /path/to/output/dir:/workdir/data --env-file docker.env developmentseed/skynet-data
```

The first line downloads the OSM QA tiles to
`/path/to/output/dir/osm/planet.mbtiles`.  If you've already got that
file on your machine, you can skip this.

The second builds a training set using the default options (Roads
features from OSM QA tiles, images from Mapbox Satellite).  To change
the data sources, training set size and other options, add the
relevant environment variables to the `docker.env` file , one per
line.

### Local docker image

You can also create the docker images yourself using
docker-compose. Similarly to the quick-start above, make sure your
`docker.env` file has your MapboxAccessToken and any other environment
variables you want to set. Then run:

```
docker-compose build
```

to build your local docker image, and

```
docker-compose run data download-osm-tiles
docker-compose run data
```

to download the OSM QA tiles, and run the data collection as specified
in `docker.env`. By default the collected data will be saved into the
`data` directory, but you can overide it by using `-v
/path/to/output/dir:/workdir/data` after `docker-compose run data`
similar to the pre-built instructions above.

## Variables

The `make` commands below work off the following variables (with
defaults as listed):

```
# location of image files
IMAGE_TILES ?= "tilejson+https://a.tiles.mapbox.com/v4/mapbox.satellite.json?access_token=$(MapboxAccessToken)"
# which osm-qa tiles extract to download; e.g. united_states_of_america
QA_TILES=planet
# location of data tiles to use for rendering labels; defaults to osm-qa tiles extract specified by QA_TILES
DATA_TILES ?= mbtiles://./data/osm/$(QA_TILES).mbtiles
# filter to this bbox
BBOX ?= '-180,-85,180,85'
# number of images (tiles) to sample
TRAIN_SIZE=1000
# define label classes output
CLASSES=classes/roads-buildings.json
# Filter out tiles whose ratio of labeled to unlabeled pixels is less than or
# equal to the given ratio.  Useful for excluding images that are all background, for example.
LABEL_RATIO ?= 0
# set this to a zoom higher than the data tiles' max zoom to get overzoomed label images
ZOOM_LEVEL ?= 17
```

You can override any of these parameters in your `docker.env` and make
a full training set using the instructions above.

## Details

### Install

 - Install [NodeJS v4.6.2](https://nodejs.org/dist/v4.6.2/)
 - Install [GNU Parallel](https://www.gnu.org/software/parallel/)
 - Install [shuf](https://www.gnu.org/software/coreutils/)
 - Clone this repo and run `npm install`.  (Note that this includes a
   node-mapnik install, which sometimes has trouble building in bleeding-edge
   versions of node.)

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
access token>&prefix=/path/to/data` in a local web server.
