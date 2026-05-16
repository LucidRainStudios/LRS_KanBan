FROM node:24-alpine AS server-dependencies

WORKDIR /app

COPY server/package.json server/pnpm-lock.yaml ./

RUN npm install npm@latest --global
RUN npm install pnpm --global

RUN pnpm config set fetch-retries 10
RUN pnpm config set fetch-retry-factor 2
RUN pnpm config set fetch-retry-mintimeout 20000
RUN pnpm config set fetch-retry-maxtimeout 300000
RUN pnpm config set registry https://registry.npmjs.org/

RUN echo "onlyBuiltDependencies:\n  - bcrypt\n  - sharp" > pnpm-workspace.yaml

RUN pnpm install --prod --frozen-lockfile

FROM node:24-alpine AS client

WORKDIR /app

COPY client/package.json client/pnpm-lock.yaml ./

RUN npm install npm@latest --global
RUN npm install pnpm --global
RUN pnpm config set fetch-retries 10
RUN pnpm config set fetch-retry-factor 2
RUN pnpm config set fetch-retry-mintimeout 20000
RUN pnpm config set fetch-retry-maxtimeout 300000
RUN pnpm config set registry https://registry.npmjs.org/
RUN pnpm install --prod --frozen-lockfile --ignore-scripts=false

COPY client .
ENV NODE_OPTIONS="--max_old_space_size=2048"
ENV GENERATE_SOURCEMAP=false
RUN DISABLE_ESLINT_PLUGIN=true npm run build

FROM node:24-alpine

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
