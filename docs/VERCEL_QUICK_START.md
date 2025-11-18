# Быстрый деплой на Vercel

## 🚀 За 3 минуты

### 1. Установка Vercel CLI
```bash
npm install -g vercel
```

### 2. Логин
```bash
vercel login
```

### 3. Деплой
```bash
vercel --prod
```

Готово! Ваш сайт онлайн.

## ⚙️ Настройка переменных (обязательно!)

После деплоя:
1. Откройте [vercel.com/dashboard](https://vercel.com/dashboard)
2. Выберите ваш проект
3. Settings → Environment Variables
4. Добавьте:
   - `TELEGRAM_BOT_TOKEN` = ваш токен
   - `ADMIN_CHAT_ID` = ваш chat ID
   - `NODE_ENV` = production

## ⚠️ Важно!

**SQLite не работает на Vercel!** Нужна внешняя БД:

### Быстрое решение - Vercel Postgres (бесплатно):
```bash
vercel postgres create
```

Или используйте:
- [Supabase](https://supabase.com) (PostgreSQL, бесплатно)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (бесплатно)
- [PlanetScale](https://planetscale.com) (MySQL, бесплатно)

## 🔄 Обновление сайта

```bash
git add .
git commit -m "Update"
git push
vercel --prod
```

## 📱 Telegram Bot

На Vercel используйте webhook вместо polling:

```bash
curl -X POST https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook \
  -d url=https://your-site.vercel.app/api/webhook
```

## 🆘 Проблемы?

Смотрите полную инструкцию в `VERCEL_DEPLOY.md`
