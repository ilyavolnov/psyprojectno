// Universal Order Popup for all services

window.openOrderPopup = function(serviceName, price, serviceType = 'service', serviceId = null) {
    // Create popup
    const popup = document.createElement('div');
    popup.className = 'order-popup active';
    popup.id = 'orderPopup';
    popup.innerHTML = `
        <div class="order-popup-overlay" onclick="closeOrderPopup()"></div>
        <div class="order-popup-content">
            <button class="order-popup-close" onclick="closeOrderPopup()">&times;</button>
            
            <h2 class="order-popup-title">Оформление заказа</h2>
            <div class="order-popup-service">
                <span class="order-service-name">${serviceName}</span>
                <span class="order-service-price" id="orderPrice" data-price="${price}">${price.toLocaleString('ru-RU')} ₽</span>
            </div>
            
            <form id="orderForm" class="order-form">
                <div class="order-form-group">
                    <label class="order-form-label">Ваше имя *</label>
                    <input type="text" class="order-form-input" id="orderName" name="name" required placeholder="Введите ваше имя">
                </div>
                
                <div class="order-form-group">
                    <label class="order-form-label">Номер телефона *</label>
                    <input type="tel" class="order-form-input" id="orderPhone" name="phone" required placeholder="+7 (___) ___-__-__">
                </div>
                
                <div class="order-form-group">
                    <label class="order-form-label">E-mail *</label>
                    <input type="email" class="order-form-input" id="orderEmail" name="email" required placeholder="example@mail.com">
                </div>
                
                <div class="order-form-group">
                    <label class="order-form-label">Комментарий (необязательно)</label>
                    <textarea class="order-form-input" id="orderMessage" name="message" rows="3" placeholder="Дополнительная информация"></textarea>
                </div>
                
                <div class="order-promo-toggle">
                    <button type="button" class="order-promo-btn" onclick="togglePromoField()">
                        <span>🎁</span> Ввести промокод
                    </button>
                </div>
                
                <div class="order-promo-field" id="orderPromoField" style="display: none;">
                    <div class="order-form-group">
                        <label class="order-form-label">Промокод</label>
                        <div class="order-promo-input-wrapper">
                            <input type="text" class="order-form-input" id="orderPromo" name="promo" placeholder="Введите промокод">
                            <button type="button" class="order-promo-apply" onclick="applyPromo()">Применить</button>
                        </div>
                        <div class="order-promo-message" id="promoMessage"></div>
                    </div>
                </div>
                
                <div class="order-agreements">
                    <label class="order-checkbox-label">
                        <input type="checkbox" class="order-checkbox" id="orderPrivacy" required>
                        <span>Я ознакомлен(а) и согласен(а) с <a href="#" target="_blank">Политикой конфиденциальности</a></span>
                    </label>
                    <label class="order-checkbox-label">
                        <input type="checkbox" class="order-checkbox" id="orderConsent" required>
                        <span>Я даю согласие на обработку моих персональных данных</span>
                    </label>
                </div>
                
                <button type="submit" class="order-submit-btn">
                    Оформить заказ
                </button>
            </form>
        </div>
    `;
    
    document.body.appendChild(popup);
    document.body.style.overflow = 'hidden';
    
    // Store service info for submission
    popup.dataset.serviceName = serviceName;
    popup.dataset.serviceType = serviceType;
    popup.dataset.serviceId = serviceId;
    
    // Handle form submission
    document.getElementById('orderForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitOrder();
    });
    
    // Phone mask
    const phoneInput = document.getElementById('orderPhone');
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            if (value[0] !== '7') value = '7' + value;
            let formatted = '+7';
            if (value.length > 1) formatted += ' (' + value.substring(1, 4);
            if (value.length >= 5) formatted += ') ' + value.substring(4, 7);
            if (value.length >= 8) formatted += '-' + value.substring(7, 9);
            if (value.length >= 10) formatted += '-' + value.substring(9, 11);
            e.target.value = formatted;
        }
    });
};

