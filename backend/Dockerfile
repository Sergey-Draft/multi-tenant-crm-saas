FROM node:20-slim

WORKDIR /app

# OpenSSL нужен для Prisma (подключение к БД, миграции)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

RUN corepack enable

# Копируем только файлы зависимостей для кэша слоёв
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

RUN npx prisma generate

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

EXPOSE 3000
CMD ["yarn", "start:dev"]