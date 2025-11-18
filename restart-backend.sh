#!/bin/bash

echo "🔄 Перезапуск backend сервера..."

# Остановка процессов
pkill -f "node backend/server.js" 2>/dev/null
pkill -f "start.sh" 2>/dev/null

sleep 2

echo "✅ Старые процессы остановлены"
echo "🚀 Запуск нового сервера..."

# Запуск нового сервера
cd backend && node server.js &

sleep 3

# Проверка
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Backend сервер запущен успешно!"
    echo "📡 API: http://localhost:3001"
else
    echo "❌ Ошибка запуска сервера"
fi
