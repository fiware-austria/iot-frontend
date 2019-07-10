FROM node:12.5.0-alpine

WORKDIR /sensors

COPY client ./client
COPY server ./server
COPY package*.json preprocessor.js angular.json proxy.conf.json tsconfig.json tslint.json ./
COPY .env-k8s ./.env

RUN npm install && npm run predev && npm run buildprod

ENTRYPOINT ["node", "dist/server/server.js"]
