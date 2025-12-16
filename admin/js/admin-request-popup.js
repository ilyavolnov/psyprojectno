// Enhanced Request Popup with Real Specialists

window.openRequestPopup = async function(requestId) {
    let request = window.allRequests?.find(r => r.id === requestId);
    
    if (!request) {
        try {
            const response = await fetch(API_CONFIG.getApiUrl(`requests/${requestId}`));
            const data = await response.json();
            if (data.success) {
                request = data.data;
            }
        } catch (error) {
            console.error('Error loading request:', error);
            await adminError('Ошибка загрузки заявки');
            return;
        }
    }
    
    if (!request) return;
    
    // Auto-mark as viewed if status is "new"
    if (request.status === 'new') {
        try {
            const response = await fetch(API_CONFIG.getApiUrl(`requests/${requestId}`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'viewed' })
            });
            
            if (response.ok) {
                request.status = 'viewed';
                // Update in cache
                if (window.allRequests) {
                    const cachedRequest = window.allRequests.find(r => r.id === requestId);
                    if (cachedRequest) {
                        cachedRequest.status = 'viewed';
                    }
                }
                // Update badge
                if (typeof updateRequestsBadge === 'function') {
                    updateRequestsBadge();
                }
            }
        } catch (error) {
            console.error('Error updating request status:', error);
        }
    }

    // Load specialists for dropdown
    let specialists = [];
    try {
        const response = await fetch(API_CONFIG.getApiUrl('specialists'));
        const data = await response.json();
        if (data.success) {
            specialists = data.data;
        }
    } catch (error) {
        console.error('Error loading specialists:', error);
    }

    const popup = document.getElementById('requestPopup');
    document.getElementById('popupRequestId').textContent = requestId;
    
    const popupBody = document.getElementById('popupRequestBody');
    popupBody.innerHTML = `
        <div class="admin-request-popup">
            <!-- Client Info Section -->
            <div class="admin-popup-section">
                <h3 class="admin-popup-section-title">👤 Информация о клиенте</h3>
                <div class="admin-popup-info-grid">
                    <div class="admin-popup-info-item">
                        <span class="admin-popup-label">Имя:</span>
                        <span class="admin-popup-value"><strong>${request.name}</strong></span>
                    </div>
                    <div class="admin-popup-info-item">
                        <span class="admin-popup-label">Телефон:</span>
                        <span class="admin-popup-value">
                            <a href="tel:${request.phone}">${request.phone}</a>
                        </span>
                    </div>
                    ${request.email ? `
                    <div class="admin-popup-info-item">
                        <span class="admin-popup-label">Email:</span>
                        <span class="admin-popup-value">
                            <a href="mailto:${request.email}">${request.email}</a>
                        </span>
                    </div>
                    ` : ''}
                    <div class="admin-popup-info-item">
                        <span class="admin-popup-label">Дата заявки:</span>
                        <span class="admin-popup-value">${formatDate(request.created_at)}</span>
                    </div>
                </div>
            </div>

            <!-- Request Details Section -->
            <div class="admin-popup-section">
                <h3 class="admin-popup-section-title">📋 Детали заявки</h3>
                <div class="admin-popup-info-grid">
                    <div class="admin-popup-info-item">
                        <span class="admin-popup-label">Тип заявки:</span>
                        <span class="admin-popup-value"><strong>${getRequestTypeLabel(request.request_type)}</strong></span>
                    </div>
                    ${request.course_id ? `
                    <div class="admin-popup-info-item">
                        <span class="admin-popup-label">Курс ID:</span>
                        <span class="admin-popup-value">${request.course_id}</span>
                    </div>
                    ` : ''}
                    ${request.certificate_amount ? `
                    <div class="admin-popup-info-item">
                        <span class="admin-popup-label">Сертификат:</span>
                        <span class="admin-popup-value">${request.certificate_amount.toLocaleString('ru-RU')} ₽</span>
                    </div>
                    ` : ''}
                    ${request.supervision_id ? `
                    <div class="admin-popup-info-item">
                        <span class="admin-popup-label">Супервизия ID:</span>
                        <span class="admin-popup-value">${request.supervision_id}</span>
                    </div>
                    ` : ''}
                </div>
            </div>

            <!-- Assignment Section -->
            <div class="admin-popup-section">
                <h3 class="admin-popup-section-title">⚙️ Управление заявкой</h3>
                <div class="admin-popup-info-grid">
                    <div class="admin-popup-info-item">
                        <span class="admin-popup-label">Специалист:</span>
                        <div class="admin-specialist-select-wrapper">
                            <input type="text" 
                                   class="admin-popup-select" 
                                   id="requestSpecialistSearch" 
                                   placeholder="Поиск специалиста..."
                                   autocomplete="off"
                                   onfocus="showSpecialistDropdown()"
                                   oninput="filterSpecialists(this.value)">
                            <input type="hidden" id="requestSpecialistId" value="${request.specialist_id || ''}">
                            <div class="admin-specialist-dropdown" id="specialistDropdown" style="display: none;">
                                <div class="admin-specialist-option" data-id="" onclick="selectSpecialist('', 'Не назначен')">
                                    Не назначен
                                </div>
                                ${specialists.map(spec => `
                                    <div class="admin-specialist-option" 
                                         data-id="${spec.id}" 
                                         data-name="${spec.name}"
                                         onclick="selectSpecialist(${spec.id}, '${spec.name}')">
                                        ${spec.name} (ID: ${spec.id})
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="admin-popup-info-item">
                        <span class="admin-popup-label">Статус:</span>
                        <select class="admin-popup-select" id="requestStatus">
                            <option value="new" ${request.status === 'new' ? 'selected' : ''}>🆕 Новая</option>
                            <option value="viewed" ${request.status === 'viewed' ? 'selected' : ''}>👁️ Просмотрена</option>
                            <option value="pending" ${request.status === 'pending' ? 'selected' : ''}>⏳ В обработке</option>
                            <option value="completed" ${request.status === 'completed' ? 'selected' : ''}>✅ Завершена</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Message Section -->
            ${request.message ? `
            <div class="admin-popup-section">
                <h3 class="admin-popup-section-title">💬 Сообщение клиента</h3>
                <div class="admin-popup-message">
                    ${request.message}
                </div>
            </div>
            ` : ''}

            <!-- Actions -->
            <div class="admin-popup-actions">
                <button class="admin-btn admin-btn-secondary" onclick="closeRequestPopup()">
                    Закрыть
                </button>
                <button class="admin-btn admin-btn-primary" onclick="saveRequestChanges(${requestId})">
                    💾 Сохранить изменения
                </button>
                ${!request.archived && !request.deleted ? `
                <button class="admin-btn admin-btn-secondary" onclick="archiveRequest(${requestId})">
                    📦 В архив
                </button>
                ` : ''}
                ${request.archived && !request.deleted ? `
                <button class="admin-btn admin-btn-secondary" onclick="archiveRequest(${requestId})">
                    🗑️ Удалить из архива
                </button>
                ` : ''}
                ${request.deleted ? `
                <button class="admin-btn admin-btn-secondary" onclick="restoreRequest(${requestId})">
                    ♻️ Восстановить
                </button>
                ` : ''}
                <button class="admin-btn admin-btn-danger" onclick="deleteRequest(${requestId})">
                    🗑️ ${request.deleted ? 'Удалить навсегда' : 'В корзину'}
                </button>
            </div>
        </div>
    `;

    popup.classList.add('active');

    // Close handlers
    popup.querySelector('.admin-popup-overlay').addEventListener('click', closeRequestPopup);
    popup.querySelector('.admin-popup-close').addEventListener('click', closeRequestPopup);
};

window.closeRequestPopup = function() {
    document.getElementById('requestPopup').classList.remove('active');
};

window.archiveRequest = async function(requestId) {
    const request = window.allRequests?.find(r => r.id === requestId);
    const isArchived = request?.archived === 1;
    
    const message = isArchived 
        ? 'Удалить заявку из архива? Она будет перемещена в корзину.' 
        : 'Архивировать эту заявку?';
    
    const confirmed = await adminConfirm(message);
    if (!confirmed) return;

    try {
        // Add remove=true query param if already archived
        const url = isArchived 
            ? API_CONFIG.getApiUrl(`requests/${requestId}/archive?remove=true`)
            : API_CONFIG.getApiUrl(`requests/${requestId}/archive`);
            
        const response = await fetch(url, {
            method: 'PUT'
        });

        const data = await response.json();

        if (data.success) {
            await adminSuccess(isArchived ? 'Заявка удалена из архива!' : 'Заявка архивирована!');
            closeRequestPopup();
            refreshRequestsView();
        } else {
            await adminError('Ошибка: ' + data.error);
        }
    } catch (error) {
        console.error('Error archiving request:', error);
        await adminError('Ошибка архивирования: ' + error.message);
    }
};

// Helper functions
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getRequestTypeLabel(type) {
    const labels = {
        'consultation': 'Общая консультация',
        'specialist': 'Запись к специалисту',
        'certificate': 'Покупка сертификата',
        'course': 'Покупка курса',
        'supervision': 'Супервизия',
        'urgent': 'Срочная консультация',
        'family': 'Семейная сессия'
    };
    return labels[type] || type;
}


// Specialist dropdown functions
window.showSpecialistDropdown = function() {
    const dropdown = document.getElementById('specialistDropdown');
    if (dropdown) {
        dropdown.style.display = 'block';
    }
};

window.hideSpecialistDropdown = function() {
    setTimeout(() => {
        const dropdown = document.getElementById('specialistDropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }, 200);
};

window.filterSpecialists = function(searchText) {
    const dropdown = document.getElementById('specialistDropdown');
    if (!dropdown) return;
    
    const options = dropdown.querySelectorAll('.admin-specialist-option');
    const search = searchText.toLowerCase();
    
    options.forEach(option => {
        const name = option.dataset.name?.toLowerCase() || '';
        const id = option.dataset.id || '';
        
        if (name.includes(search) || id.includes(search) || !searchText) {
            option.style.display = 'block';
        } else {
            option.style.display = 'none';
        }
    });
    
    dropdown.style.display = 'block';
};

window.selectSpecialist = function(id, name) {
    document.getElementById('requestSpecialistId').value = id;
    document.getElementById('requestSpecialistSearch').value = name;
    hideSpecialistDropdown();
};

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    const wrapper = document.querySelector('.admin-specialist-select-wrapper');
    if (wrapper && !wrapper.contains(e.target)) {
        hideSpecialistDropdown();
    }
});

// Set initial value
setTimeout(() => {
    const specialistId = document.getElementById('requestSpecialistId')?.value;
    if (specialistId) {
        const option = document.querySelector(`.admin-specialist-option[data-id="${specialistId}"]`);
        if (option) {
            document.getElementById('requestSpecialistSearch').value = option.dataset.name;
        }
    }
}, 100);


// Save request changes
window.saveRequestChanges = async function(requestId) {
    const status = document.getElementById('requestStatus').value;
    const specialistId = document.getElementById('requestSpecialistId').value;

    try {
        const response = await fetch(API_CONFIG.getApiUrl(`requests/${requestId}`), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: status,
                specialist_id: specialistId || null
            })
        });

        const data = await response.json();

        if (data.success) {
            await adminSuccess('Изменения сохранены!');
            closeRequestPopup();
            refreshRequestsView();
        } else {
            await adminError('Ошибка: ' + data.error);
        }
    } catch (error) {
        console.error('Error saving request:', error);
        await adminError('Ошибка сохранения: ' + error.message);
    }
};

// Restore request from archive/trash
window.restoreRequest = async function(requestId) {
    const confirmed = await adminConfirm('Восстановить эту заявку?');
    if (!confirmed) return;

    try {
        const response = await fetch(API_CONFIG.getApiUrl(`requests/${requestId}/restore`), {
            method: 'PUT'
        });

        const data = await response.json();

        if (data.success) {
            await adminSuccess('Заявка восстановлена!');
            closeRequestPopup();
            refreshRequestsView();
        } else {
            await adminError('Ошибка: ' + data.error);
        }
    } catch (error) {
        console.error('Error restoring request:', error);
        await adminError('Ошибка восстановления: ' + error.message);
    }
};

// Delete request (move to trash or permanent delete)
window.deleteRequest = async function(requestId) {
    const request = window.allRequests?.find(r => r.id === requestId);
    const isPermanent = request?.deleted === 1;
    
    const message = isPermanent 
        ? 'Удалить эту заявку НАВСЕГДА? Это действие нельзя отменить!' 
        : 'Переместить заявку в корзину?';
    
    const confirmed = await adminConfirm(message);
    if (!confirmed) return;

    try {
        // Add permanent=true query param if already deleted
        const url = isPermanent 
            ? API_CONFIG.getApiUrl(`requests/${requestId}?permanent=true`)
            : API_CONFIG.getApiUrl(`requests/${requestId}`);
            
        const response = await fetch(url, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            await adminSuccess(isPermanent ? 'Заявка удалена навсегда!' : 'Заявка перемещена в корзину!');
            closeRequestPopup();
            refreshRequestsView();
        } else {
            await adminError('Ошибка: ' + data.error);
        }
    } catch (error) {
        console.error('Error deleting request:', error);
        await adminError('Ошибка удаления: ' + error.message);
    }
};

// Helper function to refresh requests view after any action
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
