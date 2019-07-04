FROM node:12.5.0-alpine

WORKDIR /sensors

COPY client ./
COPY server ./
COPY package*.json preprocessor.js proxy.conf.json tsconfig.json tslint.json ./
COPY .env-k8s ./.env

RUN npm install

ENTRYPOINT ["npm", "run", "prod"]
