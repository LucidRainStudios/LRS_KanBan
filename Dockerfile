FROM node:22-alpine AS server-dependencies

WORKDIR /app

COPY server/package.json server/package-lock.json ./

RUN npm install npm@latest --global
RUN npm install pnpm --global
RUN pnpm import
RUN pnpm install --prod

FROM node:22-alpine AS client

WORKDIR /app

COPY client/package.json client/package-lock.json ./

RUN npm install npm@latest --global
RUN npm install pnpm --global
RUN pnpm import
RUN pnpm install --prod

COPY client .
ENV NODE_OPTIONS="--max_old_space_size=2048"
ENV GENERATE_SOURCEMAP=false
RUN DISABLE_ESLINT_PLUGIN=true npm run build

FROM node:22-alpine

RUN apk -U upgrade
RUN apk add bash --no-cache

USER node
WORKDIR /app

COPY --chown=node:node --chmod=775 start.sh .
COPY --chown=node:node server .

RUN mv .env.sample .env

COPY --from=server-dependencies --chown=node:node /app/node_modules node_modules

COPY --from=client --chown=node:node /app/build public
COPY --from=client --chown=node:node /app/build/index.html views/index.ejs

VOLUME /app/public/user-avatars
VOLUME /app/public/project-background-images
VOLUME /app/private/attachments

HEALTHCHECK --interval=1s --timeout=5s --start-period=8s --retries=50 CMD wget -q --spider http://localhost:1337 || exit 1
EXPOSE 1337
CMD ["./start.sh"]
