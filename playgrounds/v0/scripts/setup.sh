#!/bin/bash

# Скрипт для быстрой настройки проекта

echo "🚀 Настройка Financial Planning System..."

# Проверяем наличие Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Пожалуйста, установите Docker."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен. Пожалуйста, установите Docker Compose."
    exit 1
fi

echo "✅ Docker и Docker Compose найдены"

# Создаем .env.local если его нет
if [ ! -f .env.local ]; then
    echo "📝 Создаем .env.local..."
    cat > .env.local << EOF
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
    echo "✅ .env.local создан"
fi

# Выбираем режим запуска
echo "Выберите режим запуска:"
echo "1) Разработка (с hot reload)"
echo "2) Продакшен"
read -p "Введите номер (1 или 2): " choice

case $choice in
    1)
        echo "🔧 Запускаем в режиме разработки..."
        docker-compose -f docker-compose.dev.yml up --build
        ;;
    2)
        echo "🏭 Запускаем в режиме продакшена..."
        docker-compose -f docker-compose.prod.yml up --build
        ;;
    *)
        echo "❌ Неверный выбор. Запускаем в режиме разработки..."
        docker-compose -f docker-compose.dev.yml up --build
        ;;
esac