window.closeOrderPopup = function() {
    const popup = document.getElementById('orderPopup');
    if (popup) {
        popup.remove();
        document.body.style.overflow = '';
    }
};

window.togglePromoField = function() {
    // Try to find promo fields in both contexts - main order form and course registration form
    const orderField = document.getElementById('orderPromoField');
    const courseRegistrationField = document.getElementById('orderPromoField');

    // Check which form is currently active and toggle appropriate field
    if (orderField && orderField.closest('.order-popup-content')) {
        // Main order form context
        if (orderField.style.display === 'none') {
            orderField.style.display = 'block';
            orderField.querySelector('input').focus();
        } else {
            orderField.style.display = 'none';
        }
    } else if (courseRegistrationField) {
        // Course registration form context
        if (courseRegistrationField.style.display === 'none') {
            courseRegistrationField.style.display = 'block';
            courseRegistrationField.querySelector('input').focus();
        } else {
            courseRegistrationField.style.display = 'none';
        }
    }
};

window.applyPromo = async function() {
    // Try to find promo elements in the active popup context
    const promoInput = document.querySelector('#orderPromo, #courseRegistrationForm #orderPromo');
    const promoMessage = document.querySelector('#promoMessage, #courseRegistrationForm #promoMessage');
    const priceElement = document.querySelector('#orderPrice, #courseRegistrationForm #orderPrice');
    const promoCode = promoInput.value.trim().toUpperCase();

    if (!promoCode) {
        promoMessage.textContent = 'Введите промокод';
        promoMessage.className = 'order-promo-message error';
        return;
    }

    try {
        // Validate promo code via API
        const response = await fetch(API_CONFIG.getApiUrl('promo-codes/validate'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: promoCode })
        });

        const result = await response.json();

        if (result.success) {
            const discount = result.data.discount;
            const originalPrice = parseInt(priceElement.dataset.price);
            const newPrice = Math.round(originalPrice * (1 - discount / 100));

            priceElement.innerHTML = `
                <span style="text-decoration: line-through; opacity: 0.5; font-size: 0.9em;">${originalPrice.toLocaleString('ru-RU')} ₽</span>
                <span style="color: #2ecc71; font-weight: bold;">${newPrice.toLocaleString('ru-RU')} ₽</span>
            `;
            priceElement.dataset.discountedPrice = newPrice;
            priceElement.dataset.promoCode = promoCode;

            promoMessage.textContent = `✓ Промокод применен! Скидка ${discount}%`;
            promoMessage.className = 'order-promo-message success';
            promoInput.disabled = true;
        } else {
            promoMessage.textContent = '✗ ' + (result.error || 'Неверный промокод');
            promoMessage.className = 'order-promo-message error';
        }
    } catch (error) {
        console.error('Error validating promo code:', error);
        promoMessage.textContent = '✗ Ошибка проверки промокода';
        promoMessage.className = 'order-promo-message error';
    }
};

