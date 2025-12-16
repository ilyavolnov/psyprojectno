// Courses and Certificates Management
console.log('admin-courses-certificates.js loaded');

// Load Courses Page
window.loadCourses = async function() {
    console.log('loadCourses called');
    const pageTitle = document.getElementById('pageTitle');
    const pageSubtitle = document.getElementById('pageSubtitle');
    const adminContent = document.getElementById('adminContent');

    pageTitle.textContent = 'Курсы';
    pageSubtitle.textContent = 'Управление курсами и вебинарами';

    // Load courses from API
    let courses = [];
    try {
        console.log('Loading courses from API...');
        const response = await fetch(API_CONFIG.getApiUrl('courses?type=course'));
        const data = await response.json();
        console.log('Courses API response:', data);
        if (data.success) {
            courses = data.data;
        }
    } catch (error) {
        console.error('Error loading courses:', error);
    }

    adminContent.innerHTML = `
        <div class="admin-section">
            <div class="admin-section-header">
                <h2 class="admin-section-title">Список курсов (${courses.length})</h2>
                <button class="admin-btn admin-btn-primary" onclick="addCourse()">
                    ➕ Добавить курс
                </button>
            </div>

            <div class="admin-courses-grid">
                ${courses.map(course => {
                    const imagePath = course.image ? (course.image.startsWith('http') ? course.image : '/' + course.image) : '/images/hero-page.webp';
                    return `
                    <div class="admin-course-card">
                        <div class="admin-course-image">
                            <img src="${imagePath}" alt="${course.title}" onerror="this.src='/images/hero-page.webp'">
                        </div>
                        <div class="admin-course-info">
                            <h3 class="admin-course-title">${course.title}</h3>
                            <p class="admin-course-description">${course.subtitle || course.description || ''}</p>
                            <div class="admin-course-meta">
                                <span>💰 ${course.old_price ?
                                    `<span style="text-decoration: line-through; opacity: 0.7;">${course.old_price.toLocaleString('ru-RU')} ₽</span> ` +
                                    `<span style="background-color: #e74c3c; color: white; padding: 2px 8px; border-radius: 4px;">${course.price.toLocaleString('ru-RU')} ₽</span>` :
                                    (course.price ? course.price.toLocaleString('ru-RU') + ' ₽' : 'Бесплатно')}</span>
                                <span>📅 ${course.release_date || 'Не указано'}</span>
                            </div>
                        </div>
                        <div class="admin-course-actions">
                            <button class="admin-btn admin-btn-secondary" onclick="editCourse(${course.id})">
                                ✏️ Редактировать
                            </button>
                            <button class="admin-btn admin-btn-danger" onclick="deleteCourse(${course.id})">
                                🗑️ Удалить
                            </button>
                        </div>
                    </div>
                `;
                }).join('')}
            </div>
        </div>

        <!-- Edit Course Popup -->
        <div class="admin-popup" id="coursePopup">
            <div class="admin-popup-overlay"></div>
            <div class="admin-popup-content wide">
                <button class="admin-popup-close">&times;</button>
                <h2 class="admin-popup-title" id="coursePopupTitle">Редактировать курс</h2>
                <div class="admin-popup-body" id="coursePopupBody">
                    <!-- Content will be loaded here -->
                </div>
            </div>
        </div>
    `;

    window.coursesData = courses;
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

// Course Functions
window.addCourse = function() {
    openCoursePopup();
};

window.editCourse = async function(id) {
    let course = window.coursesData.find(c => c.id === id);

    if (!course) {
        try {
            const response = await fetch(API_CONFIG.getApiUrl(`courses/${id}`));
            const data = await response.json();
            if (data.success) {
                course = data.data;
            }
        } catch (error) {
            console.error('Error loading course:', error);
            await adminError('Ошибка загрузки курса');
            return;
        }
    }

    if (!course) return;
    openCoursePopup(course);
};

window.deleteCourse = async function(id) {
    const confirmed = await adminConfirm('Удалить этот курс?', 'Подтверждение удаления');
    if (!confirmed) return;

    try {
        const response = await fetch(API_CONFIG.getApiUrl(`courses/${id}`), {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            await adminSuccess('Курс удален!');
            loadCourses();
        } else {
            await adminError('Ошибка: ' + data.error);
        }
    } catch (error) {
        console.error('Error deleting course:', error);
        await adminError('Ошибка удаления: ' + error.message);
    }
};


function openCoursePopup(course = null) {
    const popup = document.getElementById('coursePopup');
    const title = document.getElementById('coursePopupTitle');
    const body = document.getElementById('coursePopupBody');

    title.textContent = course ? `Редактировать: ${course.title}` : 'Создать новый курс';

    const imagePath = course?.image ? (course.image.startsWith('http') ? course.image : '/' + course.image) : '/images/hero-page.webp';

    // Store current course for blocks
    window.currentEditingCourse = course;

    body.innerHTML = `
        <!-- Tabs -->
        <div class="admin-tabs" style="margin-bottom: 20px;">
            <button class="admin-tab active" data-tab="main" onclick="switchCourseTab('main')">Основное</button>
            <button class="admin-tab" data-tab="blocks" onclick="switchCourseTab('blocks')">Блоки страницы</button>
        </div>

        <!-- Main Tab -->
        <div id="courseTabMain" class="admin-tab-content active">
        <form class="admin-form" id="courseForm">
            <div class="admin-form-row">
                <div class="admin-form-group">
                    <label class="admin-form-label">Название курса *</label>
                    <input type="text" class="admin-form-input" id="courseTitle" value="${course?.title || ''}" required>
                </div>
                <div class="admin-form-group">
                    <label class="admin-form-label">Подзаголовок</label>
                    <input type="text" class="admin-form-input" id="courseSubtitle" value="${course?.subtitle || ''}">
                </div>
            </div>

            <div class="admin-form-row">
                <div class="admin-form-group">
                    <label class="admin-form-label">Цена (₽) *</label>
                    <input type="number" class="admin-form-input" id="coursePrice" value="${course?.price || ''}" required>
                </div>
                <div class="admin-form-group">
                    <label class="admin-form-label">Зачеркнутая цена (₽)</label>
                    <input type="number" class="admin-form-input" id="courseOldPrice" value="${course?.old_price || ''}" placeholder="Старая цена">
                </div>
            </div>
            <div class="admin-form-row">
                <div class="admin-form-group">
                    <label class="admin-form-label">Статус</label>
                    <select class="admin-form-input" id="courseStatus">
                        <option value="available" ${course?.status === 'available' ? 'selected' : ''}>Доступен</option>
                        <option value="coming_soon" ${course?.status === 'coming_soon' ? 'selected' : ''}>Скоро</option>
                        <option value="sold_out" ${course?.status === 'sold_out' ? 'selected' : ''}>Продано</option>
                    </select>
                </div>
            </div>

            <div class="admin-form-group">
                <label class="admin-form-label">Изображение</label>
                <div class="admin-photo-upload">
                    <img src="${imagePath}" alt="Preview" id="courseImagePreview" class="admin-photo-preview" onerror="this.src='/images/hero-page.webp'">
                    <div class="admin-photo-controls">
                        <input type="file" id="coursePhotoFile" accept="image/*" style="display: none;" onchange="handleCoursePhotoUpload(event)">
                        <button type="button" class="admin-btn admin-btn-secondary" onclick="document.getElementById('coursePhotoFile').click()">
                            📁 Загрузить файл
                        </button>
                        <input type="text" class="admin-form-input" id="courseImage" value="${course?.image || ''}" placeholder="или введите URL изображения">
                    </div>
                </div>
            </div>

            <div class="admin-form-row">
                <div class="admin-form-group">
                    <label class="admin-form-label">Дата старта (для отображения)</label>
                    <input type="text" class="admin-form-input" id="courseReleaseDate" value="${course?.release_date || ''}" placeholder="10 НОЯБРЯ">
                    <small style="color: #999; font-size: 12px;">Текст для отображения, например "10 НОЯБРЯ"</small>
                </div>
                <div class="admin-form-group">
                    <label class="admin-form-label">Дата старта (для счетчика)</label>
                    <input type="datetime-local" class="admin-form-input" id="courseStartDate" value="${course?.start_date || ''}">
                    <small style="color: #999; font-size: 12px;">Точная дата и время для обратного отсчета</small>
                </div>
            </div>

            <div class="admin-form-row">
                <div class="admin-form-group">
                    <label class="admin-form-label">WhatsApp номер</label>
                    <input type="text" class="admin-form-input" id="courseWhatsapp" value="${course?.whatsapp_number || ''}" placeholder="89211880755">
                </div>
                <div class="admin-form-group">
                    <!-- Empty for layout -->
                </div>
            </div>

            <div class="admin-form-group">
                <label class="admin-form-label">Описание курса</label>
                <textarea class="admin-form-input" id="courseDescription" rows="4">${course?.description || ''}</textarea>
            </div>

            <div class="admin-form-group">
                <label class="admin-form-label">Темы курса (по одной на строку)</label>
                <textarea class="admin-form-input" id="courseTopics" rows="8" placeholder="Почему мы переедаем?
Прокрастинация через еду
Переедание выходного дня">${course?.topics ? (Array.isArray(course.topics) ? course.topics.join('\n') : course.topics) : ''}</textarea>
            </div>

            <div class="admin-form-row">
                <div class="admin-form-group">
                    <label class="admin-form-label">Длительность доступа</label>
                    <input type="text" class="admin-form-input" id="courseAccessDuration" value="${course?.access_duration || ''}" placeholder="3 недели">
                </div>
                <div class="admin-form-group">
                    <label class="admin-form-label">Обратная связь</label>
                    <input type="text" class="admin-form-input" id="courseFeedbackDuration" value="${course?.feedback_duration || ''}" placeholder="Индивидуальное сопровождение">
                </div>
            </div>


            <div class="admin-form-group">
                <label class="admin-form-label">Автор курса</label>
                <input type="text" class="admin-form-input" id="courseAuthorName" value="${course?.author_name || 'Маргарита Румянцева'}">
            </div>

            <div class="admin-form-group">
                <label class="admin-form-label">Описание автора</label>
                <textarea class="admin-form-input" id="courseAuthorDescription" rows="6">${course?.author_description || 'Врач-психиатр, психотерапевт, сексолог (стаж с 2009 г.)'}</textarea>
            </div>

            <div class="admin-form-actions">
                <button type="button" class="admin-btn admin-btn-secondary" onclick="closeCoursePopup()">Отмена</button>
                <button type="submit" class="admin-btn admin-btn-primary">💾 ${course ? 'Сохранить' : 'Создать'}</button>
            </div>
        </form>
        </div>

        <!-- Blocks Tab -->
        <div id="courseTabBlocks" class="admin-tab-content" style="display: none;">
            <div class="admin-blocks-header">
                <h3>Блоки страницы курса</h3>
                <div class="admin-block-type-buttons">
                    <button class="admin-btn admin-btn-sm admin-btn-secondary" onclick="addCourseBlock('hero')" title="Главный блок">
                        🎯 Hero
                    </button>
                    <button class="admin-btn admin-btn-sm admin-btn-secondary" onclick="addCourseBlock('description')" title="Блок с описанием">
                        📝 Описание
                    </button>
                    <button class="admin-btn admin-btn-sm admin-btn-secondary" onclick="addCourseBlock('program')" title="Программа курса">
                        📋 Программа
                    </button>
                    <button class="admin-btn admin-btn-sm admin-btn-secondary" onclick="addCourseBlock('features')" title="Преимущества">
                        ✨ Преимущества
                    </button>
                    <button class="admin-btn admin-btn-sm admin-btn-secondary" onclick="addCourseBlock('author')" title="Автор курса">
                        👤 Автор
                    </button>
                </div>
            </div>
            <div id="courseBlocksContainer" class="admin-blocks-container">
                <!-- Blocks will be rendered here -->
            </div>
            <div class="admin-blocks-footer">
                <button type="button" class="admin-btn admin-btn-primary" onclick="saveCourseBlocks(${course?.id})">
                    💾 Сохранить блоки
                </button>
            </div>
        </div>
    `;

    popup.classList.add('active');

    // Initialize course blocks
    const existingBlocks = course?.page_blocks ? JSON.parse(course.page_blocks) : [];
    initCourseBlocks(existingBlocks);

    // Close handlers
    popup.querySelector('.admin-popup-overlay').addEventListener('click', closeCoursePopup);
    popup.querySelector('.admin-popup-close').addEventListener('click', closeCoursePopup);

    // Form handler
    document.getElementById('courseForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveCourse(course?.id);
    });

    // Image preview update
    document.getElementById('courseImage').addEventListener('input', function(e) {
        const preview = document.getElementById('courseImagePreview');
        const value = e.target.value;
        if (value) {
            preview.src = value.startsWith('http') ? value : '/' + value;
        }
    });
}

// Switch course tabs
window.switchCourseTab = function(tabName) {
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
        document.getElementById('courseTabMain').style.display = 'block';
    } else if (tabName === 'blocks') {
        document.getElementById('courseTabBlocks').style.display = 'block';
    }
};

