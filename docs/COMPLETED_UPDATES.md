# Обновление Header и Footer - ЗАВЕРШЕНО ✅

## Что сделано:

### 1. Созданы переиспользуемые компоненты:
- ✅ `includes/header.html` - единый header для всех страниц
- ✅ `includes/footer.html` - единый footer для всех страниц
- ✅ `includes/load-components.js` - автоматическая загрузка компонентов

### 2. Обновлены все страницы:
- ✅ `index.html` - header и footer заменены на placeholders
- ✅ `specialists.html` - header и footer заменены на placeholders
- ✅ `specialist-profile.html` - header и footer заменены на placeholders
- ✅ `supervision.html` - header и footer заменены на placeholders

### 3. Добавлен третий баннер:
- ✅ Баннер "Супервизии со специалистом" на странице specialists.html
- ✅ Создана страница `supervision.html` с карточками супервизий
- ✅ Стили для карточек супервизий

## Как это работает:

При загрузке каждой страницы скрипт `includes/load-components.js` автоматически:
1. Загружает содержимое `includes/header.html` в `<div id="header-placeholder"></div>`
2. Загружает содержимое `includes/footer.html` в `<div id="footer-placeholder"></div>`

## Преимущества:

✅ **Единое место редактирования** - изменения в header/footer применяются ко всем страницам  
✅ **Меньше дублирования кода** - header и footer написаны один раз  
✅ **Легче поддерживать** - не нужно обновлять каждую страницу отдельно  
✅ **Быстрее разработка** - новые страницы создаются быстрее

## Структура проекта:

```
/
├── includes/
│   ├── header.html          # Единый header
│   ├── footer.html          # Единый footer
│   └── load-components.js   # Скрипт загрузки
├── index.html               # Главная страница
├── specialists.html         # Страница специалистов
├── specialist-profile.html  # Профиль специалиста
└── supervision.html         # Страница супервизий
```

## Примечание:

Если в index.html остались фрагменты старого footer, их можно безопасно удалить вручную - они больше не используются, так как footer теперь загружается из `includes/footer.html`.
