FROM node:16-alpine

LABEL org.opencontainers.image.source="https://github.com/itemizentnu/halloween-2022"

COPY ./chall /app

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH
ENV PORT 8080

RUN npm install --silent

CMD ["npm", "run", "start"]