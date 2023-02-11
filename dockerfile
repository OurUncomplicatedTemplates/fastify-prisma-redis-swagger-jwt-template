FROM node:19 AS base
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

FROM base AS prod
COPY package.json /usr/src/app/
RUN npm install
COPY . /usr/src/app
RUN npx prisma generate
RUN npx prisma migrate deploy
ENV HOST 0.0.0.0
CMD [ "npm", "run", "start" ]

# A volume mounting this directory
# to the containers "/usr/src/app" directory
# should be setup for the dev tag to work
FROM base AS dev
ENV HOST 0.0.0.0
CMD /bin/bash -c 'npm install; npx prisma generate; npm run dev'