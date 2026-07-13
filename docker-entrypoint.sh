#!/bin/sh
set -e

echo "Application des migrations Prisma..."
npx prisma migrate deploy

echo "Demarrage de l'application..."
exec "$@"
