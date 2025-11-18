# Мгновенное обновление состояния заявок

## Дата: 14.11.2025

## Проблема:
После действий с заявкой (сохранение, архивирование, удаление) через попап, состояние в таблице не обновлялось мгновенно. Требовалось обновление страницы.

## Причина:
Функции `loadRequests()` и `loadDashboard()` были определены внутри `DOMContentLoaded` блока и не были доступны глобально для вызова из `admin-request-popup.js`.

## Решение:

### 1. Экспорт функций в глобальную область (admin-panel.js):
```javascript
// Make functions available globally
window.updateRequestsBadge = updateRequestsBadge;
window.loadRequests = loadRequests;
window.loadDashboard = loadDashboard;
```

### 2. Создана универсальная функция обновления (admin-request-popup.js):
```javascript
window.refreshRequestsView = function() {
    // Update badge count
    if (typeof updateRequestsBadge === 'function') {
        updateRequestsBadge();
    }
    
    // Reload current view
    if (typeof loadRequests === 'function') {
        loadRequests();
    } else if (typeof loadDashboard === 'function') {
        loadDashboard();
    }
};
```

### 3. Замена всех вызовов на единую функцию:
Вместо:
```javascript
if (typeof loadRequests === 'function') {
    loadRequests();
} else if (typeof loadDashboard === 'function') {
    loadDashboard();
}
```

Теперь:
```javascript
refreshRequestsView();
```

### 4. Добавлено обновление бейджа во всех массовых операциях:
- `bulkArchiveRequests()` - добавлен `updateRequestsBadge()`
- `bulkDeleteRequests()` - добавлен `updateRequestsBadge()`
- `bulkChangeStatus()` - добавлен `updateRequestsBadge()`
- `deleteRequestFromTable()` - добавлен `updateRequestsBadge()`
- `createTestRequest()` - добавлен `updateRequestsBadge()`

## Результат:

✅ После любого действия с заявкой:
- Таблица обновляется мгновенно
- Счетчик новых заявок в бейдже обновляется
- Статистика на дашборде обновляется
- Не требуется обновление страницы

## Затронутые файлы:
- `admin/js/admin-panel.js` - экспорт функций, добавление updateRequestsBadge()
- `admin/js/admin-request-popup.js` - создание refreshRequestsView(), замена вызовов

## Тестирование:

Проверьте:
1. Открыть заявку → изменить статус → сохранить → таблица обновилась
2. Архивировать заявку → счетчик обновился → таблица обновилась
3. Удалить заявку → счетчик обновился → таблица обновилась
4. Массовое архивирование → всё обновилось
5. Массовое удаление → всё обновилось
6. Переключение вкладок → данные актуальные
