// Course Page Loader - Renders course blocks from API

// Get course slug or ID from URL
const urlParams = new URLSearchParams(window.location.search);
const courseSlug = urlParams.get('slug');
const courseId = urlParams.get('id');

if ((!courseSlug || courseSlug === 'null' || courseSlug === 'undefined') && !courseId) {
    document.getElementById('course-content').innerHTML = `
        <div class="error-state">
            <h2>Курс не найден</h2>
            <p>Пожалуйста, вернитесь на <a href="index.html#courses">главную страницу</a></p>
        </div>
    `;
} else {
    // Use courseId if courseSlug is 'null' or 'undefined'
    const identifier = (courseSlug && courseSlug !== 'null' && courseSlug !== 'undefined') ? courseSlug : courseId;
    loadCourse(identifier);
}


// Load course data
async function loadCourse(identifier) {
    try {
        // Try to load by slug first, then by ID
        let response;
        let data;

        // Try to load by slug first if it exists and is valid
        if (courseSlug && courseSlug !== 'null' && courseSlug !== 'undefined') {
            response = await fetch(`${window.getApiBaseUrl ? getApiBaseUrl() : '/api'}/courses/slug/${courseSlug}`);
            data = await response.json();
        } else {
            // Otherwise try to load by ID
            const numericId = parseInt(courseId, 10);
            if (!isNaN(numericId)) {
                response = await fetch(`${window.getApiBaseUrl ? getApiBaseUrl() : '/api'}/courses/${numericId}`);
                data = await response.json();
            } else {
                showError('Неверный идентификатор курса');
                return;
            }
        }

        if (data.success && data.data) {
            const course = data.data;

            // Update page title
            document.title = `${course.title} - Маргарита Румянцева`;

            // Parse and render blocks
            let blocks = [];
            try {
                blocks = JSON.parse(course.page_blocks || '[]');
            } catch (parseError) {
                console.error('Error parsing course blocks:', parseError);
                // If parsing fails, try to use an empty array
                blocks = [];
            }

            renderCourse(course, blocks);
        } else {
            console.warn('Course not found:', data);
            showError('Курс не найден');
        }
    } catch (error) {
        console.error('Error loading course:', error);
        showError('Ошибка загрузки курса');
    }
}

// Render course with blocks
function renderCourse(course, blocks) {
    const container = document.getElementById('course-content');
    
    if (blocks.length === 0) {
        // Fallback if no blocks
        container.innerHTML = `
            <div class="course-fallback">
                <div class="container">
                    <h1>${course.title}</h1>
                    <p>${course.description}</p>
                    <div class="course-info">
                        <span class="course-price">${course.price.toLocaleString('ru-RU')} ₽</span>
                        <button class="cta-button">Записаться на курс</button>
                    </div>
                </div>
            </div>
        `;
        return;
    }

    // Render blocks
    container.innerHTML = blocks.map(block => renderBlock(block, course)).join('');
}

// Render individual block
function renderBlock(block, course) {
    switch (block.type) {
        case 'hero':
            return renderHeroBlock(block.data, course);
        case 'description':
            return renderDescriptionBlock(block.data);
        case 'program':
            return renderProgramBlock(block.data);
        case 'features':
            return renderFeaturesBlock(block.data);
        case 'author':
            return renderAuthorBlock(block.data);
        default:
            return '';
    }
}

