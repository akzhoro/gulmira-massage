# Используем легкий образ Nginx
FROM nginx:alpine

# Копируем все файлы вашего проекта в папку, которую обслуживает Nginx
COPY . /usr/share/nginx/html

# Открываем 80 порт
EXPOSE 80

# Запускаем сервер
CMD ["nginx", "-g", "daemon off;"]