// Webinars Management
console.log('admin-webinars.js loaded');

// Load Webinars Page
window.loadWebinars = async function() {
    console.log('loadWebinars called');
    const pageTitle = document.getElementById('pageTitle');
    const pageSubtitle = document.getElementById('pageSubtitle');
    const adminContent = document.getElementById('adminContent');

    pageTitle.textContent = 'Вебинары';
    pageSubtitle.textContent = 'Управление вебинарами';

    // Load webinars from API
    let webinars = [];
    try {
        console.log('Loading webinars from API...');
        const response = await fetch(API_CONFIG.getApiUrl('courses?type=webinar'));
        const data = await response.json();
        console.log('Webinars API response:', data);
        if (data.success) {
            webinars = data.data;
        }
    } catch (error) {
        console.error('Error loading webinars:', error);
    }

    adminContent.innerHTML = `
        <div class="admin-section">
            <div class="admin-section-header">
                <h2 class="admin-section-title">Список вебинаров (${webinars.length})</h2>
                <button class="admin-btn admin-btn-primary" onclick="addWebinar()">
                    ➕ Добавить вебинар
                </button>
            </div>

            <div class="admin-courses-grid">
                ${webinars.map(webinar => {
                    const imagePath = webinar.image ? (webinar.image.startsWith('http') ? webinar.image : '/' + webinar.image) : '/images/hero-page.webp';
                    return `
                    <div class="admin-course-card">
                        <div class="admin-course-image">
                            <img src="${imagePath}" alt="${webinar.title}" onerror="this.src='/images/hero-page.webp'">
                        </div>
                        <div class="admin-course-info">
                            <h3 class="admin-course-title">${webinar.title}</h3>
                            <p class="admin-course-description">${webinar.subtitle || webinar.description || ''}</p>
                            <div class="admin-course-meta">
                                <span>💰 ${webinar.old_price ?
                                    `<span style="text-decoration: line-through; opacity: 0.7;">${webinar.old_price.toLocaleString('ru-RU')} ₽</span> ` +
                                    `<span style="background-color: #e74c3c; color: white; padding: 2px 8px; border-radius: 4px;">${webinar.price.toLocaleString('ru-RU')} ₽</span>` :
                                    (webinar.price ? webinar.price.toLocaleString('ru-RU') + ' ₽' : 'Бесплатно')}</span>
                                <span>📅 ${webinar.release_date || 'Не указано'}</span>
                            </div>
                        </div>
                        <div class="admin-course-actions">
                            <button class="admin-btn admin-btn-secondary" onclick="editWebinar(${webinar.id})">
                                ✏️ Редактировать
                            </button>
                            <button class="admin-btn admin-btn-danger" onclick="deleteWebinar(${webinar.id})">
                                🗑️ Удалить
                            </button>
                        </div>
                    </div>
                `;
                }).join('')}
            </div>
        </div>

        <!-- Edit Webinar Popup -->
        <div class="admin-popup" id="webinarPopup">
            <div class="admin-popup-overlay"></div>
            <div class="admin-popup-content wide">
                <button class="admin-popup-close">&times;</button>
                <h2 class="admin-popup-title" id="webinarPopupTitle">Редактировать вебинар</h2>
                <div class="admin-popup-body" id="webinarPopupBody">
                    <!-- Content will be loaded here -->
                </div>
            </div>
        </div>
    `;

    window.webinarsData = webinars;
};


