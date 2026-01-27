#!/bin/sh
set -e

echo "📁 🔄 Copie des images de référence dans le dossier partagé..."

# Copier récursivement, écraser uniquement si le fichier source est plus récent
cp -ru /srv/assets/default-images/. /srv/api/public/images/

echo "✅ Copie des images terminée."

# 💡 Extraction du host et port depuis DATABASE_URL
# Format: postgresql://user:password@host:port/database?...
DB_HOST=$(echo $DATABASE_URL | sed -E 's|.*@([^:/]+).*|\1|')
DB_PORT=$(echo $DATABASE_URL | sed -E 's|.*:([0-9]+)/.*|\1|')
DB_NAME=$(echo $DATABASE_URL | sed -E 's|.*/([^?]+).*|\1|')

# Valeurs par défaut si extraction échoue
DB_HOST=${DB_HOST:-database}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-app}

echo "⏳ Attente que PostgreSQL soit disponible sur $DB_HOST:$DB_PORT..."

# Test de connexion avec psql (supporte SSL)
MAX_RETRIES=30
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if PGPASSWORD="$POSTGRES_PASSWORD" PGSSLMODE=require psql -h "$DB_HOST" -p "$DB_PORT" -U "$POSTGRES_USER" -d "$DB_NAME" -c "SELECT 1" > /dev/null 2>&1; then
    break
  fi
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "  Tentative $RETRY_COUNT/$MAX_RETRIES..."
  sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "❌ Impossible de se connecter à PostgreSQL après $MAX_RETRIES tentatives"
  exit 1
fi

echo "✅ PostgreSQL est prêt."

# ⚙️ Exécuter les migrations
echo "📦 Lancement des migrations Doctrine..."
php bin/console doctrine:migrations:migrate --no-interaction

# 🌱 Initialiser les données si la base est vide
echo "🌱 Initialisation des données de référence..."
php bin/console app:data:initialize

echo "✅ Données initialisées. Lancement de FrankenPHP..."

# 🚀 Démarrage de FrankenPHP
exec frankenphp run --config /etc/caddy/Caddyfile
