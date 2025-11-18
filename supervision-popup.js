// Supervision Popup Handler

// Open supervision popup
function openSupervisionPopup(supervisionId) {
    const popup = document.getElementById('supervisionPopup');
    if (!popup) return;
    
    // Load supervision data
    loadSupervisionData(supervisionId);
    
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

// Load supervision data
async function loadSupervisionData(supervisionId) {
    try {
        const response = await fetch(`http://localhost:3001/api/supervisions/${supervisionId}`);
        const result = await response.json();
        
        if (result.success && result.data) {
            const supervision = result.data;
            populateSupervisionPopup(supervision);
        } else {
            console.error('Failed to load supervision data');
        }
    } catch (error) {
        console.error('Error loading supervision:', error);
        // Show mock data for demo
        populateSupervisionPopup({
            title: 'Супервизия в EMDR-подходе с Натальей С.',
            description: 'Практикующий психолог, EMDR-терапевт, Сертифицированный супервизор',
            experience: '10 лет',
            price: 3900,
            duration: '55 минут',
            education: 'Высшее психологическое образование, сертификация EMDR',
            tags: ['EMDR', 'Травма', 'Супервизия']
        });
    }
}

// Populate popup with data
function populateSupervisionPopup(supervision) {
    document.getElementById('popupTitle').textContent = supervision.title || 'Супервизия';
    document.getElementById('popupExperience').textContent = supervision.experience || '10 лет';
    document.getElementById('popupPrice').textContent = `${supervision.price || 3900} ₽`;
    document.getElementById('popupDuration').textContent = supervision.duration || '55 минут';
    document.getElementById('popupDescription').textContent = supervision.description || '';
    document.getElementById('popupEducation').textContent = supervision.education || '';
    
    // Tags
    const tagsContainer = document.getElementById('popupTags');
    if (supervision.tags && supervision.tags.length > 0) {
        tagsContainer.innerHTML = supervision.tags.map(tag => 
            `<span class="popup-tag">${tag}</span>`
        ).join('');
    } else {
        tagsContainer.innerHTML = '';
    }
    
    // Payment button
    const payButton = document.getElementById('popupPayButton');
    payButton.onclick = () => {
        window.open('https://wa.me/79211880755', '_blank');
    };
}

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
