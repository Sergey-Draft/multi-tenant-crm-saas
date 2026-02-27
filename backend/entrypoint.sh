#!/bin/sh
set -e
# При монтировании тома node_modules может быть пустым — ставим зависимости при первом запуске
if [ ! -f node_modules/.bin/nest ]; then
  echo "Installing dependencies..."
  yarn install
fi
if [ ! -d node_modules/.prisma/client ] && [ -f node_modules/.bin/prisma ]; then
  echo "Generating Prisma client..."
  yarn prisma generate
fi
exec "$@"
