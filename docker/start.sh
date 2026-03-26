#!/bin/sh
# No set -e: we want supervisord to ALWAYS start regardless of artisan failures

echo "=== Starting Nexera Backend ==="

# Cache config and routes (ignore failures - env vars may not all be available at build time)
php artisan config:cache 2>/dev/null || echo "[warn] config:cache skipped"
php artisan route:cache 2>/dev/null  || echo "[warn] route:cache skipped"
php artisan view:cache 2>/dev/null   || echo "[warn] view:cache skipped"

# Run migrations with retry (use if-statement so set -e doesn't fire)
echo "Running migrations..."
MIGRATED=0
for i in 1 2 3; do
    if php artisan migrate --force 2>&1; then
        echo "[ok] Migrations completed on attempt $i"
        MIGRATED=1
        break
    fi
    echo "[warn] Migration attempt $i/3 failed, retrying in 5s..."
    sleep 5
done

if [ "$MIGRATED" = "0" ]; then
    echo "[warn] Migrations failed after 3 attempts - starting anyway"
fi

echo "Starting supervisord (nginx + php-fpm + queue)..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