// Load Certificates Page
window.loadCertificates = async function() {
    console.log('loadCertificates called');
    const pageTitle = document.getElementById('pageTitle');
    const pageSubtitle = document.getElementById('pageSubtitle');
    const adminContent = document.getElementById('adminContent');
    
    pageTitle.textContent = 'Сертификаты';
    pageSubtitle.textContent = 'Управление подарочными сертификатами';

    // Mock certificates data (в продакшене загружать из API)
    const certificates = [
        { id: 1, number: 'CERT-2024-001', amount: 5000, status: 'active', createdAt: '2024-11-01', usedAt: null, clientName: 'Анна Иванова', clientPhone: '+7 999 123-45-67' },
        { id: 2, number: 'CERT-2024-002', amount: 10000, status: 'used', createdAt: '2024-11-05', usedAt: '2024-11-10', clientName: 'Петр Сидоров', clientPhone: '+7 999 234-56-78' },
        { id: 3, number: 'CERT-2024-003', amount: 3000, status: 'cancelled', createdAt: '2024-11-08', usedAt: null, clientName: 'Мария Петрова', clientPhone: '+7 999 345-67-89' },
    ];

    const stats = {
        total: certificates.length,
        active: certificates.filter(c => c.status === 'active').length,
        used: certificates.filter(c => c.status === 'used').length,
        cancelled: certificates.filter(c => c.status === 'cancelled').length,
        totalAmount: certificates.filter(c => c.status === 'active').reduce((sum, c) => sum + c.amount, 0)
    };

    adminContent.innerHTML = `
        <!-- Stats -->
        <div class="admin-stats-grid" style="grid-template-columns: repeat(5, 1fr); margin-bottom: 30px;">
            <div class="admin-stat-card">
                <div class="admin-stat-header">
                    <span class="admin-stat-title">Всего</span>
                    <span class="admin-stat-icon">🎁</span>
                </div>
                <div class="admin-stat-value">${stats.total}</div>
            </div>
            <div class="admin-stat-card">
                <div class="admin-stat-header">
                    <span class="admin-stat-title">Активные</span>
                    <span class="admin-stat-icon">✅</span>
                </div>
                <div class="admin-stat-value">${stats.active}</div>
            </div>
            <div class="admin-stat-card">
                <div class="admin-stat-header">
                    <span class="admin-stat-title">Использованы</span>
                    <span class="admin-stat-icon">✔️</span>
                </div>
                <div class="admin-stat-value">${stats.used}</div>
            </div>
            <div class="admin-stat-card">
                <div class="admin-stat-header">
                    <span class="admin-stat-title">Аннулированы</span>
                    <span class="admin-stat-icon">❌</span>
                </div>
                <div class="admin-stat-value">${stats.cancelled}</div>
            </div>
            <div class="admin-stat-card">
                <div class="admin-stat-header">
                    <span class="admin-stat-title">Сумма активных</span>
                    <span class="admin-stat-icon">💰</span>
                </div>
                <div class="admin-stat-value">${stats.totalAmount.toLocaleString('ru-RU')} ₽</div>
            </div>
        </div>

        <!-- Search and Actions -->
        <div class="admin-filters">
            <input type="text" id="searchCertificate" class="admin-filter-select" placeholder="🔍 Поиск по номеру сертификата...">
            
            <select class="admin-filter-select" id="filterCertStatus">
                <option value="">Все статусы</option>
                <option value="active">Активные</option>
                <option value="used">Использованы</option>
                <option value="cancelled">Аннулированы</option>
            </select>

            <button class="admin-btn admin-btn-primary" onclick="createCertificate()">
                ➕ Создать сертификат
            </button>
        </div>

        <!-- Certificates Table -->
        <div class="admin-section">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Номер</th>
                        <th>Номинал</th>
                        <th>Клиент</th>
                        <th>Телефон</th>
                        <th>Дата создания</th>
                        <th>Дата использования</th>
                        <th>Статус</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody id="certificatesTableBody">
                    ${certificates.map(cert => `
                        <tr>
                            <td><strong>${cert.number}</strong></td>
                            <td>${cert.amount.toLocaleString('ru-RU')} ₽</td>
                            <td>${cert.clientName}</td>
                            <td>${cert.clientPhone}</td>
                            <td>${formatDate(cert.createdAt)}</td>
                            <td>${cert.usedAt ? formatDate(cert.usedAt) : '-'}</td>
                            <td><span class="admin-cert-status admin-cert-status-${cert.status}">${getCertStatusText(cert.status)}</span></td>
                            <td>
                                <div class="admin-actions">
                                    <button class="admin-action-btn admin-action-view" onclick="viewCertificate('${cert.number}')">Открыть</button>
                                    ${cert.status === 'active' ? `
                                        <button class="admin-action-btn admin-action-delete" onclick="cancelCertificate('${cert.number}')">Аннулировать</button>
                                    ` : ''}
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <!-- Create Certificate Popup -->
        <div class="admin-popup" id="certificatePopup">
            <div class="admin-popup-overlay"></div>
            <div class="admin-popup-content">
                <button class="admin-popup-close">&times;</button>
                <h2 class="admin-popup-title">Создать сертификат</h2>
                <div class="admin-popup-body">
                    <form class="admin-form" id="certificateForm">
                        <div class="admin-form-group">
                            <label class="admin-form-label">Номинал *</label>
                            <select class="admin-form-input" id="certAmount" required>
                                <option value="">Выберите номинал</option>
                                <option value="3000">3 000 ₽</option>
                                <option value="5000">5 000 ₽</option>
                                <option value="10000">10 000 ₽</option>
                                <option value="15000">15 000 ₽</option>
                                <option value="20000">20 000 ₽</option>
                                <option value="custom">Другая сумма</option>
                            </select>
                        </div>
                        <div class="admin-form-group" id="customAmountGroup" style="display: none;">
                            <label class="admin-form-label">Укажите сумму (₽)</label>
                            <input type="number" class="admin-form-input" id="certCustomAmount" min="1000" step="100">
                        </div>
                        <div class="admin-form-group">
                            <label class="admin-form-label">Имя клиента *</label>
                            <input type="text" class="admin-form-input" id="certClientName" required>
                        </div>
                        <div class="admin-form-group">
                            <label class="admin-form-label">Телефон клиента *</label>
                            <input type="tel" class="admin-form-input" id="certClientPhone" required>
                        </div>
                        <div class="admin-form-group">
                            <label class="admin-form-label">Примечание</label>
                            <textarea class="admin-form-input" id="certNote" rows="3"></textarea>
                        </div>
                        <div class="admin-form-actions">
                            <button type="button" class="admin-btn admin-btn-secondary" onclick="closeCertificatePopup()">Отмена</button>
                            <button type="submit" class="admin-btn admin-btn-primary">💾 Создать</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    window.certificatesData = certificates;

    // Initialize search
    document.getElementById('searchCertificate').addEventListener('input', filterCertificates);
    document.getElementById('filterCertStatus').addEventListener('change', filterCertificates);
    
    // Custom amount toggle
    const amountSelect = document.getElementById('certAmount');
    if (amountSelect) {
        amountSelect.addEventListener('change', function() {
            const customGroup = document.getElementById('customAmountGroup');
            if (this.value === 'custom') {
                customGroup.style.display = 'block';
            } else {
                customGroup.style.display = 'none';
            }
        });
    }
};

function getCertStatusText(status) {
    const statuses = {
        'active': 'Активен',
        'used': 'Использован',
        'cancelled': 'Аннулирован'
    };
    return statuses[status] || status;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}


// Certificate Functions
window.createCertificate = function() {
    const popup = document.getElementById('certificatePopup');
    popup.classList.add('active');
    
    // Close handlers
    popup.querySelector('.admin-popup-overlay').addEventListener('click', closeCertificatePopup);
    popup.querySelector('.admin-popup-close').addEventListener('click', closeCertificatePopup);
    
    // Form handler
    document.getElementById('certificateForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveCertificate();
    });
};

window.closeCertificatePopup = function() {
    document.getElementById('certificatePopup').classList.remove('active');
    document.getElementById('certificateForm').reset();
};

window.saveCertificate = async function() {
    const amountSelect = document.getElementById('certAmount').value;
    const amount = amountSelect === 'custom' ? 
        document.getElementById('certCustomAmount').value : 
        amountSelect;
    
    const data = {
        amount: parseInt(amount),
        clientName: document.getElementById('certClientName').value,
        clientPhone: document.getElementById('certClientPhone').value,
        note: document.getElementById('certNote').value,
        number: 'CERT-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 10000)).padStart(4, '0')
    };

    console.log('Creating certificate:', data);
    await adminSuccess(`Сертификат создан!\nНомер: ${data.number}\nНоминал: ${data.amount.toLocaleString('ru-RU')} ₽`);
    
    closeCertificatePopup();
    loadCertificates();
};

