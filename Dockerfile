FROM php:8.4-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    curl \
    libpq-dev \
    libzip-dev \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    git \
    icu-dev \
    oniguruma-dev \
    freetype-dev \
    libjpeg-turbo-dev \
    zlib-dev \
    linux-headers \
    $PHPIZE_DEPS

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install \
        pdo \
        pdo_pgsql \
        pdo_mysql \
        pgsql \
        mbstring \
        zip \
        intl \
        bcmath \
        opcache \
        gd \
        pcntl \
    && pecl install redis \
    && docker-php-ext-enable redis

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Create app directory
WORKDIR /var/www/html

# Copy entire application (including composer.json/lock)
COPY . .

# Composer install
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Set permissions
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Expose port (Railway convention)
EXPOSE 8000

# Start artisan serve
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
