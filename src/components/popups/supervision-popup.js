// Supervision Popup Handler

// Load supervisions from API
let supervisionsData = {};

// Fetch supervisions from backend
async function loadSupervisionsFromAPI() {
    try {
        const response = await fetch('http://localhost:3001/api/supervisions');
        const result = await response.json();
        
        if (result.success && result.data) {
            // Convert array to object with id as key
            result.data.forEach(supervision => {
                supervisionsData[supervision.id] = supervision;
            });
        }
    } catch (error) {
        console.error('Error loading supervisions:', error);
        // Fallback to hardcoded data
        supervisionsData = {
    1: {
        title: 'Супервизия в EMDR-подходе с Натальей С.',
        supervisors: 'Наталья С.',
        date: '27 ноября 13.00-16.00 (мск)',
        experience: '10 лет',
        price: 3900,
        duration: '55 минут',
        description: 'Практикующий психолог, EMDR-терапевт, Сертифицированный супервизор',
        features: [
            'Индивидуальный разбор вашего случая',
            'Работа с травматическим опытом',
            'Практические рекомендации',
            'Супервизия в EMDR-подходе'
        ]
    },
    2: {
        title: 'Групповая супервизия',
        supervisors: '2 ведущих супервизора',
        date: '27 ноября 13.00-16.00 (мск)',
        experience: 'Более 10 лет',
        price: 2500,
        duration: '3 часа',
        priceNote: '*стоимость за встречу',
        description: 'Групповая супервизия с разбором кейсов в полимодальном подходе',
        features: [
            'Анализ 2-3 кейсов (выбор делают участники)',
            'Разбор в ПОЛИмодальном подходе: помощь в составлении плана ведения клиента',
            'Обозначение «слепых зон» процесса',
            'Практические рекомендации',
            'БОНУС! Терапевтический блок для участников (возможность познакомиться с EMDR на личном опыте)',
            'Встреча будет проходить в программе Zoom (подключение с видео – по желанию)'
        ],
        bonus: 'Присоединяйтесь! Это станет вашим МЕСТОМ СИЛЫ и опорным профессиональным сообществом'
    },
    3: {
        title: 'Супервизия с Маргаритой Румянцевой',
        supervisors: 'Маргарита Румянцева',
        experience: '15 лет',
        price: 11900,
        duration: '90 минут',
        description: 'Врач-психотерапевт, EMDR-терапевт, IFS-терапевт, Сексолог, Сертифицированный супервизор, Преподаватель, Европейский практик',
        features: [
            'Глубокий разбор сложных случаев',
            'Работа с различными подходами (EMDR, IFS)',
            'Супервизия от европейского практика',
            'Индивидуальный подход'
        ]
    },
    4: {
        title: 'Супервизия с Натальей',
        supervisors: 'Наталья',
        experience: '13 лет',
        price: 3900,
        duration: '55 минут',
        description: 'Практикующий психолог, EMDR-терапевт, Сертифицированный супервизор',
        features: [
            'Разбор клиентских случаев',
            'EMDR-подход',
            'Практические рекомендации',
            'Работа со сложными запросами'
        ]
    },
    5: {
        title: 'Супервизия с Павлом',
        supervisors: 'Павел',
        experience: '16 лет',
        price: 3900,
        duration: '55 минут',
        description: 'Практикующий психолог, EMDR-терапевт, Сертифицированный супервизор',
        features: [
            'Профессиональная супервизия',
            'Разбор сложных кейсов',
            'EMDR-терапия',
            'Индивидуальный подход'
        ]
    }
        };
    }
}