window.viewCertificate = async function(number) {
    const cert = window.certificatesData.find(c => c.number === number);
    if (!cert) return;
    
    await adminAlert(`Сертификат ${number}\nНоминал: ${cert.amount.toLocaleString('ru-RU')} ₽\nКлиент: ${cert.clientName}\nСтатус: ${getCertStatusText(cert.status)}`);
};

window.cancelCertificate = async function(number) {
    const confirmed = await adminConfirm(`Аннулировать сертификат ${number}?`);
    if (!confirmed) return;
    
    console.log('Cancelling certificate:', number);
    await adminSuccess('Сертификат аннулирован!');
    loadCertificates();
};

window.filterCertificates = function() {
    const search = document.getElementById('searchCertificate').value.toLowerCase();
    const status = document.getElementById('filterCertStatus').value;
    
    let filtered = window.certificatesData;
    
    if (search) {
        filtered = filtered.filter(c => c.number.toLowerCase().includes(search));
    }
    
    if (status) {
        filtered = filtered.filter(c => c.status === status);
    }
    
    const tbody = document.getElementById('certificatesTableBody');
    tbody.innerHTML = filtered.map(cert => `
        <tr>
            <td><strong>${cert.number}</strong></td>
            <td>${cert.amount.toLocaleString('ru-RU')} ₽</td>
            <td>${cert.clientName}</td>
            <td>${cert.clientPhone}</td>
            <td>${formatDate(cert.createdAt)}</td>
            <td>${cert.usedAt ? formatDate(cert.usedAt) : '-'}</td>
            <td><span class="admin-cert-status admin-cert-status-${cert.status}">${getCertStatusText(cert.status)}</span></td>
            <td>
                <div class="admin-actions">
                    <button class="admin-action-btn admin-action-view" onclick="viewCertificate('${cert.number}')">Открыть</button>
                    ${cert.status === 'active' ? `
                        <button class="admin-action-btn admin-action-delete" onclick="cancelCertificate('${cert.number}')">Аннулировать</button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
};

// Webinar Functions
window.addWebinar = function() {
    openWebinarPopup();
};

window.editWebinar = async function(id) {
    let webinar = window.webinarsData.find(w => w.id === id);

    if (!webinar) {
        try {
            const response = await fetch(API_CONFIG.getApiUrl(`courses/${id}`));
            const data = await response.json();
            if (data.success) {
                webinar = data.data;
            }
        } catch (error) {
            console.error('Error loading webinar:', error);
            await adminError('Ошибка загрузки вебинара');
            return;
        }
    }

    if (!webinar) return;
    openWebinarPopup(webinar);
};

window.deleteWebinar = async function(id) {
    const confirmed = await adminConfirm('Удалить этот вебинар?', 'Подтверждение удаления');
    if (!confirmed) return;

    try {
        const response = await fetch(API_CONFIG.getApiUrl(`courses/${id}`), {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            await adminSuccess('Вебинар удален!');
            loadWebinars();
        } else {
            await adminError('Ошибка: ' + data.error);
        }
    } catch (error) {
        console.error('Error deleting webinar:', error);
        await adminError('Ошибка удаления: ' + error.message);
    }
};


function openWebinarPopup(webinar = null) {
    const popup = document.getElementById('webinarPopup');
    const title = document.getElementById('webinarPopupTitle');
    const body = document.getElementById('webinarPopupBody');

    title.textContent = webinar ? `Редактировать: ${webinar.title}` : 'Создать новый вебинар';

    const imagePath = webinar?.image ? (webinar.image.startsWith('http') ? webinar.image : '/' + webinar.image) : '/images/hero-page.webp';

    // Store current webinar for blocks
    window.currentEditingWebinar = webinar;

    body.innerHTML = `
        <!-- Tabs -->
        <div class="admin-tabs" style="margin-bottom: 20px;">
            <button class="admin-tab active" data-tab="main" onclick="switchWebinarTab('main')">Основное</button>
            <button class="admin-tab" data-tab="blocks" onclick="switchWebinarTab('blocks')">Блоки страницы</button>
        </div>

        <!-- Main Tab -->
        <div id="webinarTabMain" class="admin-tab-content active">
        <form class="admin-form" id="webinarForm">
            <div class="admin-form-row">
                <div class="admin-form-group">
                    <label class="admin-form-label">Название вебинара *</label>
                    <input type="text" class="admin-form-input" id="webinarTitle" value="${webinar?.title || ''}" required>
                </div>
                <div class="admin-form-group">
                    <label class="admin-form-label">Подзаголовок</label>
                    <input type="text" class="admin-form-input" id="webinarSubtitle" value="${webinar?.subtitle || ''}">
                </div>
            </div>

            <div class="admin-form-row">
                <div class="admin-form-group">
                    <label class="admin-form-label">Цена (₽) *</label>
                    <input type="number" class="admin-form-input" id="webinarPrice" value="${webinar?.price || ''}" required>
                </div>
                <div class="admin-form-group">
                    <label class="admin-form-label">Зачеркнутая цена (₽)</label>
                    <input type="number" class="admin-form-input" id="webinarOldPrice" value="${webinar?.old_price || ''}" placeholder="Старая цена">
                </div>
            </div>
            <div class="admin-form-row">
                <div class="admin-form-group">
                    <label class="admin-form-label">Статус</label>
                    <select class="admin-form-input" id="webinarStatus">
                        <option value="available" ${webinar?.status === 'available' ? 'selected' : ''}>Доступен</option>
                        <option value="coming_soon" ${webinar?.status === 'coming_soon' ? 'selected' : ''}>Скоро</option>
                        <option value="sold_out" ${webinar?.status === 'sold_out' ? 'selected' : ''}>Продано</option>
                    </select>
                </div>
            </div>

            <div class="admin-form-group">
                <label class="admin-form-label">Изображение</label>
                <div class="admin-photo-upload">
                    <img src="${imagePath}" alt="Preview" id="webinarImagePreview" class="admin-photo-preview" onerror="this.src='/images/hero-page.webp'">
                    <div class="admin-photo-controls">
                        <input type="file" id="webinarPhotoFile" accept="image/*" style="display: none;" onchange="handleWebinarPhotoUpload(event)">
                        <button type="button" class="admin-btn admin-btn-secondary" onclick="document.getElementById('webinarPhotoFile').click()">
                            📁 Загрузить файл
                        </button>
                        <input type="text" class="admin-form-input" id="webinarImage" value="${webinar?.image || ''}" placeholder="или введите URL изображения">
                    </div>
                </div>
            </div>

            <div class="admin-form-row">
                <div class="admin-form-group">
                    <label class="admin-form-label">Дата старта (для отображения)</label>
                    <input type="text" class="admin-form-input" id="webinarReleaseDate" value="${webinar?.release_date || ''}" placeholder="10 НОЯБРЯ">
                    <small style="color: #999; font-size: 12px;">Текст для отображения, например "10 НОЯБРЯ"</small>
                </div>
                <div class="admin-form-group">
                    <label class="admin-form-label">Дата старта (для счетчика)</label>
                    <input type="datetime-local" class="admin-form-input" id="webinarStartDate" value="${webinar?.start_date || ''}">
                    <small style="color: #999; font-size: 12px;">Точная дата и время для обратного отсчета</small>
                </div>
            </div>

            <div class="admin-form-row">
                <div class="admin-form-group">
                    <label class="admin-form-label">WhatsApp номер</label>
                    <input type="text" class="admin-form-input" id="webinarWhatsapp" value="${webinar?.whatsapp_number || ''}" placeholder="89211880755">
                </div>
                <div class="admin-form-group">
                    <!-- Empty for layout -->
                </div>
            </div>

            <div class="admin-form-group">
                <label class="admin-form-label">Описание вебинара</label>
                <textarea class="admin-form-input" id="webinarDescription" rows="4">${webinar?.description || ''}</textarea>
            </div>

            <div class="admin-form-group">
                <label class="admin-form-label">Темы вебинара (по одной на строку)</label>
                <textarea class="admin-form-input" id="webinarTopics" rows="8" placeholder="Почему мы переедаем?
Прокрастинация через еду
Переедание выходного дня">${webinar?.topics ? (Array.isArray(webinar.topics) ? webinar.topics.join('\n') : webinar.topics) : ''}</textarea>
            </div>

            <div class="admin-form-row">
                <div class="admin-form-group">
                    <label class="admin-form-label">Длительность доступа</label>
                    <input type="text" class="admin-form-input" id="webinarAccessDuration" value="${webinar?.access_duration || ''}" placeholder="3 недели">
                </div>
                <div class="admin-form-group">
                    <label class="admin-form-label">Обратная связь</label>
                    <input type="text" class="admin-form-input" id="webinarFeedbackDuration" value="${webinar?.feedback_duration || ''}" placeholder="Индивидуальное сопровождение">
                </div>
            </div>


            <div class="admin-form-group">
                <label class="admin-form-label">Автор вебинара</label>
                <input type="text" class="admin-form-input" id="webinarAuthorName" value="${webinar?.author_name || 'Маргарита Румянцева'}">
            </div>

            <div class="admin-form-group">
                <label class="admin-form-label">Описание автора</label>
                <textarea class="admin-form-input" id="webinarAuthorDescription" rows="6">${webinar?.author_description || 'Врач-психиатр, психотерапевт, сексолог (стаж с 2009 г.)'}</textarea>
            </div>

            <div class="admin-form-actions">
                <button type="button" class="admin-btn admin-btn-secondary" onclick="closeWebinarPopup()">Отмена</button>
                <button type="submit" class="admin-btn admin-btn-primary">💾 ${webinar ? 'Сохранить' : 'Создать'}</button>
            </div>
        </form>
        </div>

        <!-- Blocks Tab -->
        <div id="webinarTabBlocks" class="admin-tab-content" style="display: none;">
            <div class="admin-blocks-header">
                <h3>Блоки страницы вебинара</h3>
                <div class="admin-block-type-buttons">
                    <button class="admin-btn admin-btn-sm admin-btn-secondary" onclick="addWebinarBlock('hero')" title="Главный блок">
                        🎯 Hero
                    </button>
                    <button class="admin-btn admin-btn-sm admin-btn-secondary" onclick="addWebinarBlock('description')" title="Блок с описанием">
                        📝 Описание
                    </button>
                    <button class="admin-btn admin-btn-sm admin-btn-secondary" onclick="addWebinarBlock('program')" title="Программа вебинара">
                        📋 Программа
                    </button>
                    <button class="admin-btn admin-btn-sm admin-btn-secondary" onclick="addWebinarBlock('features')" title="Преимущества">
                        ✨ Преимущества
                    </button>
                    <button class="admin-btn admin-btn-sm admin-btn-secondary" onclick="addWebinarBlock('author')" title="Автор вебинара">
                        👤 Автор
                    </button>
                </div>
            </div>
            <div id="webinarBlocksContainer" class="admin-blocks-container">
                <!-- Blocks will be rendered here -->
            </div>
            <div class="admin-blocks-footer">
                <button type="button" class="admin-btn admin-btn-primary" onclick="saveWebinarBlocks(${webinar?.id})">
                    💾 Сохранить блоки
                </button>
            </div>
        </div>
    `;

    popup.classList.add('active');

    // Initialize webinar blocks
    const existingBlocks = webinar?.page_blocks ? JSON.parse(webinar.page_blocks) : [];
    initWebinarBlocks(existingBlocks);

    // Close handlers
    popup.querySelector('.admin-popup-overlay').addEventListener('click', closeWebinarPopup);
    popup.querySelector('.admin-popup-close').addEventListener('click', closeWebinarPopup);

    // Form handler
    document.getElementById('webinarForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveWebinar(webinar?.id);
    });

    // Image preview update
    document.getElementById('webinarImage').addEventListener('input', function(e) {
        const preview = document.getElementById('webinarImagePreview');
        const value = e.target.value;
        if (value) {
            preview.src = value.startsWith('http') ? value : '/' + value;
        }
    });
}

// Switch webinar tabs
window.switchWebinarTab = function(tabName) {
    // Update tab buttons
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.admin-tab-content').forEach(content => {
        content.style.display = 'none';
    });

    if (tabName === 'main') {
        document.getElementById('webinarTabMain').style.display = 'block';
    } else if (tabName === 'blocks') {
        document.getElementById('webinarTabBlocks').style.display = 'block';
    }
};

