## Универсальный попап оформления заказа

Создан типовой попап для оформления заказа любой услуги на сайте.

## Файлы

- **order-popup.js** - логика попапа
- **styles.css** - стили попапа (добавлены в конец файла)

## Функционал

### Основные поля
- ✅ Название услуги и цена (передаются параметрами)
- ✅ Имя клиента *
- ✅ Номер телефона * (с автоматической маской +7 (___) ___-__-__)
- ✅ E-mail *
- ✅ Комментарий (необязательно)

### Промокоды
- ✅ Кнопка "Ввести промокод" (скрыта по умолчанию)
- ✅ Поле для ввода промокода
- ✅ Кнопка "Применить"
- ✅ Валидация промокода
- ✅ Автоматический пересчет цены со скидкой
- ✅ Визуальное отображение старой и новой цены

**Встроенные промокоды (для примера):**
- `WELCOME10` - скидка 10%
- `SAVE20` - скидка 20%
- `FIRST` - скидка 15%

### Согласия
- ✅ Чекбокс: "Я ознакомлен(а) и согласен(а) с Политикой конфиденциальности"
- ✅ Чекбокс: "Я даю согласие на обработку моих персональных данных"
- ✅ Оба чекбокса обязательны для отправки

### Отправка
- ✅ Валидация всех полей
- ✅ Отправка заявки в API (`POST /api/requests`)
- ✅ Состояние загрузки ("Отправка...")
- ✅ Экран успешной отправки с анимацией

## Использование

### Открытие попапа

```javascript
openOrderPopup(serviceName, price, serviceType, serviceId)
```

**Параметры:**
- `serviceName` (string) - название услуги
- `price` (number) - цена услуги
- `serviceType` (string, optional) - тип услуги ('supervision', 'course', 'certificate', etc.)
- `serviceId` (number, optional) - ID услуги в базе данных

### Примеры использования

**Супервизия:**
```javascript
openOrderPopup('Супервизия в EMDR-подходе', 3900, 'supervision', 1)
```

**Курс:**
```javascript
openOrderPopup('Марафон по РПП', 9900, 'course', 4)
```

**Сертификат:**
```javascript
openOrderPopup('Подарочный сертификат', 5000, 'certificate', null)
```

**Консультация специалиста:**
```javascript
openOrderPopup('Консультация с Натальей С.', 4500, 'specialist', 12)
```

## Интеграция

### 1. Подключение скрипта

Добавьте в HTML перед закрывающим `</body>`:
```html
<script src="order-popup.js"></script>
```

### 2. Использование на кнопках

```html
<button onclick="openOrderPopup('Название услуги', 5000, 'service', 1)">
    Оформить заказ
</button>
```

### 3. Закрытие попапа

Попап закрывается:
- Кликом на overlay (затемненный фон)
- Кликом на кнопку ×
- Нажатием клавиши ESC
- Программно: `closeOrderPopup()`

## Отправка данных

### Формат данных

```json
{
  "name": "Иван Иванов",
  "phone": "+7 (999) 123-45-67",
  "email": "ivan@example.com",
  "message": "Дополнительная информация",
  "request_type": "supervision",
  "service_name": "Супервизия в EMDR-подходе",
  "service_id": 1,
  "price": 3510,
  "promo_code": "WELCOME10"
}
```

### API эндпоинт

```
POST /api/requests
Content-Type: application/json
```

## Промокоды

### Добавление новых промокодов

Отредактируйте объект `validPromos` в функции `applyPromo()`:

```javascript
const validPromos = {
    'WELCOME10': 10,  // 10% скидка
    'SAVE20': 20,     // 20% скидка
    'FIRST': 15,      // 15% скидка
    'NEWCLIENT': 25   // 25% скидка (новый)
};
```

### Интеграция с API

Для валидации промокодов через API замените блок проверки:

```javascript
// Вместо локальной проверки
const response = await fetch('/api/promo/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
        code: promoCode, 
        price: originalPrice 
    })
});

const result = await response.json();
if (result.success) {
    // Применить скидку
}
```

## Стилизация

### Основные цвета

- Основной цвет: `#97C2EC` (голубой)
- Успех: `#2ecc71` (зеленый)
- Ошибка: `#721c24` (красный)
- Фон: `#f8f9fa` (светло-серый)

### Кастомизация

Все стили находятся в `styles.css` с префиксом `.order-`:
- `.order-popup` - контейнер попапа
- `.order-popup-content` - содержимое
- `.order-form-input` - поля ввода
- `.order-submit-btn` - кнопка отправки

## Адаптивность

✅ Полностью адаптивный дизайн
✅ Оптимизирован для мобильных устройств
✅ Плавные анимации
✅ Touch-friendly элементы

## Анимации

- Появление попапа: slide-in + scale
- Закрытие кнопки: rotate
- Промокод поле: slide-down
- Успех: pop animation
- Кнопки: hover effects

## Валидация

- HTML5 валидация (required, type="email", type="tel")
- Маска телефона (автоматическое форматирование)
- Проверка чекбоксов перед отправкой
- Валидация промокода

## Примеры интеграции

### На странице супервизий
```javascript
// В supervisions-loader.js
onclick="openOrderPopup('${supervision.title}', ${supervision.price}, 'supervision', ${supervision.id})"
```

### На странице курсов
```javascript
// В course-page-loader.js
onclick="openOrderPopup('${course.title}', ${course.price}, 'course', ${course.id})"
```

### На странице сертификатов
```javascript
// В certificates.js
onclick="openOrderPopup('Подарочный сертификат', 2500, 'certificate')"
```

## Статус

✅ Создан универсальный попап
✅ Добавлены все поля
✅ Реализованы промокоды
✅ Интегрирована отправка в API
✅ Добавлены анимации
✅ Адаптивный дизайн
✅ Подключен к супервизиям

Готов к использованию на всех страницах сайта!
