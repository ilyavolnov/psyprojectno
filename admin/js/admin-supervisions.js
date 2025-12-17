// Admin Supervisions Management

window.loadSupervisions = async function() {
    try {
        const response = await fetch(API_CONFIG.getApiUrl('supervisions'));
        const data = await response.json();
        
        if (!data.success) {
            throw new Error('Failed to load supervisions');
        }
        
        const supervisions = data.data;
        
        const content = `
            <div class="admin-page-header">
                <h2 class="admin-page-title">Супервизии</h2>
                <button class="admin-btn admin-btn-primary" onclick="openSupervisionPopup()">
                    ➕ Добавить супервизию
                </button>
            </div>
            
            <div class="admin-table-container">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Имя</th>
                            <th>Название</th>
                            <th>Цена</th>
                            <th>Длительность</th>
                            <th>Опыт</th>
                            <th>Статус</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${supervisions.map(sup => `
                            <tr>
                                <td>${sup.id}</td>
                                <td>${sup.supervisors || '-'}</td>
                                <td>${sup.title}</td>
                                <td>${sup.price.toLocaleString('ru-RU')} ₽</td>
                                <td>${sup.duration || '-'}</td>
                                <td>${sup.experience || '-'}</td>
                                <td><span class="admin-status-badge admin-status-${sup.status}">${sup.status === 'active' ? 'Активна' : 'Неактивна'}</span></td>
                                <td>
                                    <div class="admin-actions">
                                        <button class="admin-action-btn admin-action-edit" onclick="openSupervisionPopup(${sup.id})">Редактировать</button>
                                        <button class="admin-action-btn admin-action-delete" onclick="deleteSupervision(${sup.id})">Удалить</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        document.getElementById('adminContent').innerHTML = content;
        
    } catch (error) {
        console.error('Error loading supervisions:', error);
        document.getElementById('adminContent').innerHTML = `
            <div class="admin-error-message">
                ❌ Ошибка загрузки супервизий: ${error.message}
            </div>
        `;
    }
};