window.closeWebinarPopup = function() {
    document.getElementById('webinarPopup').classList.remove('active');
};

window.saveWebinar = async function(webinarId) {
    const topicsText = document.getElementById('webinarTopics').value;
    const topics = topicsText.split('\n').filter(t => t.trim()).map(t => t.trim());

    const data = {
        title: document.getElementById('webinarTitle').value,
        subtitle: document.getElementById('webinarSubtitle').value,
        description: document.getElementById('webinarDescription').value,
        price: parseInt(document.getElementById('webinarPrice').value),
        old_price: document.getElementById('webinarOldPrice').value ? parseInt(document.getElementById('webinarOldPrice').value) : null,
        status: document.getElementById('webinarStatus').value,
        image: document.getElementById('webinarImage').value,
        release_date: document.getElementById('webinarReleaseDate').value,
        start_date: document.getElementById('webinarStartDate').value,
        access_duration: document.getElementById('webinarAccessDuration').value,
        feedback_duration: document.getElementById('webinarFeedbackDuration').value,
        whatsapp_number: document.getElementById('webinarWhatsapp').value,
        topics: topics,
        author_name: document.getElementById('webinarAuthorName').value,
        author_description: document.getElementById('webinarAuthorDescription').value,
        page_blocks: JSON.stringify(getWebinarBlocksData()),
        type: 'webinar'
    };

    try {
        const url = webinarId ?
            API_CONFIG.getApiUrl(`courses/${webinarId}`) :
            API_CONFIG.getApiUrl('courses');

        const method = webinarId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            await adminSuccess(`Вебинар ${webinarId ? 'обновлен' : 'создан'} успешно!`);
            closeWebinarPopup();
            loadWebinars();
        } else {
            await adminError('Ошибка: ' + result.error);
        }
    } catch (error) {
        console.error('Error saving webinar:', error);
        await adminError('Ошибка сохранения: ' + error.message);
    }
};

