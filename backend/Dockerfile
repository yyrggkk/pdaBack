FROM composer:2 AS vendor

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-interaction \
    --no-progress \
    --prefer-dist \
    --optimize-autoloader

FROM php:8.3-cli-alpine

WORKDIR /var/www/html

RUN apk add --no-cache bash icu-libs libpq libzip oniguruma unzip \
    && apk add --no-cache --virtual .build-deps $PHPIZE_DEPS icu-dev libzip-dev postgresql-dev oniguruma-dev \
    && docker-php-ext-install pdo_pgsql mbstring bcmath intl zip \
    && apk del .build-deps

COPY . .
COPY --from=vendor /app/vendor ./vendor

RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R ug+rw storage bootstrap/cache

ENV APP_ENV=production
ENV PORT=10000
ENV RUN_SEEDERS=false

EXPOSE 10000

CMD ["sh", "-c", "php artisan migrate --force && if [ \"${RUN_SEEDERS}\" = \"true\" ]; then php artisan db:seed --force; fi && php artisan serve --host=0.0.0.0 --port=${PORT:-10000}"]
