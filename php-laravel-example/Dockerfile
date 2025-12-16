FROM php:8.2-apache

ENV APACHE_DOCUMENT_ROOT=/var/www/html/public

RUN apt-get update && \
    apt-get install -y git unzip libzip-dev curl && \
    docker-php-ext-install pdo pdo_mysql zip && \
    a2enmod rewrite && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Create a fresh Laravel app
RUN composer create-project laravel/laravel .

# Override route and view for the Out Plane test UI
COPY routes/web.php routes/web.php
COPY resources/views/welcome.blade.php resources/views/welcome.blade.php

# Prepare app key and ownership
RUN cp .env.example .env && \
    php artisan key:generate && \
    chown -R www-data:www-data /var/www/html

# Point Apache to the Laravel public directory and listen on 8080
RUN sed -ri "s/80/8080/g" /etc/apache2/ports.conf && \
    sed -ri "s/:80>/:8080>/" /etc/apache2/sites-available/000-default.conf && \
    sed -ri "s#DocumentRoot /var/www/html#DocumentRoot ${APACHE_DOCUMENT_ROOT}#g" /etc/apache2/sites-available/000-default.conf

EXPOSE 8080

CMD ["apache2-foreground"]
