FROM node:16.13.0

ARG BASE_DIR="frontend"

WORKDIR /app

COPY ${BASE_DIR}/package*.json ./

RUN npm install

COPY ${BASE_DIR}/. .

CMD ["npm", "run", "start"]