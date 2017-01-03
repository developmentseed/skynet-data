FROM ubuntu:16.04
ENV NPM_CONFIG_LOGLEVEL warn

# tippecanoe, parallel
RUN apt-get update && apt-get install -y curl git build-essential libsqlite3-dev zlib1g-dev && \
  git clone https://github.com/mapbox/tippecanoe.git && \
  cd tippecanoe && make && make install && \
  apt-get update && apt-get install -y parallel

# Node
RUN curl -sL https://deb.nodesource.com/setup_6.x | bash - && \
  apt-get install -y nodejs

# Bring in skynet-data
WORKDIR /workdir
ADD package.json /workdir/package.json
RUN npm install

ADD . /workdir

ENTRYPOINT ["make"]
CMD ["all"]
