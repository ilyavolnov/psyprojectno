// Supervisions Loader - Loads supervisions from API

async function loadSupervisions() {
    try {
        const response = await fetch('http://localhost:3001/api/supervisions');
        const data = await response.json();
        
        if (!data.success) {
            console.error('Failed to load supervisions');
            return;
        }
        
        const supervisions = data.data;
        const container = document.querySelector('.supervision-cards');
        
        if (!container) return;
        
        container.innerHTML = supervisions.map(supervision => `
            <div class="supervision-card" data-scroll>
                <div class="supervision-image">
                    <img src="${supervision.image}" alt="${supervision.name}">
                </div>
                <div class="supervision-content">
                    <h3 class="supervision-name">${supervision.name}</h3>
                    <p class="supervision-title">${supervision.title}</p>
                    <div class="supervision-tags">
                        ${supervision.tags.map(tag => `<span class="supervision-tag">${tag}</span>`).join('')}
                    </div>
                    <div class="supervision-info">
                        <span class="supervision-duration">⏱ ${supervision.duration}</span>
                        <span class="supervision-experience">📚 ${supervision.experience}</span>
                    </div>
                    <div class="supervision-price">${supervision.price.toLocaleString('ru-RU')} ₽</div>
                    <button class="supervision-btn" onclick="openSupervisionDetailsPopup(${supervision.id})">Подробнее</button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading supervisions:', error);
    }
}

// Open supervision details popup
window.openSupervisionDetailsPopup = async function(id) {
    try {
        const response = await fetch(`http://localhost:3001/api/supervisions/${id}`);
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
