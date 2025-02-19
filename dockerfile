FROM node:18-alpine

# Установка необходимых пакетов для компиляции
RUN apk add --no-cache python3 g++ make bash

WORKDIR /app

# Копируем package.json и yarn.lock для кеширования зависимостей
COPY package.json yarn.lock ./
RUN yarn install --production

# Копируем остальные файлы после установки зависимостей
COPY . .

# Открываем порт
EXPOSE 3000

CMD ["node", "src/index.js"]
