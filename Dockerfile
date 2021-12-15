FROM latonaio/l4t-ds-ffmpeg-7.2-jetpack-4.4:latest

ENV POSITION=UI \
    SERVICE=ui-backend-for-famanager \
    AION_HOME=/var/lib/aion \
    NODE_ENV=production \
    LD_LIBRARY_PATH=/usr/local/cuda-10.2/targets/aarch64-linux/lib

ENV NODE_VERSION=16.x
RUN set -xe; \
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add -; \
    echo "deb https://deb.nodesource.com/node_${NODE_VERSION} bionic main" | tee /etc/apt/sources.list.d/nodesource.list; \
    echo "deb-src https://deb.nodesource.com/node_${NODE_VERSION} bionic main" | tee -a /etc/apt/sources.list.d/nodesource.list;

RUN apt-get update \
    && apt-get -y --no-install-recommends install \
    nodejs \
    wget \
    gnupg \
    tzdata

RUN apt-get clean; rm -rf /var/lib/apt/lists/*;

RUN npm install --global yarn

RUN mkdir -p ${AION_HOME}/$POSITION/$SERVICE

WORKDIR ${AION_HOME}/$POSITION/$SERVICE

EXPOSE 8080

ADD package.json .
RUN yarn
ADD . .

# WORKDIR ${AION_HOME}/$POSITION/$SERVICE/sub/node-rtsp-stream
# RUN yarn

# WORKDIR ${AION_HOME}/$POSITION/$SERVICE

RUN yarn build

CMD ["yarn","start"]
