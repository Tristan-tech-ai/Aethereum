FROM php:8.3-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    curl \
    libpq-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    icu-dev \
    oniguruma-dev \
    freetype-dev \
    libjpeg-turbo-dev \
    libpng-dev \
    nginx \
    supervisor

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install \
        pdo \
        pdo_pgsql \
        pgsql \
        mbstring \
        zip \
        intl \
        bcmath \
        opcache \
        gd \
        pcntl

# Note: Redis extension removed - using database driver for queue/cache

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Create app directory
WORKDIR /var/www/html

# Copy composer files first for layer caching
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

# Copy entire application
COPY . .

# Complete composer install
RUN composer dump-autoload --optimize \
    && composer run-script post-autoload-dump 2>/dev/null || true

# Copy Nginx config
COPY docker/nginx.conf /etc/nginx/http.d/default.conf

# Copy Supervisor config
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy PHP config
COPY docker/php.ini /usr/local/etc/php/conf.d/custom.ini

# Set permissions
RUN mkdir -p /var/log/supervisor \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Expose port 8080 (Railway default)
EXPOSE 8080

# Start supervisor (Nginx + PHP-FPM + Queue Worker)
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
