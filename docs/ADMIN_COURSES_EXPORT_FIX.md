# Исправление: Вкладка курсов не кликабельна

## Проблема:
После удаления старой функции `loadCourses` из `admin-panel.js`, вкладка "Курсы" перестала работать - при клике ничего не происходило.

## Причина:
Функция `loadCourses` в `admin-courses-certificates.js` не была экспортирована глобально, поэтому `admin-panel.js` не мог её вызвать.

## Решение:
Добавлен экспорт функций в конец `admin-courses-certificates.js`:

```javascript
// Export functions globally
window.loadCourses = loadCourses;
window.loadCertificates = loadCertificates;
```

## Как это работает:

### До исправления:
```javascript
// admin-courses-certificates.js
async function loadCourses() {
    // код функции
}

// admin-panel.js
case 'courses':
    loadCourses(); // ❌ Функция не найдена!
    break;
```

### После исправления:
```javascript
// admin-courses-certificates.js
async function loadCourses() {
    // код функции
}
window.loadCourses = loadCourses; // ✅ Экспорт

// admin-panel.js
case 'courses':
    loadCourses(); // ✅ Работает!
    break;
```

## Результат:
✅ Вкладка "Курсы" теперь кликабельна
✅ При клике загружаются курсы из API
✅ Отображаются все 4 курса с карточками
✅ Работают кнопки редактирования и удаления

## Аналогично исправлено:
- `window.loadCertificates` - для вкладки "Сертификаты"

## Проверка:
1. Открыть админку
2. Кликнуть на вкладку "Курсы"
3. Увидеть список из 4 курсов
4. Кликнуть на вкладку "Сертификаты"
5. Увидеть список сертификатов
