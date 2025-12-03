# Деплой на VPS/Выделенный сервер

Инструкция по развертыванию проекта на Ubuntu/Debian сервере с Nginx и PM2.

## 📋 Требования

- Ubuntu 20.04+ или Debian 10+
- Root или sudo доступ
- Домен (опционально, но рекомендуется)

## 🚀 Шаг 1: Подготовка сервера

### 1.1 Обновление системы

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.2 Установка Node.js (v18+)

```bash
# Установка Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Проверка версии
node --version
npm --version
```

### 1.3 Установка PM2 (Process Manager)

```bash
sudo npm install -g pm2

# Автозапуск PM2 при перезагрузке
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
```

### 1.4 Установка Nginx

```bash
sudo apt install -y nginx

# Запуск и автозапуск
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 1.5 Установка Git

```bash
sudo apt install -y git
```

## 📦 Шаг 2: Клонирование проекта

```bash
# Создайте директорию для проектов
sudo mkdir -p /var/www
cd /var/www

# Клонируйте репозиторий
sudo git clone https://github.com/ilyavolnov/psyproject.git
cd psyproject

# Установите права
sudo chown -R $USER:$USER /var/www/psyproject
```

## ⚙️ Шаг 3: Настройка проекта

### 3.1 Установка зависимостей

```bash
npm install
```

### 3.2 Создание .env файла

```bash
cp .env.example .env
nano .env
```

Настройте переменные:

```env
# Server
PORT=3001
NODE_ENV=production

# Database
DATABASE_PATH=/var/www/psyproject/database.sqlite

# Telegram Bot (опционально)
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_ADMIN_ID=your_admin_id
TELEGRAM_ENABLED=false

