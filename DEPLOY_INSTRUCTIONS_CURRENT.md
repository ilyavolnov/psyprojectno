# Инструкция по деплою проекта на VPS

## 1. Подготовка сервера

### Обновление системы
```bash
sudo apt update && sudo apt upgrade -y
```

### Установка необходимых пакетов
```bash
sudo apt install nginx nodejs npm certbot python3-certbot-nginx pm2 -y
```

## 2. Размещение файлов проекта

### Создание директории для проекта
```bash
sudo mkdir -p /var/www/psyproject
sudo chown $USER:$USER /var/www/psyproject
```

### Копирование файлов проекта в /var/www/psyproject
(Скопируйте все файлы из вашего проекта, кроме backend/)

## 3. Настройка Node.js бэкенда

### Перенос backend папки
```bash
sudo mkdir -p /var/www/psyproject-backend
sudo cp -r /path/to/your/project/backend/* /var/www/psyproject-backend/
cd /var/www/psyproject-backend
npm install
```

### Создание файла .env для бэкенда
```bash
sudo nano /var/www/psyproject-backend/.env
```

Содержимое .env:
```
PORT=3001
NODE_ENV=production
# Добавьте другие переменные окружения, если есть
```

### Настройка PM2 для запуска бэкенда
```bash
pm2 start /var/www/psyproject-backend/server.js --name "psyproject-backend"
pm2 startup
pm2 save
```

## 4. Настройка Nginx

### Создание конфигурации Nginx
```bash
sudo nano /etc/nginx/sites-available/psyproject
```

Содержимое конфигурации:
```
server {
    listen 80;
    server_name your-domain.com www.your-domain.com; # Замените на ваш домен

    # Перенаправление на HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com; # Замените на ваш домен

    # SSL сертификаты будут добавлены Certbot'ом автоматически
    # ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Настройки SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Заголовки безопасности
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

    # Основной root для статических файлов
    root /var/www/psyproject;
    index index.html index.htm;

    # Проксирование API запросов к Node.js бэкенду
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
    }

    # Обработка статических файлов
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri $uri/ =404;
    }

    # Все остальные запросы - обслуживание статических файлов
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Настройки логов
    access_log /var/log/nginx/psyproject_access.log;
    error_log /var/log/nginx/psyproject_error.log;
}
```

### Активация сайта
```bash
sudo ln -s /etc/nginx/sites-available/psyproject /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Удаление стандартного сайта
sudo nginx -t  # Проверка конфигурации
sudo systemctl restart nginx
```

## 5. Получение SSL сертификата

### Получение сертификата через Let's Encrypt
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 6. Проверка API и CORS

### Проверьте, что бэкенд настроен на CORS
В файле `/var/www/psyproject-backend/server.js` убедитесь, что CORS настроен:

```javascript
app.use(cors({
    origin: [
        'https://your-domain.com',    // Замените на ваш основной домен
        'https://www.your-domain.com' // Замените на www версию домена
    ],
    credentials: true
}));
```

## 7. Проверка после деплоя

### Проверки после деплоя
1. Открытие главной страницы: `https://your-domain.com`
2. Загрузка курсов, специалистов, супервизий
3. Отправка заявки и проверка сохранения в админке
4. Работа админ-панели: `https://your-domain.com/admin-login.html`

## 8. Мониторинг и логи

### Проверка состояния сервисов
```bash
pm2 status
sudo systemctl status nginx
```

### Просмотр логов
```bash
# Nginx логи
sudo tail -f /var/log/nginx/psyproject_access.log
sudo tail -f /var/log/nginx/psyproject_error.log

# PM2 логи
pm2 logs psyproject-backend
```

## 9. Резервное копирование

### Создание скрипта резервного копирования базы данных
```bash
sudo nano /var/www/psyproject-backend/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/www/psyproject-backend/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_PATH="/var/www/psyproject-backend/database.sqlite"

mkdir -p $BACKUP_DIR
cp $DB_PATH $BACKUP_DIR/database_$DATE.sqlite
find $BACKUP_DIR -name "database_*.sqlite" -mtime +7 -delete  # Удаление бэкапов старше 7 дней
```

```bash
chmod +x /var/www/psyproject-backend/backup-db.sh
```

### Добавление в cron для регулярного бэкапа
```bash
crontab -e
# Добавьте строку для ежедневного бэкапа в 2 часа ночи:
0 2 * * * /var/www/psyproject-backend/backup-db.sh
```