window.submitOrder = async function() {
    const popup = document.getElementById('orderPopup');
    const priceElement = document.getElementById('orderPrice');
    
    const orderData = {
        name: document.getElementById('orderName').value,
        phone: document.getElementById('orderPhone').value,
        email: document.getElementById('orderEmail').value,
        message: document.getElementById('orderMessage').value,
        request_type: popup.dataset.serviceType,
        service_name: popup.dataset.serviceName,
        service_id: popup.dataset.serviceId,
        price: priceElement.dataset.discountedPrice || priceElement.dataset.price,
        promo_code: priceElement.dataset.promoCode || null
    };
    
    try {
        // Show loading state
        const submitBtn = document.querySelector('.order-submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Отправка...';
        submitBtn.disabled = true;
        
        // Send to API
        const response = await fetch(API_CONFIG.getApiUrl('requests'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show success message
            showOrderSuccess();
        } else {
            throw new Error(result.error || 'Ошибка отправки заявки');
        }
    } catch (error) {
        console.error('Error submitting order:', error);
        alert('Произошла ошибка при отправке заявки. Пожалуйста, попробуйте еще раз.');
        
        // Restore button
        const submitBtn = document.querySelector('.order-submit-btn');
        submitBtn.textContent = 'Оформить заказ';
        submitBtn.disabled = false;
    }
};

function showOrderSuccess() {
    const popup = document.getElementById('orderPopup');
    const content = popup.querySelector('.order-popup-content');
    
    content.innerHTML = `
        <button class="order-popup-close" onclick="closeOrderPopup()">&times;</button>
        <div class="order-success">
            <div class="order-success-icon">✓</div>
            <h2 class="order-success-title">Заявка отправлена!</h2>
            <p class="order-success-text">
                Спасибо за ваш заказ. Мы свяжемся с вами в ближайшее время для подтверждения и уточнения деталей.
            </p>
            <button class="order-success-btn" onclick="closeOrderPopup()">Закрыть</button>
        </div>
    `;
}

// Open course registration popup
window.openCourseRegistration = function(courseTitle, coursePrice, courseType, courseId = null) {
    // Format service name based on course type
    const isWebinar = courseType && courseType.toLowerCase() === 'webinar';
    const serviceName = isWebinar
        ? `Запись на вебинар "${courseTitle}"`
        : `Запись на курс "${courseTitle}"`;

    // Create popup
    const popup = document.createElement('div');
    popup.className = 'order-popup active';
    popup.id = 'courseRegistrationPopup';
    popup.innerHTML = `
        <div class="order-popup-overlay" onclick="closeOrderPopup()"></div>
        <div class="order-popup-content">
            <button class="order-popup-close" onclick="closeOrderPopup()">&times;</button>

            <h2 class="order-popup-title">Заявка на ${isWebinar ? 'вебинар' : 'курс'}</h2>
            <div class="order-popup-service">
                <span class="order-service-name">${courseTitle}</span>
                <span class="order-service-price" id="orderPrice" data-price="${coursePrice}">${coursePrice.toLocaleString('ru-RU')} ₽</span>
            </div>

            <form id="courseRegistrationForm" class="order-form">
                <div class="order-form-group">
                    <label class="order-form-label">Ваше имя *</label>
                    <input type="text" class="order-form-input" id="orderName" name="name" required placeholder="Введите ваше имя">
                </div>

                <div class="order-form-group">
                    <label class="order-form-label">Номер телефона *</label>
                    <input type="tel" class="order-form-input" id="orderPhone" name="phone" required placeholder="+7 (___) ___-__-__">
                </div>

                <div class="order-form-group">
                    <label class="order-form-label">E-mail *</label>
                    <input type="email" class="order-form-input" id="orderEmail" name="email" required placeholder="example@mail.com">
                </div>

                <div class="order-form-group">
                    <label class="order-form-label">Комментарий (необязательно)</label>
                    <textarea class="order-form-input" id="orderMessage" name="message" rows="3" placeholder="Дополнительная информация">${isWebinar ? 'Запись на вебинар' : 'Запись на курс'}</textarea>
                </div>

                <div class="order-promo-toggle">
                    <button type="button" class="order-promo-btn" onclick="togglePromoField()">
                        <span>🎁</span> Ввести промокод
                    </button>
                </div>

                <div class="order-promo-field" id="orderPromoField" style="display: none;">
                    <div class="order-form-group">
                        <label class="order-form-label">Промокод</label>
                        <div class="order-promo-input-wrapper">
                            <input type="text" class="order-form-input" id="orderPromo" name="promo" placeholder="Введите промокод">
                            <button type="button" class="order-promo-apply" onclick="applyPromo()">Применить</button>
                        </div>
                        <div class="order-promo-message" id="promoMessage"></div>
                    </div>
                </div>

                <div class="order-agreements">
                    <label class="order-checkbox-label">
                        <input type="checkbox" class="order-checkbox" id="orderPrivacy" required>
                        <span>Я ознакомлен(а) и согласен(а) с <a href="#" target="_blank">Политикой конфиденциальности</a></span>
                    </label>
                    <label class="order-checkbox-label">
                        <input type="checkbox" class="order-checkbox" id="orderConsent" required>
                        <span>Я даю согласие на обработку моих персональных данных</span>
                    </label>
                </div>

                <button type="submit" class="order-submit-btn">
                    Отправить заявку на запись
                </button>
            </form>
        </div>
    `;

    document.body.appendChild(popup);
    document.body.style.overflow = 'hidden';

    // Store course info for submission
    popup.dataset.courseName = courseTitle;
    popup.dataset.courseType = courseType;
    popup.dataset.courseId = courseId;

    // Handle form submission
    document.getElementById('courseRegistrationForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitCourseRegistration();
    });

    // Phone mask
    const phoneInput = document.getElementById('orderPhone');
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            if (value[0] !== '7') value = '7' + value;
            let formatted = '+7';
            if (value.length > 1) formatted += ' (' + value.substring(1, 4);
            if (value.length >= 5) formatted += ') ' + value.substring(4, 7);
            if (value.length >= 8) formatted += '-' + value.substring(7, 9);
            if (value.length >= 10) formatted += '-' + value.substring(9, 11);
            e.target.value = formatted;
        }
    });
};

