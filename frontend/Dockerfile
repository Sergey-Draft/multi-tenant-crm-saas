FROM node:20-slim AS base

WORKDIR /app
RUN corepack enable

FROM base AS deps
ENV YARN_NETWORK_TIMEOUT=600000
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 600000

FROM deps AS build
COPY . .
ARG NEXT_PUBLIC_API_URL=/api
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN yarn build

FROM base AS runtime
ENV NODE_ENV=production
ENV YARN_NETWORK_TIMEOUT=600000
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production --network-timeout 600000
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.ts ./next.config.ts

EXPOSE 3000
CMD ["yarn", "start", "-p", "3000"]
