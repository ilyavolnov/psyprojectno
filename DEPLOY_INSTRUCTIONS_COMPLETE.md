# Инструкция по деплою проекта на VPS с SSL

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
(Здесь вы копируете все файлы из своего проекта, кроме backend/)

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

### Копирование конфигурации
```bash
sudo cp /path/to/psyproject/nginx_config_ssl_setup.txt /etc/nginx/sites-available/psyproject
sudo ln -s /etc/nginx/sites-available/psyproject /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Удаление стандартного сайта
```

### Тестирование конфигурации
```bash
sudo nginx -t
```

### Перезапуск Nginx
```bash
sudo systemctl restart nginx
```

## 5. Получение SSL сертификата

### Получение сертификата через Let's Encrypt
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Certbot автоматически обновит вашу конфигурацию Nginx, добавив пути к SSL сертификатам и настроив HTTPS.

## 6. Настройка API и CORS для продакшена

### Обновите CORS настройки в бэкенде
В файле `/var/www/psyproject-backend/server.js` убедитесь, что CORS настроен с учетом вашего домена:

```javascript
app.use(cors({
    origin: [
        'https://your-domain.com',    // Замените на ваш основной домен
        'https://www.your-domain.com' // Замените на www версию домена
    ],
    credentials: true
}));
```

Это позволит вашему фронтенду на `https://your-domain.com` делать запросы к `/api` на том же домене.

## 7. Проверка API проксирования

После настройки SSL и CORS, убедитесь, что API запросы корректно проксируются:

### Проверьте, что бэкенд запущен
```bash
pm2 status
```

### Проверьте, что Nginx проксирует /api запросы
```bash
# Прямой запрос к бэкенду (должен работать)
curl http://localhost:3001/api/health

# Запрос через Nginx (должен работать)
curl https://your-domain.com/api/health
```

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

## 10. Тестирование после деплоя

### Проверки после деплоя
1. Открытие главной страницы: `https://your-domain.com`
2. Загрузка курсов, специалистов, супервизий
3. Отправка заявки и проверка сохранения в админке
4. Работа админ-панели: `https://your-domain.com/admin-login.html`

Если все работает, значит, деплой прошел успешно и API корректно проксируется через Nginx!