#!/bin/sh
# Nexera Backend Startup Script
# No set -e: supervisord MUST always start

echo "=== Starting Nexera Backend ==="

# Create .env from environment variables (needed for artisan commands)
echo "APP_KEY=${APP_KEY}" > /var/www/html/.env
echo "APP_ENV=${APP_ENV:-production}" >> /var/www/html/.env
echo "APP_DEBUG=${APP_DEBUG:-false}" >> /var/www/html/.env

# Discover packages (was skipped during docker build due to missing .env)
php artisan package:discover --ansi 2>&1 || echo "[warn] package:discover failed"

# Cache config and routes
php artisan config:cache 2>&1 || echo "[warn] config:cache failed"
php artisan route:cache 2>&1 || echo "[warn] route:cache failed"

# Run migrations
echo "Running migrations..."
php artisan migrate --force 2>&1 || echo "[warn] migrations failed - continuing anyway"

# Create public storage symlink (needed for uploaded images)
php artisan storage:link --force 2>&1 || echo "[warn] storage:link failed - continuing anyway"

echo "Starting supervisord (nginx + php-fpm + queue)..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