# Security
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# PayKeeper (опционально)
PAYKEEPER_SERVER=
PAYKEEPER_SECRET=
```

### 3.3 Создание директории для загрузок

```bash
mkdir -p images/uploads
chmod 755 images/uploads
```

### 3.4 Инициализация базы данных

```bash
node backend/init-database.js
```

## 🔧 Шаг 4: Настройка PM2

### 4.1 Создание ecosystem файла

```bash
nano ecosystem.config.js
```

Добавьте:

```javascript
module.exports = {
  apps: [{
    name: 'psyproject-backend',
    script: './backend/server.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

### 4.2 Создание директории для логов

```bash
mkdir -p logs
```

### 4.3 Запуск приложения

```bash
# Запуск
pm2 start ecosystem.config.js

# Сохранение конфигурации
pm2 save

# Проверка статуса
pm2 status
pm2 logs psyproject-backend
```

### 4.4 Полезные команды PM2

```bash
# Перезапуск
pm2 restart psyproject-backend

# Остановка
pm2 stop psyproject-backend

# Просмотр логов
pm2 logs psyproject-backend

# Мониторинг
pm2 monit

# Список процессов
pm2 list
```

## 🌐 Шаг 5: Настройка Nginx

### 5.1 Создание конфигурации

```bash
sudo nano /etc/nginx/sites-available/psyproject
```

Добавьте конфигурацию:

```nginx
# HTTP -> HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Для Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/psyproject;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL сертификаты (настроим позже)
    # ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL настройки
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Корневая директория
    root /var/www/psyproject;
    index index.html;
    
    # Логи
    access_log /var/log/nginx/psyproject-access.log;
    error_log /var/log/nginx/psyproject-error.log;
    
    # Максимальный размер загружаемых файлов
    client_max_body_size 10M;
    
    # API проксирование
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Статические файлы
    location / {
        try_files $uri $uri/ /index.html;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }
    
    # Изображения
    location /images/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # CSS и JS
    location ~* \.(css|js)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
    
    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
```

### 5.2 Активация конфигурации

```bash
# Создание символической ссылки
sudo ln -s /etc/nginx/sites-available/psyproject /etc/nginx/sites-enabled/

# Удаление дефолтной конфигурации
sudo rm /etc/nginx/sites-enabled/default

# Проверка конфигурации
sudo nginx -t

# Перезапуск Nginx
sudo systemctl restart nginx
```

## 🔒 Шаг 6: Настройка SSL (Let's Encrypt)

### 6.1 Установка Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 6.2 Получение сертификата

```bash
# Замените yourdomain.com на ваш домен
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Следуйте инструкциям:
# - Введите email
# - Согласитесь с условиями
# - Выберите redirect на HTTPS (рекомендуется)
```

### 6.3 Автообновление сертификата

```bash
# Проверка автообновления
sudo certbot renew --dry-run

# Certbot автоматически добавит задачу в cron
```

### 6.4 Раскомментируйте SSL строки в Nginx

```bash
sudo nano /etc/nginx/sites-available/psyproject

# Раскомментируйте:
# ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
# ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

# Перезапустите Nginx
sudo systemctl restart nginx
```

## 🔥 Шаг 7: Настройка Firewall

```bash
# Установка UFW
sudo apt install -y ufw

# Разрешение SSH (ВАЖНО!)
sudo ufw allow OpenSSH

# Разрешение HTTP и HTTPS
sudo ufw allow 'Nginx Full'

# Включение firewall
sudo ufw enable

# Проверка статуса
sudo ufw status
```

## 📊 Шаг 8: Мониторинг и логи

### 8.1 Просмотр логов

```bash
# PM2 логи
pm2 logs psyproject-backend

# Nginx логи
sudo tail -f /var/log/nginx/psyproject-access.log
sudo tail -f /var/log/nginx/psyproject-error.log

# Системные логи
sudo journalctl -u nginx -f
```

### 8.2 Мониторинг ресурсов

```bash
# PM2 мониторинг
pm2 monit

# Системные ресурсы
htop
```

## 🔄 Шаг 9: Обновление проекта

Создайте скрипт для обновления:

```bash
nano /var/www/psyproject/update.sh
```

Добавьте:

```bash
#!/bin/bash

echo "🔄 Updating project..."

# Переход в директорию проекта
cd /var/www/psyproject

# Сохранение изменений (если есть)
git stash

# Получение обновлений
git pull origin main

# Восстановление изменений
git stash pop

# Установка зависимостей
npm install

# Перезапуск приложения
pm2 restart psyproject-backend

echo "✅ Update complete!"
```

Сделайте скрипт исполняемым:

```bash
chmod +x /var/www/psyproject/update.sh
```

Использование:

```bash
./update.sh
```

## 🔐 Шаг 10: Безопасность

### 10.1 Изменение пароля админа

1. Откройте https://yourdomain.com/admin-login.html
2. Войдите (admin / admin123)
3. Настройки → Безопасность → Смените пароль

### 10.2 Настройка fail2ban (защита от брутфорса)

```bash
sudo apt install -y fail2ban

# Создание конфигурации
sudo nano /etc/fail2ban/jail.local
```

Добавьте:

```ini
[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/psyproject-error.log

[nginx-noscript]
enabled = true
port = http,https
logpath = /var/log/nginx/psyproject-access.log
```

Перезапустите:

```bash
sudo systemctl restart fail2ban
sudo fail2ban-client status
```

## 📱 Шаг 11: Настройка Telegram бота

1. Откройте админ-панель: https://yourdomain.com/admin-login.html
2. Перейдите в Настройки → Telegram
3. Следуйте инструкциям на странице
4. Проверьте подключение
5. Сохраните настройки

## ✅ Шаг 12: Проверка работы

### Проверьте все страницы:
- [ ] https://yourdomain.com - главная
- [ ] https://yourdomain.com/admin-login.html - админка
- [ ] https://yourdomain.com/pages/specialists/specialists.html - специалисты
- [ ] https://yourdomain.com/pages/supervisions/supervision.html - супервизии
- [ ] https://yourdomain.com/pages/certificates/certificates.html - сертификаты

### Проверьте формы:
- [ ] Форма обратной связи на главной
- [ ] Попап консультации
- [ ] Запись к специалисту
- [ ] Запись на супервизию
- [ ] Заказ сертификата

### Проверьте админку:
- [ ] Вход в систему
- [ ] Просмотр заявок
- [ ] Изменение статуса
- [ ] Промокоды
- [ ] Telegram уведомления

## 🐛 Troubleshooting

### Проблема: Сайт не открывается

```bash
# Проверьте Nginx
sudo systemctl status nginx
sudo nginx -t

# Проверьте PM2
pm2 status
pm2 logs psyproject-backend

# Проверьте порты
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
sudo netstat -tulpn | grep :3001
```

### Проблема: API не работает

```bash
# Проверьте backend
pm2 logs psyproject-backend

# Проверьте .env файл
cat .env

# Перезапустите backend
pm2 restart psyproject-backend
```

### Проблема: База данных не работает

```bash
# Проверьте права
ls -la database.sqlite

# Переинициализируйте
node backend/init-database.js
```

### Проблема: SSL не работает

```bash
# Проверьте сертификаты
sudo certbot certificates

# Обновите сертификаты
sudo certbot renew

# Проверьте Nginx конфигурацию
sudo nginx -t
```

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи PM2: `pm2 logs`
2. Проверьте логи Nginx: `sudo tail -f /var/log/nginx/psyproject-error.log`
3. Проверьте системные логи: `sudo journalctl -xe`

## 🎉 Готово!

Ваш сайт теперь работает на:
- **Frontend:** https://yourdomain.com
- **Админка:** https://yourdomain.com/admin-login.html
- **API:** https://yourdomain.com/api/

**Не забудьте:**
- ✅ Изменить пароль админа
- ✅ Настроить Telegram бота
- ✅ Добавить промокоды
- ✅ Настроить резервное копирование БД
