#!/bin/sh
# =============================================================
# PAPSE — Entrypoint do Container Backend
#
# Executado automaticamente antes de iniciar o servidor Node.
# Garante que, em qualquer ambiente, as migrations e o admin
# inicial já existam ao subir o sistema pela primeira vez.
# =============================================================

set -e

echo "🔄 [ENTRYPOINT] Aplicando migrations do banco de dados..."
npx prisma migrate deploy

echo "🌱 [ENTRYPOINT] Executando seed do administrador inicial..."
npx tsx scripts/create-admin.ts

echo "🚀 [ENTRYPOINT] Iniciando servidor..."
exec npm run dev
