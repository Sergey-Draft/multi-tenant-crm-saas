#!/bin/sh
set -e
# При монтировании тома node_modules может быть пустым или устаревшим — ставим зависимости при необходимости
if [ ! -f node_modules/.bin/nest ] || [ ! -d node_modules/class-validator ] || [ ! -d node_modules/@prisma/adapter-pg ]; then
  echo "Installing dependencies..."
  yarn install
fi
if [ ! -d node_modules/.prisma/client ] && [ -f node_modules/.bin/prisma ]; then
  echo "Generating Prisma client..."
  yarn prisma generate
fi
exec "$@"