// Render Hero Block
function renderHeroBlock(data, course) {
    const hasCountdown = course.start_date && new Date(course.start_date) > new Date();

    return `
        <section class="course-hero">
            <div class="course-hero-bg">
                ${data.image ? `<img src="${data.image}" alt="${data.title}" class="course-hero-image">` : ''}
                <div class="course-hero-overlay"></div>
            </div>
            <div class="container">
                <div class="course-hero-content">
                    <h1 class="course-hero-title">${data.title}</h1>

                    ${hasCountdown ? `
                        <div class="course-countdown" id="countdown-${course.id}" data-date="${course.start_date}">
                            <div class="countdown-item">
                                <span class="countdown-value" data-days>00</span>
                                <span class="countdown-label">дней</span>
                            </div>
                            <div class="countdown-item">
                                <span class="countdown-value" data-hours>00</span>
                                <span class="countdown-label">часов</span>
                            </div>
                            <div class="countdown-item">
                                <span class="countdown-value" data-minutes>00</span>
                                <span class="countdown-label">минут</span>
                            </div>
                            <div class="countdown-item">
                                <span class="countdown-value" data-seconds>00</span>
                                <span class="countdown-label">секунд</span>
                            </div>
                        </div>
                    ` : ''}

                    <div class="course-hero-info">
                        <span class="course-hero-price">${data.price.toLocaleString('ru-RU')} ₽</span>
                        ${data.startDate ? `<span class="course-hero-date">СТАРТ ${data.startDate}</span>` : ''}
                    </div>
                    <div class="course-hero-buttons">
                        <button class="course-hero-button" onclick="openCourseRegistration('${course.title}', '${course.price}', '${course.type || 'course'}', ${course.id || 0})">
                            Записаться
                        </button>
                    </div>
                    ${data.paymentInstructions ? `
                        <div class="course-hero-instructions">
                            ${data.paymentInstructions.split('\n').map(line => `<p>${line}</p>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        </section>
    `;
}

// Render Description Block
function renderDescriptionBlock(data) {
    return `
        <section class="course-description">
            <div class="container">
                <div class="course-description-grid">
                    ${data.image ? `
                        <div class="course-description-image">
                            <img src="${data.image}" alt="${data.title}">
                        </div>
                    ` : ''}
                    <div class="course-description-content">
                        <h2 class="course-description-title">${data.title}</h2>
                        ${data.subtitle ? `<p class="course-description-text">${data.subtitle}</p>` : ''}
                        ${data.contentType ? `<span class="course-description-type">${data.contentType}</span>` : ''}
                    </div>
                </div>
            </div>
        </section>
    `;
}

// Render Program Block
function renderProgramBlock(data) {
    return `
        <section class="course-program">
            <div class="container">
                <h2 class="course-program-title">${data.title || 'Программа курса'}</h2>
                <div class="course-program-list">
                    ${data.items.map((item, index) => `
                        <div class="course-program-item">
                            <span class="course-program-number">${String(index + 1).padStart(2, '0')}</span>
                            <p class="course-program-text">${item}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>
    `;
}

// Render Features Block
function renderFeaturesBlock(data) {
    const imagePosition = data.imagePosition || 'right';
    
    return `
        <section class="course-features">
            <div class="container">
                <div class="course-features-grid ${imagePosition === 'left' ? 'image-left' : 'image-right'}">
                    ${data.image ? `
                        <div class="course-features-image">
                            <img src="${data.image}" alt="${data.title}">
                        </div>
                    ` : ''}
                    <div class="course-features-content">
                        ${data.title ? `<h2 class="course-features-title">${data.title}</h2>` : ''}
                        <ul class="course-features-list">
                            ${data.items.map(item => `
                                <li class="course-features-item">
                                    <span class="course-features-icon">✓</span>
                                    <p>${item}</p>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    `;
}

// Render Author Block
function renderAuthorBlock(data) {
    return `
        <section class="course-author">
            <div class="container">
                <h2 class="course-author-heading">Автор и ведущая</h2>
                <div class="course-author-grid">
                    ${data.photo ? `
                        <div class="course-author-photo">
                            <img src="${data.photo}" alt="${data.name}">
                        </div>
                    ` : ''}
                    <div class="course-author-content">
                        <h3 class="course-author-name">${data.name}</h3>
                        <ul class="course-author-credentials">
                            ${data.credentials.map(credential => `
                                <li class="course-author-credential">${credential}</li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    `;
}

// Show error
function showError(message) {
    const basePath = window.getBasePath ? getBasePath() : '.';
    document.getElementById('course-content').innerHTML = `
        <div class="error-state">
            <div class="container">
                <h2>Ошибка</h2>
                <p>${message}</p>
                <a href="${basePath}/index.html#courses" class="cta-button">Вернуться к курсам</a>
            </div>
        </div>
    `;
}

// Open payment info
window.openPaymentInfo = function(whatsapp) {
    if (whatsapp) {
        const phone = whatsapp.replace(/\D/g, '');
        window.open(`https://wa.me/${phone}`, '_blank');
    } else {
        alert('Для оплаты свяжитесь с нами через форму консультации');
    }
};


// Initialize countdowns after rendering
function initCountdowns() {
    document.querySelectorAll('[id^="countdown-"]').forEach(countdown => {
        const targetDate = new Date(countdown.dataset.date).getTime();
        
        function updateCountdown() {
            const now = new Date().getTime();
            const distance = targetDate - now;
            
            if (distance < 0) {
                countdown.innerHTML = '<p class="countdown-ended">Курс начался!</p>';
                return;
            }
            
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            const daysEl = countdown.querySelector('[data-days]');
            const hoursEl = countdown.querySelector('[data-hours]');
            const minutesEl = countdown.querySelector('[data-minutes]');
            const secondsEl = countdown.querySelector('[data-seconds]');
            
            if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
            if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
            if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
            if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
        }
        
        updateCountdown();
        setInterval(updateCountdown, 1000);
    });
}

// Function to open order popup for course
window.openCourseOrder = function(course) {
    // Determine if it's a webinar or course for the popup title
    const isWebinar = (course.type && course.type.toLowerCase() === 'webinar') || course.title.toLowerCase().includes('вебинар');
    const serviceName = isWebinar ? `Запись на вебинар "${course.title}"` : `Запись на курс "${course.title}"`;
    const serviceType = isWebinar ? 'webinar' : 'course';

    // Create popup
    const popup = document.createElement('div');
    popup.className = 'order-popup active';
    popup.id = 'orderPopup';
    popup.innerHTML = `
        <div class="order-popup-overlay" onclick="closeOrderPopup()"></div>
        <div class="order-popup-content">
            <button class="order-popup-close" onclick="closeOrderPopup()">&times;</button>

            <h2 class="order-popup-title">Заявка на ${isWebinar ? 'вебинар' : 'курс'}</h2>
            <div class="order-popup-service">
                <span class="order-service-name">${course.title}</span>
                <span class="order-service-price" id="orderPrice" data-price="${course.price}">${course.price.toLocaleString('ru-RU')} ₽</span>
            </div>

            <form id="courseOrderForm" class="order-form">
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
                        <span>Я ознакомлен(а) и согласен(а) с <a href="${window.getBasePath ? getBasePath() : '.'}/privacy-policy.html" target="_blank">Политикой конфиденциальности</a></span>
                    </label>
                    <label class="order-checkbox-label">
                        <input type="checkbox" class="order-checkbox" id="orderConsent" required>
                        <span>Я даю согласие на обработку моих персональных данных</span>
                    </label>
                </div>

                <button type="submit" class="order-submit-btn">
                    Отправить заявку
                </button>
            </form>
        </div>
    `;

    document.body.appendChild(popup);
    document.body.style.overflow = 'hidden';

    // Store course info for submission
    popup.dataset.courseName = course.title;
    popup.dataset.courseType = serviceType;
    popup.dataset.courseId = course.id;

    // Handle form submission
    document.getElementById('courseOrderForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitCourseOrder(course);
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

// Submit course order
window.submitCourseOrder = async function(course) {
    const popup = document.getElementById('orderPopup');

    const orderData = {
        name: document.getElementById('orderName').value,
        phone: document.getElementById('orderPhone').value,
        email: document.getElementById('orderEmail').value,
        message: document.getElementById('orderMessage').value,
        request_type: popup.dataset.courseType,
        service_name: popup.dataset.courseName,
        service_id: popup.dataset.courseId,
        price: course.price,
        promo_code: document.getElementById('orderPrice').dataset.promoCode || null
    };

    try {
        // Show loading state
        const submitBtn = document.querySelector('.order-submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Отправка...';
        submitBtn.disabled = true;

        // Send to API
        const API_URL = window.getApiBaseUrl ? getApiBaseUrl() : '/api';

        const response = await fetch(`${API_URL}/requests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (result.success) {
            // Show success message
            showCourseOrderSuccess();
        } else {
            throw new Error(result.error || 'Ошибка отправки заявки');
        }
    } catch (error) {
        console.error('Error submitting course order:', error);
        alert('Произошла ошибка при отправке заявки. Пожалуйста, попробуйте еще раз.');

        // Restore button
        const submitBtn = document.querySelector('.order-submit-btn');
        submitBtn.textContent = 'Отправить заявку';
        submitBtn.disabled = false;
    }
};

// Close order popup - universal function that works with different popup types
window.closeOrderPopup = function() {
    // Try to close the active popup by looking for the currently displayed popup
    const activePopup = document.querySelector('.order-popup.active, #orderPopup, #courseRegistrationPopup, #orderPopup');
    if (activePopup) {
        activePopup.remove();
        document.body.style.overflow = '';
        return;
    }

    // Fallback to specific IDs if needed
    const popup = document.getElementById('orderPopup');
    if (popup) {
        popup.remove();
        document.body.style.overflow = '';
    }
};

// Toggle promo field
window.togglePromoField = function() {
    const field = document.getElementById('orderPromoField');
    if (field.style.display === 'none') {
        field.style.display = 'block';
        field.querySelector('input').focus();
    } else {
        field.style.display = 'none';
    }
};

// Apply promo code
window.applyPromo = async function() {
    const promoInput = document.getElementById('orderPromo');
    const promoMessage = document.getElementById('promoMessage');
    const priceElement = document.getElementById('orderPrice');
    const promoCode = promoInput.value.trim().toUpperCase();

    if (!promoCode) {
        promoMessage.textContent = 'Введите промокод';
        promoMessage.className = 'order-promo-message error';
        return;
    }

    try {
        // Validate promo code via API
        const API_URL = window.getApiBaseUrl ? getApiBaseUrl() : '/api';

        const response = await fetch(`${API_URL}/promo-codes/validate`, {
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

// Show success for course order
function showCourseOrderSuccess() {
    const popup = document.getElementById('orderPopup');
    const content = popup.querySelector('.order-popup-content');

    content.innerHTML = `
        <button class="order-popup-close" onclick="closeOrderPopup()">&times;</button>
        <div class="order-success">
            <div class="order-success-icon">✓</div>
            <h2 class="order-success-title">Заявка отправлена!</h2>
            <p class="order-success-text">
                Спасибо за вашу заявку. Мы свяжемся с вами в ближайшее время для подтверждения и уточнения деталей.
            </p>
            <button class="order-success-btn" onclick="closeOrderPopup()">Закрыть</button>
        </div>
    `;
}

// Close on ESC key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeOrderPopup();
    }
});

// Call after rendering
setTimeout(initCountdowns, 100);

// Close popup on ESC key for course registration popup
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const popup = document.querySelector('#courseRegistrationPopup, .order-popup.active');
        if (popup) {
            closeOrderPopup();
        }
    }
});
