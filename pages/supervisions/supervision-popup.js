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
    
    // Payment button
    const payButton = document.getElementById('popupPayButton');
    payButton.onclick = () => {
        window.open('https://wa.me/79211880755', '_blank');
    };
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
