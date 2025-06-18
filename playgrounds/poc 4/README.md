# POC 4: AI-Managed PostgreSQL Database

## Архитектура

Этот POC реализует AI-управляемую PostgreSQL базу данных на основе рекомендаций из документа "thoughts 8 - 3 - preselection v2.md".

### Компоненты

1. **PostgreSQL** - основная база данных
2. **LangChain SQL Agent** - AI интерфейс к базе данных
3. **Chainlit** - веб-интерфейс для чата с AI
4. **LangFuse** - трассировка и мониторинг LLM взаимодействий
5. **Alembic** - управление миграциями БД

### Стек технологий

- **Backend**: Python 3.11+, LangChain, SQLAlchemy, Alembic
- **Database**: PostgreSQL 15
- **Frontend**: Chainlit (с поддержкой аудио и изображений)
- **Monitoring**: LangFuse (self-hosted)
- **Deployment**: Docker Compose

## Быстрый запуск

### Автоматический запуск (рекомендуется)

**Windows:**
```powershell
.\run.ps1
```

**Linux/Mac:**
```bash
./run.sh
```

### Ручной запуск

1. Скопируйте конфигурацию:
   ```bash
   cp env.example .env
   ```

2. Добавьте API ключи в `.env`:
   ```
   OPENAI_API_KEY=sk-your-key-here
   # или
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   ```

3. Запустите сервисы:
   ```bash
   docker-compose up -d
   ```

### Доступ к интерфейсам

- **Chainlit Chat**: http://localhost:8000
- **LangFuse Tracing**: http://localhost:3000  
- **PostgreSQL**: localhost:5432

## Цель POC

Доказать концепцию AI-управляемой базы данных, где пользователь может:
- Общаться с AI через естественный язык
- AI создает и модифицирует схемы БД
- AI выполняет CRUD операции
- Полная трассировка всех операций
- Визуализация работы агента

## Особенности

- Поддержка аудио и изображений в чате
- Real-time трассировка LangChain операций
- Автоматическое создание и модификация схем
- История всех взаимодействий
- Безопасное выполнение SQL запросов 