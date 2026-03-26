#!/bin/sh
set -e

echo "=== Starting Nexera Backend ==="

# Cache config and routes (don't fail if these have issues)
echo "Caching configuration..."
php artisan config:cache 2>/dev/null || echo "Config cache skipped"
php artisan route:cache 2>/dev/null || echo "Route cache skipped"
php artisan view:cache 2>/dev/null || echo "View cache skipped"

# Run migrations (with retry)
echo "Running migrations..."
for i in 1 2 3; do
    php artisan migrate --force 2>&1 && echo "Migrations done!" && break
    echo "Migration attempt $i failed, retrying in 5s..."
    sleep 5
done

echo "Starting supervisor (nginx + php-fpm + queue worker)..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
