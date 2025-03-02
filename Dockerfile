# Этап сборки
FROM node:18-alpine AS build

WORKDIR /app

# Копируем только package.json и package-lock.json для кэширования слоя установки зависимостей
COPY package*.json ./

# Устанавливаем зависимости с флагами для обхода проблем совместимости
RUN npm install --no-package-lock --force

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Этап продакшена - используем легковесный nginx
FROM nginx:alpine

# Копируем собранное приложение из предыдущего этапа
COPY --from=build /app/build /usr/share/nginx/html

# Копируем конфигурацию NGINX
COPY ./default.conf /etc/nginx/nginx.conf

# Удаляем дефолтную конфигурацию nginx
RUN rm -f /etc/nginx/conf.d/default.conf

# Устанавливаем рабочую директорию
WORKDIR /usr/share/nginx/html

# Оптимизируем образ, удаляя ненужные пакеты
RUN rm -rf /var/cache/apk/* && \
    rm -rf /tmp/*

EXPOSE 80

# Запускаем nginx в foreground режиме
CMD ["nginx", "-g", "daemon off;"]