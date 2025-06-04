# Деплой на Azure Static Web Apps

Инструкция по настройке CI/CD для деплоя системы финансового планирования на Azure Static Web Apps.

## 🏗️ Build Pipeline (azure-pipelines.yml)

### Что делает:
- ✅ Устанавливает Node.js 20.x
- ✅ Кэширует npm зависимости для ускорения сборки
- ✅ Устанавливает зависимости через `npm ci`
- ✅ Собирает React приложение через `npm run build`
- ✅ Копирует `staticwebapp.config.json` в папку build
- ✅ Публикует артефакт `react-build` с собранным приложением
- ✅ Публикует артефакт `package-info` с информацией о версии

### Триггеры:
- Push в ветки `master` или `main`
- Ручной запуск из Azure DevOps

### Артефакты:
1. **`react-build`** - собранное React приложение готовое для деплоя
2. **`package-info`** - файл package.json для отслеживания версий

## 🚀 Release Pipeline (настройка в Azure DevOps)

### Шаг 1: Создание Static Web App в Azure

```bash
# Через Azure CLI
az staticwebapp create \
  --name financial-planning-app \
  --resource-group your-resource-group \
  --location "West Europe" \
  --source https://github.com/your-repo.git \
  --branch main \
  --build-preset React
```

### Шаг 2: Настройка Release Pipeline

1. **Создать новый Release Pipeline** в Azure DevOps
2. **Добавить артефакт**: выбрать Build Pipeline как источник
3. **Настроить Stage** для Production:

#### Task 1: Azure Static Web App Deploy
```yaml
- task: AzureStaticWebApp@0
  inputs:
    app_location: '/'
    output_location: '$(System.DefaultWorkingDirectory)/_BuildArtifacts/react-build'
    azure_static_web_apps_api_token: '$(AZURE_STATIC_WEB_APPS_TOKEN)'
  displayName: 'Deploy to Azure Static Web Apps'
```

### Шаг 3: Переменные для Release Pipeline

Настроить в Azure DevOps:
- **`AZURE_STATIC_WEB_APPS_TOKEN`** - токен из Azure Portal → Static Web Apps → Manage deployment token

## 📋 Конфигурация Static Web Apps

### staticwebapp.config.json
Конфигурация автоматически копируется в build артефакт и включает:

- **Маршрутизация SPA**: все неизвестные маршруты перенаправляются на `/index.html`
- **MIME типы**: правильные типы для статических файлов
- **Безопасность**: заголовки CSP, X-Frame-Options, и другие
- **Кэширование**: оптимизированное кэширование статических ресурсов

## 🔧 Настройка окружений

### Production Environment
```
URL: https://financial-planning-app.azurestaticapps.net
Auto-deploy: включен при push в main
Custom domain: можно настроить позже
```

### Staging Environment (опционально)
```
URL: https://financial-planning-app-staging.azurestaticapps.net  
Auto-deploy: включен при push в develop
```

## 📊 Мониторинг деплоя

### В Azure Portal:
1. **Deployment History** - история всех деплоев
2. **Function Keys** - если добавите API функции
3. **Configuration** - переменные окружения
4. **Custom Domains** - настройка собственных доменов

### В Azure DevOps:
1. **Build History** - логи сборки
2. **Release History** - логи деплоя  
3. **Tests** - результаты тестов (если добавите)

## 🎯 Рекомендации

### Performance:
- Static Web Apps автоматически включает CDN
- Gzip сжатие включено по умолчанию
- Кэширование статических файлов оптимизировано

### Безопасность:
- HTTPS включен по умолчанию
- CSP заголовки настроены в конфигурации
- Аутентификация Azure AD доступна при необходимости

### Масштабирование:
- Автоматическое масштабирование включено
- Глобальная CDN сеть Azure
- 99.95% SLA availability

## ⚡ Быстрый старт

1. **Настроить Build Pipeline**:
   ```bash
   # Убедиться что azure-pipelines.yml в корне репозитория
   git add azure-pipelines.yml staticwebapp.config.json
   git commit -m "Add Azure DevOps build pipeline"
   git push origin main
   ```

2. **Создать Static Web App** через Azure Portal

3. **Настроить Release Pipeline** в Azure DevOps

4. **Получить deployment token** и добавить в переменные

5. **Запустить первый деплой**!

## 🔍 Troubleshooting

### Частые проблемы:

**Build падает с ошибками ESLint**:
```yaml
# В azure-pipelines.yml уже добавлено:
env:
  CI: false  # Отключает обработку warnings как ошибок
```

**404 ошибки на маршрутах SPA**:
```json
// staticwebapp.config.json уже настроен:
"navigationFallback": {
  "rewrite": "/index.html"
}
```

**Медленная сборка**:
```yaml
# Кэширование npm уже включено:
- task: Cache@2
  inputs:
    key: 'npm | "$(Agent.OS)" | package-lock.json'
```

---

**Готово к деплою!** 🚀

После настройки Release Pipeline приложение будет автоматически деплоиться при каждом push в main ветку. 