window.closeCoursePopup = function() {
    document.getElementById('coursePopup').classList.remove('active');
};

window.saveCourse = async function(courseId) {
    const topicsText = document.getElementById('courseTopics').value;
    const topics = topicsText.split('\n').filter(t => t.trim()).map(t => t.trim());

    const data = {
        title: document.getElementById('courseTitle').value,
        subtitle: document.getElementById('courseSubtitle').value,
        description: document.getElementById('courseDescription').value,
        price: parseInt(document.getElementById('coursePrice').value),
        old_price: document.getElementById('courseOldPrice').value ? parseInt(document.getElementById('courseOldPrice').value) : null,
        status: document.getElementById('courseStatus').value,
        image: document.getElementById('courseImage').value,
        release_date: document.getElementById('courseReleaseDate').value,
        start_date: document.getElementById('courseStartDate').value,
        access_duration: document.getElementById('courseAccessDuration').value,
        feedback_duration: document.getElementById('courseFeedbackDuration').value,
        whatsapp_number: document.getElementById('courseWhatsapp').value,
        bonuses: null, // Поле может быть добавлено позже если понадобится
        materials: null, // Поле может быть добавлено позже если понадобится
        topics: topics,
        author_name: document.getElementById('courseAuthorName').value,
        author_description: document.getElementById('courseAuthorDescription').value,
        page_blocks: JSON.stringify(getCourseBlocksData()),
        type: 'course'
    };

    try {
        const url = courseId ?
            API_CONFIG.getApiUrl(`courses/${courseId}`) :
            API_CONFIG.getApiUrl('courses');

        const method = courseId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            await adminSuccess(`Курс ${courseId ? 'обновлен' : 'создан'} успешно!`);
            closeCoursePopup();
            loadCourses();
        } else {
            await adminError('Ошибка: ' + result.error);
        }
    } catch (error) {
        console.error('Error saving course:', error);
        await adminError('Ошибка сохранения: ' + error.message);
    }
};

// Save only course blocks
window.saveCourseBlocks = async function(courseId) {
    if (!courseId) {
        await adminError('Сначала сохраните основную информацию о курсе');
        return;
    }

    const blocksData = getCourseBlocksData();

    try {
        const response = await fetch(API_CONFIG.getApiUrl(`courses/${courseId}`), {
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
        console.error('Error saving course blocks:', error);
        await adminError('Ошибка сохранения блоков: ' + error.message);
    }
};


// Photo upload handler for courses
window.handleCoursePhotoUpload = async function (event) {
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
    const preview = document.getElementById('courseImagePreview');
    const photoInput = document.getElementById('courseImage');
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

