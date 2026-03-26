FROM php:8.4-fpm-alpine

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
    supervisor \
    dos2unix

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

# Complete composer install (ignore post-autoload failures - no .env at build time)
RUN composer dump-autoload --optimize

# Copy configs and fix CRLF line endings (Windows -> Linux)
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/php.ini /usr/local/etc/php/conf.d/custom.ini
COPY docker/start.sh /start.sh
RUN dos2unix /start.sh /etc/nginx/http.d/default.conf /etc/supervisor/conf.d/supervisord.conf \
    && chmod +x /start.sh

# Set permissions
RUN mkdir -p /var/log/supervisor /var/www/html/storage/logs \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Expose port 8080 (Railway default)
EXPOSE 8080

# Start via entrypoint script
CMD ["/start.sh"]