// Open supervision popup
function openSupervisionPopup(supervisionId) {
    const popup = document.getElementById('supervisionPopup');
    if (!popup) return;
    
    // Load supervision data
    const supervision = supervisionsData[supervisionId];
    if (supervision) {
        populateSupervisionPopup(supervision);
    }
    
    // Show popup
    popup.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close supervision popup
function closeSupervisionPopup() {
    const popup = document.getElementById('supervisionPopup');
    if (!popup) return;
    
    popup.classList.remove('active');
    document.body.style.overflow = '';
}

// Populate popup with data
function populateSupervisionPopup(supervision) {
    document.getElementById('popupTitle').textContent = supervision.title;
    document.getElementById('popupExperience').textContent = supervision.experience;
    document.getElementById('popupPrice').innerHTML = `${supervision.price.toLocaleString('ru-RU')} ₽${supervision.priceNote ? '<br><small>' + supervision.priceNote + '</small>' : ''}`;
    document.getElementById('popupDuration').textContent = supervision.duration;
    
    // Description
    document.getElementById('popupDescription').innerHTML = `
        ${supervision.supervisors ? `<p><strong>Ведущие:</strong> ${supervision.supervisors}</p>` : ''}
        ${supervision.date ? `<p><strong>Дата:</strong> ${supervision.date}</p>` : ''}
        <p>${supervision.description}</p>
    `;
    
    // Features
    if (supervision.features && supervision.features.length > 0) {
        const featuresHtml = `
            <h3 class="popup-section-title">Особенности супервизии:</h3>
            <ul class="popup-features-list">
                ${supervision.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
            ${supervision.bonus ? `<p class="popup-bonus"><strong>${supervision.bonus}</strong></p>` : ''}
        `;
        document.getElementById('popupEducation').innerHTML = featuresHtml;
    } else {
        document.getElementById('popupEducation').innerHTML = '';
    }
    
    // Store supervision data for request
    window.currentSupervision = supervision;
    
    // Payment button - open request form using the standard consultation form
    const payButton = document.getElementById('popupPayButton');
    payButton.textContent = 'Записаться на супервизию';
    payButton.onclick = () => {
        closeSupervisionPopup();
        // Use the standard consultation form with supervision type
        openConsultationPopup('supervision');
    };
}

// Open request form for supervision
function openSupervisionRequestForm(supervision) {
    // Create form popup
    const formPopup = document.createElement('div');
    formPopup.className = 'consultation-popup active';
    formPopup.id = 'supervisionRequestPopup';
    formPopup.innerHTML = `
        <div class="consultation-popup-overlay"></div>
        <div class="consultation-popup-content">
            <button class="consultation-popup-close">&times;</button>
            <h2 class="consultation-popup-title">Запись на супервизию</h2>
            <p class="consultation-popup-subtitle">${supervision.title}</p>
            <p class="consultation-popup-price">${supervision.price.toLocaleString('ru-RU')} ₽</p>
            
            <form class="consultation-form" id="supervisionRequestForm">
                <div class="form-group">
                    <input type="text" name="name" placeholder="Ваше имя *" required>
                </div>
                <div class="form-group">
                    <input type="tel" name="phone" placeholder="Телефон *" required>
                </div>
                <div class="form-group">
                    <input type="email" name="email" placeholder="Email">
                </div>
                <div class="form-group">
                    <textarea name="message" placeholder="Комментарий (необязательно)" rows="4"></textarea>
                </div>
                <button type="submit" class="cta-button">Отправить заявку</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(formPopup);
    document.body.style.overflow = 'hidden';
    
    // Close handlers
    const closeBtn = formPopup.querySelector('.consultation-popup-close');
    const overlay = formPopup.querySelector('.consultation-popup-overlay');
    
    const closeForm = () => {
        formPopup.remove();
        document.body.style.overflow = '';
    };
    
    closeBtn.addEventListener('click', closeForm);
    overlay.addEventListener('click', closeForm);
    
    // Form submit
    const form = document.getElementById('supervisionRequestForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            message: formData.get('message') || `Запись на супервизию: ${supervision.title}`,
            request_type: 'supervision',
            supervision_id: supervision.id
        };
        
        try {
            const API_URL = window.location.hostname === 'localhost' 
                ? 'http://localhost:3001/api' 
                : '/api';
            
            const response = await fetch(`${API_URL}/requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                closeForm();
                showSuccessMessage();
            } else {
                alert('Ошибка отправки заявки. Попробуйте позже.');
            }
        } catch (error) {
            console.error('Error submitting request:', error);
            alert('Ошибка отправки заявки. Попробуйте позже.');
        }
    });
}

// Show success message
function showSuccessMessage() {
    const successPopup = document.createElement('div');
    successPopup.className = 'consultation-popup active';
    successPopup.innerHTML = `
        <div class="consultation-popup-overlay"></div>
        <div class="consultation-popup-content" style="text-align: center; padding: 50px;">
            <h2 style="color: #97C2EC; margin-bottom: 20px;">✓ Заявка отправлена!</h2>
            <p style="font-size: 18px; margin-bottom: 30px;">Мы свяжемся с вами в ближайшее время</p>
            <button class="cta-button" onclick="this.closest('.consultation-popup').remove(); document.body.style.overflow = '';">
                Закрыть
            </button>
        </div>
    `;
    
    document.body.appendChild(successPopup);
    
    setTimeout(() => {
        successPopup.remove();
        document.body.style.overflow = '';
    }, 3000);
}

// Load supervisions on page load
loadSupervisionsFromAPI();

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Close button
    const closeBtn = document.querySelector('.supervision-popup-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeSupervisionPopup);
    }
    
    // Overlay click
    const overlay = document.querySelector('.supervision-popup-overlay');
    if (overlay) {
        overlay.addEventListener('click', closeSupervisionPopup);
    }
    
    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSupervisionPopup();
        }
    });
    
    // All "Подробнее" buttons
    document.querySelectorAll('.supervision-btn-outline').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const supervisionId = btn.dataset.supervisionId || 1;
            openSupervisionPopup(supervisionId);
        });
    });
});
