// Supervisions Loader - Loads supervisions from API

async function loadSupervisions() {
    try {
        const response = await fetch(API_CONFIG.getApiUrl('supervisions'));
        const data = await response.json();

        if (!data.success) {
            console.error('Failed to load supervisions');
            return;
        }

        const supervisions = data.data;
        const container = document.querySelector('.supervision-grid'); // Changed from .supervision-cards to .supervision-grid

        if (!container) return;

        // Clear any existing content to ensure fresh load
        container.innerHTML = '';

        // Add free channel card first
        container.insertAdjacentHTML('beforeend', `
            <!-- Free Channel Card -->
            <div class="supervision-card supervision-card-free">
                <div class="supervision-badge">Бесплатно</div>
                <h3 class="supervision-title">Закрытый канал для психологов</h3>
                <p class="supervision-description">Профессиональное сообщество, обмен опытом, полезные материалы</p>
                <a href="https://t.me/drrumyantceva" target="_blank" class="supervision-btn supervision-btn-outline">Вступить</a>
            </div>
        `);

        // Add dynamic supervision cards
        supervisions.forEach(supervision => {
            // Ensure we have a valid image path
            const imageUrl = supervision.image
                ? (supervision.image.startsWith('http') ? supervision.image : '/' + supervision.image)
                : '../../images/placeholder-supervision.jpg';

            // Determine title and description based on available fields
            const title = supervision.title || supervision.name || 'Название не указано';
            const description = supervision.description || supervision.title || supervision.name || 'Описание отсутствует';

            const cardHTML = `
                <div class="supervision-card">
                    <div class="supervision-image-placeholder">
                        <img src="${imageUrl}" alt="${title}">
                    </div>
                    <h3 class="supervision-title">${title}</h3>
                    ${supervision.supervisors ? `<p class="supervision-supervisors">${supervision.supervisors}</p>` : ''}
                    ${supervision.date ? `<p class="supervision-date">${supervision.date}</p>` : ''}
                    ${supervision.experience ? `<p class="supervision-experience">Опыт: ${supervision.experience}</p>` : ''}
                    <div class="supervision-footer">
                        <p class="supervision-price">${supervision.price ? supervision.price.toLocaleString('ru-RU') + ' ₽' : 'Цена не указана'}</p>
                        <div class="supervision-buttons">
                            <button class="supervision-btn supervision-btn-outline" data-supervision-id="${supervision.id}">Подробнее</button>
                            <button class="supervision-btn supervision-btn-primary" onclick="openConsultationPopup('supervision')">Записаться</button>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', cardHTML);
        });

    } catch (error) {
        console.error('Error loading supervisions:', error);
    }
}

// Open supervision details popup
window.openSupervisionDetailsPopup = async function(id) {
    try {
        const response = await fetch(API_CONFIG.getApiUrl(`supervisions/${id}`));
        const data = await response.json();

        if (!data.success) {
            console.error('Failed to load supervision');
            return;
        }

        const supervision = data.data;

        // Create popup
        const popup = document.createElement('div');
        popup.className = 'supervision-details-popup active';
        popup.id = 'supervisionDetailsPopup';
        popup.innerHTML = `
            <div class="supervision-popup-overlay" onclick="closeSupervisionDetailsPopup()"></div>
            <div class="supervision-popup-content">
                <button class="supervision-popup-close" onclick="closeSupervisionDetailsPopup()">&times;</button>

                <div class="supervision-popup-header">
                    <img src="${supervision.image}" alt="${supervision.name}" class="supervision-popup-image">
                    <div class="supervision-popup-header-info">
                        <h2 class="supervision-popup-name">${supervision.name}</h2>
                        <h3 class="supervision-popup-title">${supervision.title}</h3>
                        <div class="supervision-popup-tags">
                            ${supervision.tags.map(tag => `<span class="supervision-tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>

                <div class="supervision-popup-body">
                    <div class="supervision-popup-info-grid">
                        <div class="supervision-popup-info-item">
                            <span class="supervision-popup-label">⏱ Длительность:</span>
                            <span class="supervision-popup-value">${supervision.duration}</span>
                        </div>
                        <div class="supervision-popup-info-item">
                            <span class="supervision-popup-label">📚 Опыт:</span>
                            <span class="supervision-popup-value">${supervision.experience}</span>
                        </div>
                        <div class="supervision-popup-info-item">
                            <span class="supervision-popup-label">💰 Стоимость:</span>
                            <span class="supervision-popup-value">${supervision.price.toLocaleString('ru-RU')} ₽</span>
                        </div>
                    </div>

                    ${supervision.description.length > 0 ? `
                        <div class="supervision-popup-section">
                            <h4 class="supervision-popup-section-title">О супервизии</h4>
                            ${supervision.description.map(desc => `<p class="supervision-popup-text">${desc}</p>`).join('')}
                        </div>
                    ` : ''}

                    ${supervision.education.length > 0 ? `
                        <div class="supervision-popup-section">
                            <h4 class="supervision-popup-section-title">Образование и обучение</h4>
                            <ul class="supervision-popup-list">
                                ${supervision.education.map(edu => `<li>${edu}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>

                <div class="supervision-popup-footer">
                    <button class="supervision-popup-btn" onclick="closeSupervisionDetailsPopup(); openOrderPopup('${supervision.title.replace(/'/g, "\\'")}', ${supervision.price}, 'supervision', ${supervision.id})">
                        Записаться на супервизию
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(popup);
        document.body.style.overflow = 'hidden';

    } catch (error) {
        console.error('Error loading supervision details:', error);
    }
};

window.closeSupervisionDetailsPopup = function() {
    const popup = document.getElementById('supervisionDetailsPopup');
    if (popup) {
        popup.remove();
        document.body.style.overflow = '';
    }
};

// Load on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSupervisions);
} else {
    loadSupervisions();
}