window.openSupervisionPopup = async function(id = null) {
    let supervision = null;
    
    if (id) {
        try {
            const response = await fetch(API_CONFIG.getApiUrl(`supervisions/${id}`));
            const data = await response.json();
            if (data.success) {
                supervision = data.data;
            }
        } catch (error) {
            console.error('Error loading supervision:', error);
        }
    }
    
    const popup = document.createElement('div');
    popup.className = 'admin-popup active';
    popup.id = 'supervisionPopup';
    popup.innerHTML = `
        <div class="admin-popup-overlay"></div>
        <div class="admin-popup-content" style="max-width: 800px;">
            <button class="admin-popup-close" onclick="closeSupervisionPopup()">&times;</button>
            <h2 class="admin-popup-title">${supervision ? 'Редактировать супервизию' : 'Добавить супервизию'}</h2>
            
            <form id="supervisionForm" class="admin-form">
                <div class="admin-form-group">
                    <label class="admin-form-label">Название супервизии *</label>
                    <input type="text" class="admin-form-input" id="supervisionTitle" value="${supervision?.title || ''}" required>
                </div>
                
                <div class="admin-form-row">
                    <div class="admin-form-group">
                        <label class="admin-form-label">Супервизоры</label>
                        <input type="text" class="admin-form-input" id="supervisionSupervisors" value="${supervision?.supervisors || ''}" placeholder="Маргарита Румянцева">
                    </div>
                    <div class="admin-form-group">
                        <label class="admin-form-label">Дата</label>
                        <input type="text" class="admin-form-input" id="supervisionDate" value="${supervision?.date || ''}" placeholder="Каждую среду">
                    </div>
                </div>
                
                <div class="admin-form-row">
                    <div class="admin-form-group">
                        <label class="admin-form-label">Опыт</label>
                        <input type="text" class="admin-form-input" id="supervisionExperience" value="${supervision?.experience || ''}" placeholder="10+ лет">
                    </div>
                    <div class="admin-form-group">
                        <label class="admin-form-label">Длительность</label>
                        <input type="text" class="admin-form-input" id="supervisionDuration" value="${supervision?.duration || ''}" placeholder="55 минут">
                    </div>
                </div>
                
                <div class="admin-form-row">
                    <div class="admin-form-group">
                        <label class="admin-form-label">Цена (₽)</label>
                        <input type="number" class="admin-form-input" id="supervisionPrice" value="${supervision?.price || 0}">
                    </div>
                    <div class="admin-form-group">
                        <label class="admin-form-label">Примечание к цене</label>
                        <input type="text" class="admin-form-input" id="supervisionPriceNote" value="${supervision?.price_note || ''}" placeholder="за сессию">
                    </div>
                </div>
                
                <div class="admin-form-group">
                    <label class="admin-form-label">Описание</label>
                    <textarea class="admin-form-input" id="supervisionDescription" rows="4" placeholder="Описание супервизии">${supervision?.description || ''}</textarea>
                </div>
                
                <div class="admin-form-group">
                    <label class="admin-form-label">Особенности (по одной на строку)</label>
                    <textarea class="admin-form-input" id="supervisionFeatures" rows="6" placeholder="Особенность 1\nОсобенность 2">${supervision?.features?.join('\n') || ''}</textarea>
                </div>
                
                <div class="admin-form-group">
                    <label class="admin-form-label">Бонус</label>
                    <textarea class="admin-form-input" id="supervisionBonus" rows="2" placeholder="Дополнительные бонусы">${supervision?.bonus || ''}</textarea>
                </div>
                
                <div class="admin-form-group">
                    <label class="admin-form-label">Изображение</label>
                    <div class="admin-photo-upload">
                        <img src="${supervision?.image ? (supervision.image.startsWith('http') ? supervision.image : '/' + supervision.image) : '/images/hero-page.webp'}" alt="Preview" id="supervisionImagePreview" class="admin-photo-preview" onerror="this.src='/images/hero-page.webp'">
                        <div class="admin-photo-controls">
                            <input type="file" id="supervisionPhotoFile" accept="image/*" style="display: none;" onchange="handleSupervisionPhotoUpload(event)">
                            <button type="button" class="admin-btn admin-btn-secondary" onclick="document.getElementById('supervisionPhotoFile').click()">
                                📁 Загрузить файл
                            </button>
                            <input type="text" class="admin-form-input" id="supervisionImage" value="${supervision?.image || ''}" placeholder="или введите URL изображения">
                        </div>
                    </div>
                </div>

                <div class="admin-form-group">
                    <label class="admin-form-label">Статус</label>
                    <select class="admin-form-input" id="supervisionStatus">
                        <option value="active" ${!supervision || supervision.status === 'active' ? 'selected' : ''}>Активна</option>
                        <option value="inactive" ${supervision?.status === 'inactive' ? 'selected' : ''}>Неактивна</option>
                    </select>
                </div>

                <div class="admin-form-actions">
                    <button type="button" class="admin-btn admin-btn-secondary" onclick="closeSupervisionPopup()">Отмена</button>
                    <button type="submit" class="admin-btn admin-btn-primary">💾 ${supervision ? 'Сохранить' : 'Создать'}</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    document.getElementById('supervisionForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveSupervision(id);
    });
};

window.closeSupervisionPopup = function() {
    document.getElementById('supervisionPopup')?.remove();
};

window.saveSupervision = async function(id) {
    try {
        const data = {
            title: document.getElementById('supervisionTitle').value,
            supervisors: document.getElementById('supervisionSupervisors').value,
            date: document.getElementById('supervisionDate').value,
            experience: document.getElementById('supervisionExperience').value,
            price: parseInt(document.getElementById('supervisionPrice').value) || 0,
            duration: document.getElementById('supervisionDuration').value,
            price_note: document.getElementById('supervisionPriceNote').value,
            description: document.getElementById('supervisionDescription').value,
            features: document.getElementById('supervisionFeatures').value.split('\n').filter(f => f.trim()),
            bonus: document.getElementById('supervisionBonus').value,
            image: document.getElementById('supervisionImage').value,
            status: document.getElementById('supervisionStatus').value
        };
        
        const url = id 
            ? API_CONFIG.getApiUrl(`supervisions/${id}`)
            : API_CONFIG.getApiUrl('supervisions');
        
        const response = await fetch(url, {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            await adminSuccess(id ? 'Супервизия обновлена!' : 'Супервизия создана!');
            closeSupervisionPopup();
            loadSupervisions();
        } else {
            await adminError(result.error || 'Ошибка сохранения');
        }
    } catch (error) {
        console.error('Error saving supervision:', error);
        await adminError('Ошибка сохранения супервизии');
    }
};

window.deleteSupervision = async function(id) {
    const confirmed = await adminConfirm('Удалить эту супервизию?');
    if (!confirmed) return;
    
    try {
        const response = await fetch(API_CONFIG.getApiUrl(`supervisions/${id}`), {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            await adminSuccess('Супервизия удалена!');
            loadSupervisions();
        } else {
            await adminError(result.error || 'Ошибка удаления');
        }
    } catch (error) {
        console.error('Error deleting supervision:', error);
        await adminError('Ошибка удаления супервизии');
    }
};

// Photo upload handler for supervisions
window.handleSupervisionPhotoUpload = async function (event) {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
        await adminError('Пожалуйста, выберите изображение');
        return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        await adminError('Файл слишком большой. Максимум 5MB');
        return;
    }

    // Show loading state
    const preview = document.getElementById('supervisionImagePreview');
    const photoInput = document.getElementById('supervisionImage');
    const originalSrc = preview?.src;

    if (preview) {
        preview.style.opacity = '0.5';
    }

    try {
        // Upload to server
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(API_CONFIG.getApiUrl('upload/image'), {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            // Update preview and input with uploaded image path
            if (preview) {
                preview.src = '/' + result.data.path;  // Use absolute path from site root
                preview.style.opacity = '1';
            }
            if (photoInput) {
                photoInput.value = result.data.path;
            }

            await adminSuccess('Фото загружено успешно!');
        } else {
            throw new Error(result.error || 'Upload failed');
        }
    } catch (error) {
        console.error('Upload error:', error);
        await adminError('Ошибка загрузки: ' + error.message);

        // Restore original preview
        if (preview && originalSrc) {
            preview.src = originalSrc;
            preview.style.opacity = '1';
        }
    }
};

// Update image preview when URL is entered manually
document.addEventListener('DOMContentLoaded', function() {
    // Add event listener for image URL input (this will handle dynamic content as well)
    document.addEventListener('input', function(e) {
        if (e.target.id === 'supervisionImage') {
            const preview = document.getElementById('supervisionImagePreview');
            const value = e.target.value;
            if (preview && value) {
                preview.src = value.startsWith('http') ? value : '/' + value;
            }
        }
    });
});
