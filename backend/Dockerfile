FROM node:20-slim AS base

WORKDIR /app

# OpenSSL нужен Prisma runtime.
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable

FROM base AS deps
# На VM из GCP иногда долгий ответ registry.npmjs.org — увеличиваем таймаут
ENV YARN_NETWORK_TIMEOUT=600000
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 600000

FROM deps AS build
COPY . .
RUN npx prisma generate
RUN yarn build

FROM base AS runtime
ENV NODE_ENV=production
ENV YARN_NETWORK_TIMEOUT=600000
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production --network-timeout 600000
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3001
ENTRYPOINT ["/docker-entrypoint.sh"]