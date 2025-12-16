// Admin Promo Codes Management

let promoCodesData = [];

window.loadPromoCodes = async function() {
    const content = `
        <div class="admin-page-header">
            <h2 class="admin-page-title">Промокоды</h2>
            <button class="admin-btn admin-btn-primary" onclick="openPromoCodeModal()">
                ➕ Добавить промокод
            </button>
        </div>
        
        <div id="promoCodesContainer">
            <div class="admin-loading">Загрузка промокодов...</div>
        </div>
    `;
    
    document.getElementById('adminContent').innerHTML = content;
    await fetchPromoCodes();
};

async function fetchPromoCodes() {
    try {
        const response = await fetch(API_CONFIG.getApiUrl('promo-codes'));
        const result = await response.json();
        
        if (result.success) {
            promoCodesData = result.data;
            renderPromoCodes();
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Error fetching promo codes:', error);
        document.getElementById('promoCodesContainer').innerHTML = `
            <div class="admin-error-message">
                ❌ Ошибка загрузки промокодов: ${error.message}
            </div>
        `;
    }
}

function renderPromoCodes() {
    const container = document.getElementById('promoCodesContainer');
    
    if (promoCodesData.length === 0) {
        container.innerHTML = `
            <div class="admin-empty-state">
                <p>📝 Промокодов пока нет</p>
                <button class="admin-btn admin-btn-primary" onclick="openPromoCodeModal()">
                    Создать первый промокод
                </button>
            </div>
        `;
        return;
    }
    
    const html = `
        <div class="admin-table-wrapper">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Код</th>
                        <th>Скидка</th>
                        <th>Описание</th>
                        <th>Использовано</th>
                        <th>Срок действия</th>
                        <th>Статус</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${promoCodesData.map(promo => `
                        <tr>
                            <td><strong>${promo.code}</strong></td>
                            <td><span class="admin-badge admin-badge-success">${promo.discount}%</span></td>
                            <td>${promo.description || '-'}</td>
                            <td>${promo.used_count}${promo.max_uses > 0 ? ' / ' + promo.max_uses : ''}</td>
                            <td>
                                ${promo.valid_from ? new Date(promo.valid_from).toLocaleDateString('ru-RU') : '∞'} - 
                                ${promo.valid_until ? new Date(promo.valid_until).toLocaleDateString('ru-RU') : '∞'}
                            </td>
                            <td>
                                <span class="admin-badge ${promo.status === 'active' ? 'admin-badge-success' : 'admin-badge-secondary'}">
                                    ${promo.status === 'active' ? 'Активен' : 'Неактивен'}
                                </span>
                            </td>
                            <td>
                                <button class="admin-btn admin-btn-sm admin-btn-secondary" onclick="editPromoCode(${promo.id})">
                                    ✏️
                                </button>
                                <button class="admin-btn admin-btn-sm admin-btn-danger" onclick="deletePromoCode(${promo.id}, '${promo.code}')">
                                    🗑️
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = html;
}

window.openPromoCodeModal = function(promoId = null) {
    const promo = promoId ? promoCodesData.find(p => p.id === promoId) : null;
    const isEdit = !!promo;
    
    const modal = document.createElement('div');
    modal.className = 'admin-popup active';
    modal.id = 'promoCodeModal';
    modal.innerHTML = `
        <div class="admin-popup-overlay" onclick="closePromoCodeModal()"></div>
        <div class="admin-popup-content" style="max-width: 600px;">
            <button class="admin-popup-close" onclick="closePromoCodeModal()">&times;</button>
            <h2 class="admin-popup-title">${isEdit ? 'Редактировать промокод' : 'Новый промокод'}</h2>
            
            <form id="promoCodeForm" class="admin-form">
                <div class="admin-form-group">
                    <label class="admin-form-label">Код промокода *</label>
                    <input type="text" class="admin-form-input" id="promoCode" value="${promo?.code || ''}" 
                           placeholder="WELCOME10" required ${isEdit ? 'readonly' : ''}>
                    <small>Будет автоматически преобразован в верхний регистр</small>
                </div>
                
                <div class="admin-form-group">
                    <label class="admin-form-label">Скидка (%) *</label>
                    <input type="number" class="admin-form-input" id="promoDiscount" 
                           value="${promo?.discount || ''}" min="1" max="100" required placeholder="10">
                </div>
                
                <div class="admin-form-group">
                    <label class="admin-form-label">Описание</label>
                    <input type="text" class="admin-form-input" id="promoDescription" 
                           value="${promo?.description || ''}" placeholder="Скидка для новых клиентов">
                </div>
                
                <div class="admin-form-group">
                    <label class="admin-form-label">Максимальное количество использований</label>
                    <input type="number" class="admin-form-input" id="promoMaxUses" 
                           value="${promo?.max_uses || 0}" min="0" placeholder="0 = без ограничений">
                </div>
                
                <div class="admin-form-row">
                    <div class="admin-form-group">
                        <label class="admin-form-label">Действителен с</label>
                        <input type="date" class="admin-form-input" id="promoValidFrom" 
                               value="${promo?.valid_from ? promo.valid_from.split('T')[0] : ''}">
                    </div>
                    
                    <div class="admin-form-group">
                        <label class="admin-form-label">Действителен до</label>
                        <input type="date" class="admin-form-input" id="promoValidUntil" 
                               value="${promo?.valid_until ? promo.valid_until.split('T')[0] : ''}">
                    </div>
                </div>
                
                <div class="admin-form-group">
                    <label class="admin-form-label">Статус</label>
                    <select class="admin-form-input" id="promoStatus">
                        <option value="active" ${promo?.status === 'active' ? 'selected' : ''}>Активен</option>
                        <option value="inactive" ${promo?.status === 'inactive' ? 'selected' : ''}>Неактивен</option>
                    </select>
                </div>
                
                <div class="admin-form-actions">
                    <button type="button" class="admin-btn admin-btn-secondary" onclick="closePromoCodeModal()">
                        Отмена
                    </button>
                    <button type="submit" class="admin-btn admin-btn-primary">
                        💾 ${isEdit ? 'Сохранить' : 'Создать'}
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('promoCodeForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await savePromoCode(promoId);
    });
};

window.closePromoCodeModal = function() {
    const modal = document.getElementById('promoCodeModal');
    if (modal) modal.remove();
};

async function savePromoCode(promoId) {
    const data = {
        code: document.getElementById('promoCode').value.trim().toUpperCase(),
        discount: parseInt(document.getElementById('promoDiscount').value),
        description: document.getElementById('promoDescription').value.trim(),
        max_uses: parseInt(document.getElementById('promoMaxUses').value) || 0,
        valid_from: document.getElementById('promoValidFrom').value || null,
        valid_until: document.getElementById('promoValidUntil').value || null,
        status: document.getElementById('promoStatus').value
    };
    
    try {
        const url = promoId 
            ? API_CONFIG.getApiUrl(`promo-codes/${promoId}`)
            : API_CONFIG.getApiUrl('promo-codes');
        
        const response = await fetch(url, {
            method: promoId ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            closePromoCodeModal();
            await fetchPromoCodes();
            await adminSuccess(promoId ? 'Промокод обновлен!' : 'Промокод создан!');
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Error saving promo code:', error);
        await adminError('Ошибка: ' + error.message);
    }
}

window.editPromoCode = function(promoId) {
    openPromoCodeModal(promoId);
};

window.deletePromoCode = async function(promoId, code) {
    const confirmed = await adminConfirm(`Удалить промокод "${code}"?`);
    if (!confirmed) return;
    
    try {
        const response = await fetch(API_CONFIG.getApiUrl(`promo-codes/${promoId}`), {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            await fetchPromoCodes();
            await adminSuccess('Промокод удален!');
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Error deleting promo code:', error);
        await adminError('Ошибка удаления: ' + error.message);
    }
};