// Submit course registration
window.submitCourseRegistration = async function() {
    const popup = document.getElementById('courseRegistrationPopup');

    const orderData = {
        name: document.getElementById('orderName').value,
        phone: document.getElementById('orderPhone').value,
        email: document.getElementById('orderEmail').value,
        message: `${document.getElementById('orderMessage').value} | Курс/Вебинар: ${popup.dataset.courseName || 'Не указан'}`,
        request_type: `${popup.dataset.courseType === 'webinar' ? 'webinar' : 'course'}_registration`, // More specific type
        course_id: popup.dataset.courseId,
        service_name: popup.dataset.courseName,
        service_type: popup.dataset.courseType,
        price: document.getElementById('orderPrice').dataset.price
    };

    try {
        // Show loading state
        const submitBtn = document.querySelector('.order-submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Отправка...';
        submitBtn.disabled = true;

        const response = await fetch(API_CONFIG.getApiUrl('requests'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (result.success) {
            // Show success message
            showCourseRegistrationSuccess();
        } else {
            throw new Error(result.error || 'Ошибка отправки заявки');
        }
    } catch (error) {
        console.error('Error submitting course registration:', error);
        alert('Произошла ошибка при отправке заявки. Пожалуйста, попробуйте еще раз.');

        // Restore button
        const submitBtn = document.querySelector('.order-submit-btn');
        submitBtn.textContent = 'Отправить заявку на запись';
        submitBtn.disabled = false;
    }
};

// Show success for course registration
function showCourseRegistrationSuccess() {
    const popup = document.getElementById('courseRegistrationPopup');
    const content = popup.querySelector('.order-popup-content');

    content.innerHTML = `
        <button class="order-popup-close" onclick="closeOrderPopup()">&times;</button>
        <div class="order-success">
            <div class="order-success-icon">✓</div>
            <h2 class="order-success-title">Заявка отправлена!</h2>
            <p class="order-success-text">
                Спасибо за вашу заявку на запись. Мы свяжемся с вами в ближайшее время для подтверждения и уточнения деталей.
            </p>
            <button class="order-success-btn" onclick="closeOrderPopup()">Закрыть</button>
        </div>
    `;
}

// Close order popup - works for both order forms and course registration forms
window.closeOrderPopup = function() {
    // Try to close the active popup by looking for the currently displayed popup
    const activePopup = document.querySelector('.order-popup.active');
    if (activePopup) {
        activePopup.remove();
        document.body.style.overflow = '';
        return;
    }

    // Fallback to specific IDs if needed
    const popup = document.querySelector('#orderPopup, #courseRegistrationPopup');
    if (popup) {
        popup.remove();
        document.body.style.overflow = '';
    }
};

// Close on ESC key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeOrderPopup();
    }
});
