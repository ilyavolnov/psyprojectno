# Кнопка "Бесплатная консультация" - Прокрутка к форме

## ✅ Что сделано:

### 1. Добавлен ID для секции формы
```html
<section class="contact-section" id="contact-form">
```

### 2. Обновлен обработчик кнопки
Вместо `alert()` теперь плавная прокрутка к форме:

```javascript
document.querySelectorAll('.cta-button, .hero-cta-button').forEach(button => {
    button.addEventListener('click', function (e) {
        e.preventDefault();
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
            
            // Focus on first input after scroll
            setTimeout(() => {
                const firstInput = contactForm.querySelector('input[type="text"]');
                if (firstInput) {
                    firstInput.focus();
                }
            }, 800);
        }
    });
});
```

## Как работает:

1. **Клик на кнопку** "Бесплатная консультация"
2. **Плавная прокрутка** к форме (smooth scroll)
3. **Автофокус** на первое поле ввода через 800ms

## Какие кнопки работают:

- ✅ Кнопка в hero секции: "Бесплатная консультация"
- ✅ Кнопка в header: "Получить консультацию"
- ✅ Любые кнопки с классами `.cta-button` или `.hero-cta-button`

## Результат:

Теперь при клике на кнопку:
- Страница плавно прокручивается к форме
- Курсор автоматически устанавливается в поле "Ваше имя"
- Пользователь может сразу начать заполнять форму

## Файлы изменены:

1. `index.html` - добавлен `id="contact-form"`
2. `script.js` - обновлен обработчик кнопки

## Проверка:

1. Открыть главную страницу
2. Кликнуть на "Бесплатная консультация"
3. Страница должна плавно прокрутиться к форме
4. Курсор должен появиться в поле "Ваше имя"
