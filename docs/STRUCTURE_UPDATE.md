# Обновление структуры проекта

## 📁 Новая структура

```
psyproject/
├── pages/
│   ├── specialists/
│   │   ├── specialists.html
│   │   ├── specialist-profile.html
│   │   ├── specialists-loader.js
│   │   └── specialists-data.json
│   ├── supervisions/
│   │   ├── supervision.html
│   │   ├── supervision-profile.html
│   │   ├── supervisions-loader.js
│   │   ├── supervision-popup.js
│   │   └── supervisions-data.json
│   └── certificates/
│       ├── certificates.html
│       └── certificates.js
├── includes/
│   ├── header.html (обновлен)
│   ├── footer.html (обновлен)
│   └── load-components.js (новый)
├── docs/
│   └── (вся документация)
└── index.html
```

## 🔄 Изменения в навигации

### Header (includes/header.html)
Обновлены ссылки:
- ✅ Курсы и вебинары → `pages/certificates/certificates.html`
- ✅ Специалисты → `pages/specialists/specialists.html`
- ✅ Супервизии → `pages/supervisions/supervision.html`
- ✅ Сертификаты → `pages/certificates/certificates.html`

### Footer (includes/footer.html)
Обновлены ссылки:
- ✅ Консультация специалистов → `pages/specialists/specialists.html`
- ✅ Супервизии → `pages/supervisions/supervision.html`
- ✅ Подарочные сертификаты → `pages/certificates/certificates.html`

## 🎯 Универсальный загрузчик компонентов

Создан `includes/load-components.js` который:

1. **Автоматически определяет глубину вложенности** страницы
2. **Подставляет правильные пути** к ресурсам
3. **Обновляет ссылки** в header и footer на лету

### Как это работает:

```javascript
// Определяет базовый путь
function getBasePath() {
    const path = window.location.pathname;
    
    // Если в pages/ → возвращает '../../'
    if (path.includes('/pages/')) {
        return '../../';
    }
    // Если в корне → возвращает ''
    return '';
}
```

### Использование:

Просто подключите скрипт в HTML:
```html
<script src="../../includes/load-components.js" defer></script>
```

Скрипт автоматически:
- Загрузит header и footer
- Обновит все пути
- Инициализирует кнопки

## 📝 Обновленные файлы

### HTML страницы:
- ✅ `pages/specialists/specialists.html`
- ✅ `pages/supervisions/supervision.html`
- ✅ `pages/certificates/certificates.html`
- ✅ `index.html`

### Компоненты:
- ✅ `includes/header.html`
- ✅ `includes/footer.html`
- ✅ `includes/load-components.js` (новый)

## 🎨 Пути к ресурсам

### Из корня (index.html):
```html
<link rel="stylesheet" href="styles.css">
<script src="script.js"></script>
<img src="images/hero.jpg">
```

### Из pages/specialists/:
```html
<link rel="stylesheet" href="../../styles.css">
<script src="../../script.js"></script>
<img src="../../images/hero.jpg">
```

### Из pages/supervisions/:
```html
<link rel="stylesheet" href="../../styles.css">
<script src="../../script.js"></script>
<img src="../../images/hero.jpg">
```

## ✅ Преимущества новой структуры

1. **Логическая группировка** - связанные файлы в одной папке
2. **Чистый корень** - меньше файлов в корневой директории
3. **Масштабируемость** - легко добавлять новые разделы
4. **Универсальные компоненты** - header/footer работают везде
5. **Централизованная документация** - все в docs/

## 🔧 Миграция существующих ссылок

Если у вас есть старые ссылки, обновите их:

**Было:**
```html
<a href="specialists.html">Специалисты</a>
<a href="supervision.html">Супервизии</a>
<a href="certificates.html">Сертификаты</a>
```

**Стало:**
```html
<a href="pages/specialists/specialists.html">Специалисты</a>
<a href="pages/supervisions/supervision.html">Супервизии</a>
<a href="pages/certificates/certificates.html">Сертификаты</a>
```

## 🚀 Что дальше?

Структура готова для:
- Добавления новых разделов (pages/blog/, pages/about/, etc.)
- Создания подстраниц в каждом разделе
- Масштабирования проекта

## 📚 Документация

Вся документация теперь в `docs/`:
- `PROJECT_DOCUMENTATION.md` - полная документация
- `STRUCTURE_UPDATE.md` - этот файл
- И все остальные .md файлы

---

**Дата обновления:** 18 ноября 2024
