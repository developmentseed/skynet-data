FROM node:5
ENV NPM_CONFIG_LOGLEVEL warn

# Get tippecanoe
RUN apt-get install -y libsqlite3-dev && git clone https://github.com/mapbox/tippecanoe.git && cd tippecanoe && make && make install

WORKDIR /workdir
ADD package.json /workdir/package.json
RUN npm install

ADD . /workdir

ENTRYPOINT /bin/bash