// Save only webinar blocks
window.saveWebinarBlocks = async function(webinarId) {
    if (!webinarId) {
        await adminError('Сначала сохраните основную информацию о вебинаре');
        return;
    }

    const blocksData = getWebinarBlocksData();

    try {
        const response = await fetch(API_CONFIG.getApiUrl(`courses/${webinarId}`), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                page_blocks: JSON.stringify(blocksData)
            })
        });

        const result = await response.json();

        if (result.success) {
            await adminSuccess('Блоки страницы сохранены успешно!');
        } else {
            await adminError('Ошибка: ' + result.error);
        }
    } catch (error) {
        console.error('Error saving webinar blocks:', error);
        await adminError('Ошибка сохранения блоков: ' + error.message);
    }
};


// Photo upload handler for webinars
window.handleWebinarPhotoUpload = async function (event) {
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
    const preview = document.getElementById('webinarImagePreview');
    const photoInput = document.getElementById('webinarImage');
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
                preview.src = '/' + result.data.path;
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

// Webinar-specific block functions
window.initWebinarBlocks = function(existingBlocks = []) {
    window.currentWebinarBlocks = existingBlocks.length > 0 ? existingBlocks : [];
    renderWebinarBlocks();
};

// Render webinar blocks
function renderWebinarBlocks() {
    const container = document.getElementById('webinarBlocksContainer');
    if (!container) return;

    const blocks = window.currentWebinarBlocks || [];

    if (blocks.length === 0) {
        container.innerHTML = `
            <div class="admin-empty-state">
                <p>Блоки не добавлены. Выберите тип блока выше.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = blocks.map((block, index) => generateWebinarBlockEditor(block, index)).join('');

    // Attach event listeners for field updates
    attachWebinarBlockFieldListeners();
}

// Generate block HTML for editing
function generateWebinarBlockEditor(block, index) {
    const blockType = getWebinarBlockType(block.type);

    return `
        <div class="admin-block-item" data-block-index="${index}" draggable="false">
            <div class="admin-block-header">
                <div class="admin-block-drag-handle" draggable="true" title="Перетащите для изменения порядка">⋮⋮</div>
                <span class="admin-block-icon">${blockType.icon}</span>
                <span class="admin-block-type-name">${blockType.name}</span>
                <div class="admin-block-actions">
                    <button type="button" class="admin-block-move-up-btn" onclick="moveWebinarBlockUp(${index})" ${index === 0 ? 'disabled' : ''} title="Переместить вверх">
                        ↑
                    </button>
                    <button type="button" class="admin-block-move-down-btn" onclick="moveWebinarBlockDown(${index})" title="Переместить вниз">
                        ↓
                    </button>
                    <button type="button" class="admin-block-toggle-btn" onclick="toggleWebinarBlock(${index})" title="Свернуть/Развернуть">
                        <span class="toggle-icon">▼</span>
                    </button>
                    <button type="button" class="admin-block-delete-btn" onclick="deleteWebinarBlock(${index})" title="Удалить блок">
                        ✕
                    </button>
                </div>
            </div>
            <div class="admin-block-body" id="webinarBlockBody${index}">
                ${generateWebinarBlockFields(block, index)}
            </div>
        </div>
    `;
}

// Get webinar-specific block type with proper naming
function getWebinarBlockType(type) {
    const baseTypes = {
        hero: {
            name: 'Главный блок (Hero)',
            icon: '🎯'
        },
        description: {
            name: 'Описание',
            icon: '📝'
        },
        program: {
            name: 'Программа вебинара',
            icon: '📋'
        },
        features: {
            name: 'Преимущества',
            icon: '✨'
        },
        author: {
            name: 'Автор вебинара',
            icon: '👤'
        }
    };

    return baseTypes[type] || { name: 'Неизвестный блок', icon: '📄' };
}

// Generate fields based on block type for webinars
function generateWebinarBlockFields(block, index) {
    const type = block.type;
    const data = block.data || {};

    switch(type) {
        case 'hero':
            return `
                <div class="admin-form-group">
                    <label class="admin-form-label">Изображение</label>
                    <div class="admin-image-upload-container">
                        <input type="text" class="admin-form-input webinar-block-field"
                               data-block-index="${index}" data-field="image"
                               value="${data.image || ''}" placeholder="URL изображения">
                        <div class="admin-image-upload-buttons">
                            <button type="button" class="admin-btn-secondary" onclick="triggerWebinarBlockImageUpload(${index}, 'image')">
                                📁 Загрузить
                            </button>
                            <button type="button" class="admin-btn-secondary" onclick="pasteWebinarBlockImageFromClipboard(${index}, 'image')">
                                📋 Вставить
                            </button>
                        </div>
                        <input type="file" id="webinarBlockImageUpload_${index}_image" accept="image/*" style="display: none;" onchange="handleWebinarBlockImageUpload(event, ${index}, 'image')">
                    </div>
                    ${data.image ? `<div class="admin-image-preview"><img src="${data.image.startsWith('http') ? data.image : '/' + data.image}" alt="Preview" style="max-width: 200px; max-height: 150px; margin-top: 10px; border-radius: 8px;"></div>` : ''}
                </div>
                <div class="admin-form-group">
                    <label class="admin-form-label">Название вебинара</label>
                    <input type="text" class="admin-form-input webinar-block-field"
                           data-block-index="${index}" data-field="title"
                           value="${data.title || ''}" placeholder="Название вебинара">
                </div>
                <div class="admin-form-row">
                    <div class="admin-form-group">
                        <label class="admin-form-label">Цена (₽)</label>
                        <input type="number" class="admin-form-input webinar-block-field"
                               data-block-index="${index}" data-field="price"
                               value="${data.price || 0}">
                    </div>
                    <div class="admin-form-group">
                        <label class="admin-form-label">Зачеркнутая цена (₽)</label>
                        <input type="number" class="admin-form-input webinar-block-field"
                               data-block-index="${index}" data-field="oldPrice"
                               value="${data.oldPrice || ''}" placeholder="Старая цена">
                    </div>
                </div>
                <div class="admin-form-row">
                    <div class="admin-form-group">
                        <label class="admin-form-label">Дата старта</label>
                        <input type="text" class="admin-form-input webinar-block-field"
                               data-block-index="${index}" data-field="startDate"
                               value="${data.startDate || ''}" placeholder="10 ноября">
                    </div>
                </div>
                <div class="admin-form-group">
                    <label class="admin-form-label">Инструкция по оплате</label>
                    <textarea class="admin-form-input webinar-block-field" rows="3"
                              data-block-index="${index}" data-field="paymentInstructions"
                              placeholder="Инструкция по оплате">${data.paymentInstructions || ''}</textarea>
                </div>
            `;

        case 'description':
            return `
                <div class="admin-form-group">
                    <label class="admin-form-label">Изображение</label>
                    <div class="admin-image-upload-container">
                        <input type="text" class="admin-form-input webinar-block-field"
                               data-block-index="${index}" data-field="image"
                               value="${data.image || ''}" placeholder="URL изображения">
                        <div class="admin-image-upload-buttons">
                            <button type="button" class="admin-btn-secondary" onclick="triggerWebinarBlockImageUpload(${index}, 'image')">
                                📁 Загрузить
                            </button>
                            <button type="button" class="admin-btn-secondary" onclick="pasteWebinarBlockImageFromClipboard(${index}, 'image')">
                                📋 Вставить
                            </button>
                        </div>
                        <input type="file" id="webinarBlockImageUpload_${index}_image" accept="image/*" style="display: none;" onchange="handleWebinarBlockImageUpload(event, ${index}, 'image')">
                    </div>
                    ${data.image ? `<div class="admin-image-preview"><img src="${data.image.startsWith('http') ? data.image : '/' + data.image}" alt="Preview" style="max-width: 200px; max-height: 150px; margin-top: 10px; border-radius: 8px;"></div>` : ''}
                </div>
                <div class="admin-form-group">
                    <label class="admin-form-label">Заголовок</label>
                    <input type="text" class="admin-form-input webinar-block-field"
                           data-block-index="${index}" data-field="title"
                           value="${data.title || ''}" placeholder="Заголовок">
                </div>
                <div class="admin-form-group">
                    <label class="admin-form-label">Подзаголовок/Описание</label>
                    <textarea class="admin-form-input webinar-block-field" rows="3"
                              data-block-index="${index}" data-field="subtitle"
                              placeholder="Описание">${data.subtitle || ''}</textarea>
                </div>
                <div class="admin-form-group">
                    <label class="admin-form-label">Тип контента</label>
                    <input type="text" class="admin-form-input webinar-block-field"
                           data-block-index="${index}" data-field="contentType"
                           value="${data.contentType || ''}" placeholder="Лекция + презентация">
                </div>
            `;

        case 'program':
            const programItems = data.items || [];
            return `
                <div class="admin-form-group">
                    <label class="admin-form-label">Заголовок блока</label>
                    <input type="text" class="admin-form-input webinar-block-field"
                           data-block-index="${index}" data-field="title"
                           value="${data.title || 'Программа вебинара'}" placeholder="Заголовок">
                </div>
                <div class="admin-form-group">
                    <label class="admin-form-label">Пункты программы (по одному на строку)</label>
                    <textarea class="admin-form-input webinar-block-field" rows="8"
                              data-block-index="${index}" data-field="items"
                              placeholder="Пункт 1\nПункт 2\nПункт 3">${programItems.map(item => typeof item === 'string' ? item : item.text).join('\n')}</textarea>
                </div>
            `;

        case 'features':
            const featureItems = data.items || [];
            return `
                <div class="admin-form-group">
                    <label class="admin-form-label">Изображение</label>
                    <div class="admin-image-upload-container">
                        <input type="text" class="admin-form-input webinar-block-field"
                               data-block-index="${index}" data-field="image"
                               value="${data.image || ''}" placeholder="URL изображения">
                        <div class="admin-image-upload-buttons">
                            <button type="button" class="admin-btn-secondary" onclick="triggerWebinarBlockImageUpload(${index}, 'image')">
                                📁 Загрузить
                            </button>
                            <button type="button" class="admin-btn-secondary" onclick="pasteWebinarBlockImageFromClipboard(${index}, 'image')">
                                📋 Вставить
                            </button>
                        </div>
                        <input type="file" id="webinarBlockImageUpload_${index}_image" accept="image/*" style="display: none;" onchange="handleWebinarBlockImageUpload(event, ${index}, 'image')">
                    </div>
                    ${data.image ? `<div class="admin-image-preview"><img src="${data.image.startsWith('http') ? data.image : '/' + data.image}" alt="Preview" style="max-width: 200px; max-height: 150px; margin-top: 10px; border-radius: 8px;"></div>` : ''}
                </div>
                <div class="admin-form-group">
                    <label class="admin-form-label">Позиция изображения</label>
                    <select class="admin-form-input webinar-block-field"
                            data-block-index="${index}" data-field="imagePosition">
                        <option value="left" ${data.imagePosition === 'left' ? 'selected' : ''}>Слева</option>
                        <option value="right" ${data.imagePosition === 'right' ? 'selected' : ''}>Справа</option>
                    </select>
                </div>
                <div class="admin-form-group">
                    <label class="admin-form-label">Заголовок</label>
                    <input type="text" class="admin-form-input webinar-block-field"
                           data-block-index="${index}" data-field="title"
                           value="${data.title || ''}" placeholder="Заголовок">
                </div>
                <div class="admin-form-group">
                    <label class="admin-form-label">Преимущества (по одному на строку)</label>
                    <textarea class="admin-form-input webinar-block-field" rows="6"
                              data-block-index="${index}" data-field="items"
                              placeholder="Преимущество 1\nПреимущество 2">${featureItems.join('\n')}</textarea>
                </div>
            `;

        case 'author':
            const credentials = data.credentials || [];
            return `
                <div class="admin-form-group">
                    <label class="admin-form-label">Фото автора</label>
                    <div class="admin-image-upload-container">
                        <input type="text" class="admin-form-input webinar-block-field"
                               data-block-index="${index}" data-field="photo"
                               value="${data.photo || ''}" placeholder="URL изображения">
                        <div class="admin-image-upload-buttons">
                            <button type="button" class="admin-btn-secondary" onclick="triggerWebinarBlockImageUpload(${index}, 'photo')">
                                📁 Загрузить
                            </button>
                            <button type="button" class="admin-btn-secondary" onclick="pasteWebinarBlockImageFromClipboard(${index}, 'photo')">
                                📋 Вставить
                            </button>
                        </div>
                        <input type="file" id="webinarBlockImageUpload_${index}_photo" accept="image/*" style="display: none;" onchange="handleWebinarBlockImageUpload(event, ${index}, 'photo')">
                    </div>
                    ${data.photo ? `<div class="admin-image-preview"><img src="${data.photo.startsWith('http') ? data.photo : '/' + data.photo}" alt="Preview" style="max-width: 200px; max-height: 150px; margin-top: 10px; border-radius: 8px;"></div>` : ''}
                </div>
                <div class="admin-form-group">
                    <label class="admin-form-label">Имя автора</label>
                    <input type="text" class="admin-form-input webinar-block-field"
                           data-block-index="${index}" data-field="name"
                           value="${data.name || ''}" placeholder="Имя автора">
                </div>
                <div class="admin-form-group">
                    <label class="admin-form-label">Регалии/Достижения (по одному на строку)</label>
                    <textarea class="admin-form-input webinar-block-field" rows="6"
                              data-block-index="${index}" data-field="credentials"
                              placeholder="Регалия 1\nРегалия 2">${credentials.join('\n')}</textarea>
                </div>
            `;

        default:
            return '<p>Неизвестный тип блока</p>';
    }
}

// Attach listeners to update blocks data
function attachWebinarBlockFieldListeners() {
    // Regular block fields
    document.querySelectorAll('.webinar-block-field').forEach(field => {
        field.addEventListener('input', function() {
            const blockIndex = parseInt(this.dataset.blockIndex);
            const fieldName = this.dataset.field;
            const blocks = window.currentWebinarBlocks || [];

            if (!blocks[blockIndex].data) {
                blocks[blockIndex].data = {};
            }

            // Handle array fields (items, credentials)
            if (fieldName === 'items' || fieldName === 'credentials') {
                blocks[blockIndex].data[fieldName] = this.value.split('\n').filter(item => item.trim());
            }
            // Handle number fields
            else if (fieldName === 'price' || fieldName === 'oldPrice') {
                blocks[blockIndex].data[fieldName] = parseInt(this.value) || (fieldName === 'oldPrice' ? '' : 0);
            }
            // Handle regular fields
            else {
                blocks[blockIndex].data[fieldName] = this.value;
            }

            window.currentWebinarBlocks = blocks;
        });
    });

    // Drag and drop functionality
    attachWebinarBlockDragAndDrop();
}

// Drag and drop for webinar blocks
function attachWebinarBlockDragAndDrop() {
    const dragHandles = document.querySelectorAll('.admin-block-drag-handle');
    let draggedElement = null;
    let draggedIndex = null;

    dragHandles.forEach((handle) => {
        const blockItem = handle.closest('.admin-block-item');

        handle.addEventListener('dragstart', function(e) {
            draggedElement = blockItem;
            draggedIndex = parseInt(blockItem.dataset.blockIndex);
            blockItem.style.opacity = '0.5';
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', blockItem.innerHTML);
        });

        handle.addEventListener('dragend', function(e) {
            blockItem.style.opacity = '1';
            document.querySelectorAll('.admin-block-item').forEach(el => {
                el.classList.remove('drag-over');
            });
        });
    });

    const blockItems = document.querySelectorAll('.admin-block-item');
    blockItems.forEach((item) => {
        item.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (this !== draggedElement) {
                this.classList.add('drag-over');
            }
            return false;
        });

        item.addEventListener('dragenter', function(e) {
            if (this !== draggedElement) {
                this.classList.add('drag-over');
            }
        });

        item.addEventListener('dragleave', function(e) {
            this.classList.remove('drag-over');
        });

        item.addEventListener('drop', function(e) {
            e.stopPropagation();
            e.preventDefault();

            if (this !== draggedElement && draggedElement) {
                const dropIndex = parseInt(this.dataset.blockIndex);
                const blocks = window.currentWebinarBlocks || [];

                const [movedBlock] = blocks.splice(draggedIndex, 1);
                blocks.splice(dropIndex, 0, movedBlock);

                window.currentWebinarBlocks = blocks;
                renderWebinarBlocks();
            }

            this.classList.remove('drag-over');
            return false;
        });
    });
}

// Webinar block management functions
window.toggleWebinarBlock = function(index) {
    const body = document.getElementById(`webinarBlockBody${index}`);
    const btn = body.previousElementSibling.querySelector('.toggle-icon');
    if (body.style.display === 'none') {
        body.style.display = 'block';
        btn.textContent = '▼';
    } else {
        body.style.display = 'none';
        btn.textContent = '▶';
    }
};

window.deleteWebinarBlock = function(index) {
    const blocks = window.currentWebinarBlocks || [];
    blocks.splice(index, 1);
    window.currentWebinarBlocks = blocks;
    renderWebinarBlocks();
};

window.moveWebinarBlockUp = function(index) {
    if (index === 0) return;
    const blocks = window.currentWebinarBlocks || [];
    [blocks[index - 1], blocks[index]] = [blocks[index], blocks[index - 1]];
    window.currentWebinarBlocks = blocks;
    renderWebinarBlocks();
};

window.moveWebinarBlockDown = function(index) {
    const blocks = window.currentWebinarBlocks || [];
    if (index >= blocks.length - 1) return;
    [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
    window.currentWebinarBlocks = blocks;
    renderWebinarBlocks();
};

window.addWebinarBlock = function(type) {
    const blocks = window.currentWebinarBlocks || [];
    const newBlock = {
        type: type,
        data: getDefaultWebinarBlockData(type)
    };
    blocks.push(newBlock);
    window.currentWebinarBlocks = blocks;
    renderWebinarBlocks();

    // Scroll to new block
    setTimeout(() => {
        const newBlockEl = document.querySelector(`[data-block-index="${blocks.length - 1}"]`);
        if (newBlockEl) {
            newBlockEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
};

// Get default block data for webinars
function getDefaultWebinarBlockData(type) {
    switch (type) {
        case 'hero':
            return { image: '', title: '', price: 0, oldPrice: '', startDate: '', paymentInstructions: '' };
        case 'description':
            return { image: '', title: '', subtitle: '', contentType: '' };
        case 'program':
            return { title: 'Программа вебинара', items: [] };
        case 'features':
            return { image: '', imagePosition: 'right', title: '', items: [] };
        case 'author':
            return { photo: '', name: '', credentials: [] };
        default:
            return {};
    }
}

// Get webinar blocks data for saving
window.getWebinarBlocksData = function() {
    return window.currentWebinarBlocks || [];
};

// Image upload functions for webinar blocks
window.triggerWebinarBlockImageUpload = function(blockIndex, fieldName) {
    const fileInput = document.getElementById(`webinarBlockImageUpload_${blockIndex}_${fieldName}`);
    if (fileInput) {
        fileInput.click();
    }
};

window.handleWebinarBlockImageUpload = async function(event, blockIndex, fieldName) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите файл изображения');
        return;
    }

    try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(API_CONFIG.getApiUrl('upload/image'), {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Ошибка загрузки изображения');
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Ошибка загрузки');
        }

        // Update block data
        const blocks = window.currentWebinarBlocks || [];
        if (!blocks[blockIndex].data) {
            blocks[blockIndex].data = {};
        }
        blocks[blockIndex].data[fieldName] = data.data.path;
        window.currentWebinarBlocks = blocks;

        // Update the input field directly instead of re-rendering everything
        const inputField = document.querySelector(`input[data-block-index="${blockIndex}"][data-field="${fieldName}"]`);
        if (inputField) {
            inputField.value = data.data.path;

            // Add or update preview image
            const container = inputField.closest('.admin-form-group');
            let preview = container.querySelector('.admin-image-preview');
            if (!preview) {
                preview = document.createElement('div');
                preview.className = 'admin-image-preview';
                container.appendChild(preview);
            }
            const imagePath = data.data.path.startsWith('http') ? data.data.path : '/' + data.data.path;
            preview.innerHTML = `<img src="${imagePath}" alt="Preview" style="max-width: 200px; max-height: 150px; margin-top: 10px; border-radius: 8px;">`;
        }

        // Show success message
        showNotification('Изображение успешно загружено', 'success');
    } catch (error) {
        console.error('Error uploading image:', error);
        alert('Ошибка при загрузке изображения: ' + error.message);
    }

    // Reset file input
    event.target.value = '';
};

window.pasteWebinarBlockImageFromClipboard = async function(blockIndex, fieldName) {
    try {
        const clipboardItems = await navigator.clipboard.read();

        for (const item of clipboardItems) {
            const imageType = item.types.find(type => type.startsWith('image/'));

            if (imageType) {
                const blob = await item.getType(imageType);

                const formData = new FormData();
                formData.append('image', blob, 'clipboard-image.png');

                const response = await fetch(API_CONFIG.getApiUrl('upload/image'), {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Ошибка загрузки изображения');
                }

                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.error || 'Ошибка загрузки');
                }

                // Update block data
                const blocks = window.currentWebinarBlocks || [];
                if (!blocks[blockIndex].data) {
                    blocks[blockIndex].data = {};
                }
                blocks[blockIndex].data[fieldName] = data.data.path;
                window.currentWebinarBlocks = blocks;

                // Update the input field directly instead of re-rendering everything
                const inputField = document.querySelector(`input[data-block-index="${blockIndex}"][data-field="${fieldName}"]`);
                if (inputField) {
                    inputField.value = data.data.path;

                    // Add or update preview image
                    const container = inputField.closest('.admin-form-group');
                    let preview = container.querySelector('.admin-image-preview');
                    if (!preview) {
                        preview = document.createElement('div');
                        preview.className = 'admin-image-preview';
                        container.appendChild(preview);
                    }
                    const imagePath = data.data.path.startsWith('http') ? data.data.path : '/' + data.data.path;
                    preview.innerHTML = `<img src="${imagePath}" alt="Preview" style="max-width: 200px; max-height: 150px; margin-top: 10px; border-radius: 8px;">`;
                }

                // Show success message
                showNotification('Изображение успешно вставлено из буфера обмена', 'success');
                return;
            }
        }

        alert('В буфере обмена нет изображения');
    } catch (error) {
        console.error('Error pasting image:', error);
        alert('Ошибка при вставке изображения: ' + error.message);
    }
};

