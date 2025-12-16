// Admin Panel Handler
document.addEventListener('DOMContentLoaded', function () {
    // Check authentication
    checkAuth();

    // Initialize
    const userName = document.getElementById('userName');
    const pageTitle = document.getElementById('pageTitle');
    const pageSubtitle = document.getElementById('pageSubtitle');
    const adminContent = document.getElementById('adminContent');
    const navLinks = document.querySelectorAll('.admin-nav-link');
    const logoutBtn = document.getElementById('logoutBtn');

    // Set user name
    const session = getSession();
    if (session) {
        userName.textContent = session.username;
    }

    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            loadPage(page);

            // Update active state
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Logout
    logoutBtn.addEventListener('click', logout);

    // Load dashboard by default
    loadPage('dashboard');

    // Update badge with real count
    updateRequestsBadge();

    // Functions
    function checkAuth() {
        const session = getSession();
        if (!session) {
            window.location.href = 'admin-login.html';
            return;
        }

        // Check if session is expired
        if (new Date(session.expiresAt) < new Date()) {
            logout();
        }
    }

    function getSession() {
        const localSession = localStorage.getItem('adminSession');
        const sessionSession = sessionStorage.getItem('adminSession');
        const sessionStr = localSession || sessionSession;

        if (sessionStr) {
            try {
                return JSON.parse(sessionStr);
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    function logout() {
        localStorage.removeItem('adminSession');
        sessionStorage.removeItem('adminSession');
        localStorage.removeItem('adminTokenHash');
        window.location.href = 'admin-login.html';
    }

    function loadPage(page) {
        switch (page) {
            case 'dashboard':
                loadDashboard();
                break;
            case 'requests':
                loadRequests();
                break;
            case 'specialists':
                loadSpecialists();
                break;
            case 'courses':
                loadCourses();
                break;
            case 'webinars':
                if (typeof loadWebinars === 'function') loadWebinars();
                break;
            case 'supervisions':
                loadSupervisions();
                break;
            case 'promo-codes':
                if (typeof loadPromoCodes === 'function') loadPromoCodes();
                break;
            case 'settings':
                loadSettings();
                break;
            case 'courses':
                loadCourses();
                break;
            case 'certificates':
                loadCertificates();
                break;
            default:
                loadDashboard();
        }
    }

    async function loadDashboard() {
        pageTitle.textContent = 'Дашборд';
        pageSubtitle.textContent = 'Обзор активности';

        // Load real stats from API
        let stats = { total: 0, new: 0, pending: 0, completed: 0 };
        let recentRequests = [];

        try {
            const response = await fetch(API_CONFIG.getApiUrl('requests/stats/summary'));
            const data = await response.json();
            if (data.success) {
                stats = data.data;
            }

            const reqResponse = await fetch(API_CONFIG.getApiUrl('requests?limit=5'));
            const reqData = await reqResponse.json();
            if (reqData.success) {
                // Show only new requests on dashboard
                recentRequests = reqData.data.filter(r => r.status === 'new' && !r.archived && !r.deleted).slice(0, 5);
                // Store globally for popup access
                window.allRequests = reqData.data;
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }

        adminContent.innerHTML = `
            <!-- Stats Cards -->
            <div class="admin-stats-grid">
                <div class="admin-stat-card">
                    <div class="admin-stat-header">
                        <span class="admin-stat-title">Всего заявок</span>
                        <span class="admin-stat-icon">📋</span>
                    </div>
                    <div class="admin-stat-value">${stats.total || 0}</div>
                    <div class="admin-stat-change">Активные</div>
                </div>

                <div class="admin-stat-card">
                    <div class="admin-stat-header">
                        <span class="admin-stat-title">Новые</span>
                        <span class="admin-stat-icon">🆕</span>
                    </div>
                    <div class="admin-stat-value">${stats.new || 0}</div>
                    <div class="admin-stat-change">Требуют внимания</div>
                </div>

                <div class="admin-stat-card">
                    <div class="admin-stat-header">
                        <span class="admin-stat-title">В обработке</span>
                        <span class="admin-stat-icon">⏳</span>
                    </div>
                    <div class="admin-stat-value">${stats.pending || 0}</div>
                    <div class="admin-stat-change">В работе</div>
                </div>

                <div class="admin-stat-card">
                    <div class="admin-stat-header">
                        <span class="admin-stat-title">Завершено</span>
                        <span class="admin-stat-icon">✅</span>
                    </div>
                    <div class="admin-stat-value">${stats.completed || 0}</div>
                    <div class="admin-stat-change">Успешно</div>
                </div>
            </div>

            <!-- Recent Requests -->
            <div class="admin-section">
                <div class="admin-section-header">
                    <h2 class="admin-section-title">Последние заявки</h2>
                    <button class="admin-btn admin-btn-primary" onclick="document.querySelector('[data-page=\\'requests\\']').click()">
                        Все заявки
                    </button>
                </div>
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Имя</th>
                            <th>Телефон</th>
                            <th>Тип</th>
                            <th>Дата</th>
                            <th>Статус</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recentRequests.length > 0 ? recentRequests.map(req => `
                            <tr>
                                <td>#${req.id}</td>
                                <td>${req.name}</td>
                                <td>${req.phone}</td>
                                <td>${getRequestTypeLabel(req.request_type)}</td>
                                <td>${formatDate(req.created_at)}</td>
                                <td><span class="admin-status-badge admin-status-${req.status}">${getStatusText(req.status)}</span></td>
                                <td>
                                    <div class="admin-actions">
                                        <button class="admin-action-btn admin-action-view" onclick="openRequestPopup(${req.id})">Открыть</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('') : '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #999;">Нет заявок</td></tr>'}
                    </tbody>
                </table>
            </div>

            <!-- Quick Actions -->
            <div class="admin-section">
                <div class="admin-section-header">
                    <h2 class="admin-section-title">Быстрые действия</h2>
                </div>
                <div class="admin-stats-grid">
                    <button class="admin-btn admin-btn-primary" style="padding: 20px;">
                        ➕ Добавить специалиста
                    </button>
                    <button class="admin-btn admin-btn-primary" style="padding: 20px;">
                        📚 Создать курс
                    </button>
                    <button class="admin-btn admin-btn-primary" style="padding: 20px;">
                        🎁 Новый сертификат
                    </button>
                    <button class="admin-btn admin-btn-primary" style="padding: 20px;">
                        📊 Экспорт данных
                    </button>
                </div>
            </div>

            <!-- Request Details Popup -->
            <div class="admin-popup" id="requestPopup">
                <div class="admin-popup-overlay"></div>
                <div class="admin-popup-content">
                    <button class="admin-popup-close">&times;</button>
                    <h2 class="admin-popup-title">Детали заявки #<span id="popupRequestId"></span></h2>
                    <div class="admin-popup-body" id="popupRequestBody">
                        <!-- Content will be loaded here -->
                    </div>
                </div>
            </div>
        `;
    }

    async function loadRequests() {
        pageTitle.textContent = 'Заявки';
        pageSubtitle.textContent = 'Управление заявками клиентов';

        // Load real requests from API
        let requests = [];
        let stats = { total: 0, archived: 0, deleted: 0 };

        try {
            const response = await fetch(API_CONFIG.getApiUrl('requests'));
            const data = await response.json();
            if (data.success) {
                requests = data.data;
            }

            const statsResponse = await fetch(API_CONFIG.getApiUrl('requests/stats/summary'));
            const statsData = await statsResponse.json();
            if (statsData.success) {
                stats = statsData.data;
            }
        } catch (error) {
            console.error('Error loading requests:', error);
        }

        // Store globally
        window.allRequests = requests;

        adminContent.innerHTML = `
            <!-- Tabs -->
            <div class="admin-tabs">
                <button class="admin-tab active" data-tab="all">Все заявки (${stats.total || 0})</button>
                <button class="admin-tab" data-tab="archive">Архив (${stats.archived || 0})</button>
                <button class="admin-tab" data-tab="deleted">🗑️ Корзина (${stats.deleted || 0})</button>
            </div>

            <!-- Filters -->
            <div class="admin-filters">
                <select class="admin-filter-select" id="filterStatus">
                    <option value="">Все статусы</option>
                    <option value="new">Новые</option>
                    <option value="pending">В обработке</option>
                    <option value="completed">Завершенные</option>
                </select>

                <select class="admin-filter-select" id="filterType">
                    <option value="">Все типы</option>
                    <option value="consultation">Общая консультация</option>
                    <option value="specialist">Запись к сотруднику</option>
                    <option value="certificate">Покупка сертификата</option>
                    <option value="course">Покупка курса</option>
                    <option value="supervision">Супервизия</option>
                </select>

                <select class="admin-filter-select" id="filterSpecialist">
                    <option value="">Все специалисты</option>
                    <option value="1">Маргарита Румянцева</option>
                    <option value="2">Ольга П.</option>
                    <option value="3">Анна Б.</option>
                    <option value="4">Анастасия</option>
                    <option value="5">Марина</option>
                </select>

                <button class="admin-btn admin-btn-primary" onclick="exportRequests()">
                    📊 Экспорт
                </button>
                
                <button class="admin-btn admin-btn-secondary" onclick="createTestRequest()">
                    🧪 Создать тестовую заявку
                </button>
            </div>

            <!-- Bulk Actions Panel -->
            <div class="admin-bulk-actions" id="bulkActionsPanel" style="display: none;">
                <div class="admin-bulk-info">
                    <span id="bulkSelectedCount">0</span> выбрано
                </div>
                <div class="admin-bulk-buttons">
                    <button class="admin-btn admin-btn-secondary" onclick="bulkViewRequests()">
                        👁️ Посмотреть
                    </button>
                    <button class="admin-btn admin-btn-secondary" onclick="bulkArchiveRequests()">
                        📦 В архив
                    </button>
                    <button class="admin-btn admin-btn-secondary" onclick="bulkChangeStatus()">
                        🔄 Изменить статус
                    </button>
                    <button class="admin-btn admin-btn-danger" onclick="bulkDeleteRequests()">
                        🗑️ Удалить
                    </button>
                    <button class="admin-btn admin-btn-secondary" onclick="clearSelection()">
                        ✖️ Отменить
                    </button>
                </div>
            </div>

            <div class="admin-section">
                <table class="admin-table" id="requestsTable">
                    <thead>
                        <tr>
                            <th>
                                <input type="checkbox" id="selectAllRequests" onchange="toggleSelectAll(this)">
                            </th>
                            <th>ID</th>
                            <th>Имя</th>
                            <th>Телефон</th>
                            <th>Email</th>
                            <th>Тип заявки</th>
                            <th>Специалист</th>
                            <th>Дата</th>
                            <th>Статус</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody id="requestsTableBody">
                        ${requests.length > 0 ? requests.map(req => `
                            <tr data-request-id="${req.id}">
                                <td>
                                    <input type="checkbox" class="admin-checkbox" data-request-id="${req.id}" onchange="updateBulkActions()">
                                </td>
                                <td>#${req.id}</td>
                                <td>${req.name}</td>
                                <td>${req.phone}</td>
                                <td>${req.email || '-'}</td>
                                <td>${getRequestTypeLabel(req.request_type)}</td>
                                <td>${req.specialist_id ? 'ID: ' + req.specialist_id : '-'}</td>
                                <td>${formatDate(req.created_at)}</td>
                                <td><span class="admin-status-badge admin-status-${req.status}">${getStatusText(req.status)}</span></td>
                                <td>
                                    <div class="admin-actions">
                                        <button class="admin-action-btn admin-action-view" onclick="openRequestPopup(${req.id})">Открыть</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('') : '<tr><td colspan="10" style="text-align: center; padding: 40px; color: #999;">Нет заявок</td></tr>'}
                    </tbody>
                </table>
            </div>

            <!-- Request Details Popup -->
            <div class="admin-popup" id="requestPopup">
                <div class="admin-popup-overlay"></div>
                <div class="admin-popup-content">
                    <button class="admin-popup-close">&times;</button>
                    <h2 class="admin-popup-title">Детали заявки #<span id="popupRequestId"></span></h2>
                    <div class="admin-popup-body" id="popupRequestBody">
                        <!-- Content will be loaded here -->
                    </div>
                </div>
            </div>
        `;

        // Initialize tabs
        initializeTabs();

        // Initialize filters
        initializeFilters();

        // Initialize request actions
        initializeRequestActions();
    }

    async function loadSpecialists() {
        pageTitle.textContent = 'Специалисты';
        pageSubtitle.textContent = 'Управление специалистами';

        // Load specialists data from API
        let specialists = [];
        try {
            console.log('Loading specialists from API...');
            const response = await fetch(API_CONFIG.getApiUrl('specialists'));
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('API response:', data);
            if (data.success) {
                specialists = data.data;
                console.log('Loaded specialists:', specialists.length);
            }
        } catch (error) {
            console.error('Error loading specialists:', error);
        }

        const availableCount = specialists.filter(s => s.status === 'available').length;
        const waitingCount = specialists.filter(s => s.status === 'waiting').length;
        const fullCount = specialists.filter(s => s.status === 'full').length;

        adminContent.innerHTML = `
            <!-- Stats -->
            <div class="admin-stats-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 30px;">
                <div class="admin-stat-card">
                    <div class="admin-stat-header">
                        <span class="admin-stat-title">Всего</span>
                        <span class="admin-stat-icon">👥</span>
                    </div>
                    <div class="admin-stat-value">${specialists.length}</div>
                </div>
                <div class="admin-stat-card">
                    <div class="admin-stat-header">
                        <span class="admin-stat-title">Доступны</span>
                        <span class="admin-stat-icon">✅</span>
                    </div>
                    <div class="admin-stat-value">${availableCount}</div>
                </div>
                <div class="admin-stat-card">
                    <div class="admin-stat-header">
                        <span class="admin-stat-title">Лист ожидания</span>
                        <span class="admin-stat-icon">⏳</span>
                    </div>
                    <div class="admin-stat-value">${waitingCount}</div>
                </div>
                <div class="admin-stat-card">
                    <div class="admin-stat-header">
                        <span class="admin-stat-title">Запись закрыта</span>
                        <span class="admin-stat-icon">🔒</span>
                    </div>
                    <div class="admin-stat-value">${fullCount}</div>
                </div>
            </div>

            <!-- Filters -->
            <div class="admin-filters">
                <select class="admin-filter-select" id="filterSpecialistStatus">
                    <option value="">Все статусы</option>
                    <option value="available">Доступны</option>
                    <option value="waiting">Лист ожидания</option>
                    <option value="full">Запись закрыта</option>
                </select>

                <input type="text" id="searchSpecialist" class="admin-filter-select" placeholder="🔍 Поиск по имени...">

                <button class="admin-btn admin-btn-primary" onclick="addSpecialist()">
                    ➕ Добавить специалиста
                </button>
            </div>

            <!-- Specialists Grid -->
            <div class="admin-specialists-grid" id="specialistsGrid">
                ${generateSpecialistsCards(specialists)}
            </div>

            <!-- Edit Specialist Popup -->
            <div class="admin-popup" id="specialistPopup">
                <div class="admin-popup-overlay"></div>
                <div class="admin-popup-content" style="max-width: 800px;">
                    <button class="admin-popup-close">&times;</button>
                    <h2 class="admin-popup-title" id="specialistPopupTitle">Редактировать специалиста</h2>
                    <div class="admin-popup-body" id="specialistPopupBody">
                        <!-- Content will be loaded here -->
                    </div>
                </div>
            </div>
        `;

        // Initialize filters
        document.getElementById('filterSpecialistStatus').addEventListener('change', filterSpecialists);
        document.getElementById('searchSpecialist').addEventListener('input', filterSpecialists);

        // Store specialists data globally
        window.specialistsData = specialists;
    }

    function generateSpecialistsCards(specialists) {
        if (specialists.length === 0) {
            return '<p style="padding: 40px; text-align: center; color: #999;">Специалисты не найдены</p>';
        }

        return specialists.map(spec => {
            // Fix image path for admin panel (add ../../ to go to project root)
            const imagePath = spec.photo ? (spec.photo.startsWith('http') ? spec.photo : '/' + spec.photo) : '/images/hero-page.webp';
            
            return `
            <div class="admin-specialist-card" data-specialist-id="${spec.id}" data-status="${spec.status}">
                <div class="admin-specialist-photo">
                    <img src="${imagePath}" alt="${spec.name}" onerror="this.src='/images/hero-page.webp'">
                    <span class="admin-specialist-status admin-specialist-status-${spec.status}">
                        ${getSpecialistStatusText(spec.status)}
                    </span>
                </div>
                <div class="admin-specialist-info">
                    <h3 class="admin-specialist-name">${spec.name}</h3>
                    <p class="admin-specialist-role">${spec.specialization || spec.role || ''}</p>
                    <div class="admin-specialist-meta">
                        <span>💼 ${spec.experience} ${getYearsText(spec.experience)}</span>
                        <span>💰 ${spec.price.toLocaleString('ru-RU')} ₽</span>
                    </div>
                </div>
                <div class="admin-specialist-actions">
                    <button class="admin-btn admin-btn-secondary" onclick="editSpecialist(${spec.id})">
                        ✏️ Редактировать
                    </button>
                    <button class="admin-btn admin-btn-danger" onclick="deleteSpecialist(${spec.id})">
                        🗑️ Удалить
                    </button>
                </div>
            </div>
        `;
        }).join('');
    }

    function getSpecialistStatusText(status) {
        const statuses = {
            'available': 'Доступен',
            'waiting': 'Лист ожидания',
            'full': 'Запись закрыта'
        };
        return statuses[status] || status;
    }

    function getYearsText(years) {
        const lastDigit = years % 10;
        const lastTwoDigits = years % 100;

        if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
            return 'лет';
        }
        if (lastDigit === 1) {
            return 'год';
        }
        if (lastDigit >= 2 && lastDigit <= 4) {
            return 'года';
        }
        return 'лет';
    }

    window.filterSpecialists = function () {
        const statusFilter = document.getElementById('filterSpecialistStatus').value;
        const searchQuery = document.getElementById('searchSpecialist').value.toLowerCase();

        let filtered = window.specialistsData;

        if (statusFilter) {
            filtered = filtered.filter(s => s.status === statusFilter);
        }

        if (searchQuery) {
            filtered = filtered.filter(s =>
                s.name.toLowerCase().includes(searchQuery) ||
                s.role.toLowerCase().includes(searchQuery)
            );
        }

        document.getElementById('specialistsGrid').innerHTML = generateSpecialistsCards(filtered);
    };

    window.editSpecialist = function (id) {
        const specialist = window.specialistsData.find(s => s.id === id);
        if (!specialist) return;
        openSpecialistPopup(specialist);
    };
    
    window.closeSpecialistPopup = function () {
        document.getElementById('specialistPopup').classList.remove('active');
    };

    window.saveSpecialist = async function (id) {
        // Prepare data
        const data = {
            name: document.getElementById('specName').value,
            specialization: document.getElementById('specSpecialization').value,
            status: document.getElementById('specStatus').value,
            experience: parseFloat(document.getElementById('specExperience').value),
            price: parseInt(document.getElementById('specPrice').value),
            photo: document.getElementById('specPhoto').value,
            testimonials: JSON.stringify(window.currentTestimonials || []),
            page_blocks: JSON.stringify(getBlocksData())
        };

        try {
            const url = id ? 
                API_CONFIG.getApiUrl(`specialists/${id}`) :
                API_CONFIG.getApiUrl('specialists');
            
            const method = id ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                await adminSuccess(`Специалист ${id ? 'обновлен' : 'создан'} успешно!`);
                closeSpecialistPopup();
                loadSpecialists();
            } else {
                await adminError('Ошибка: ' + result.error);
            }
        } catch (error) {
            console.error('Error saving specialist:', error);
            await adminError('Ошибка сохранения: ' + error.message);
        }
    };

    window.addSpecialist = function () {
        openSpecialistPopup();
    };
    
    function openSpecialistPopup(specialist = null) {
        const popup = document.getElementById('specialistPopup');
        document.getElementById('specialistPopupTitle').textContent = specialist ? `Редактировать: ${specialist.name}` : 'Добавить нового специалиста';

        const popupBody = document.getElementById('specialistPopupBody');
        const imagePath = specialist?.photo ? (specialist.photo.startsWith('http') ? specialist.photo : '/' + specialist.photo) : '/images/hero-page.webp';
        
        popupBody.innerHTML = `
            <form class="admin-form" id="editSpecialistForm">
                <div class="admin-form-row">
                    <div class="admin-form-group">
                        <label class="admin-form-label">Имя *</label>
                        <input type="text" class="admin-form-input" id="specName" value="${specialist?.name || ''}" required>
                    </div>
                    <div class="admin-form-group">
                        <label class="admin-form-label">Статус *</label>
                        <select class="admin-form-input" id="specStatus" required>
                            <option value="available" ${specialist?.status === 'available' ? 'selected' : ''}>Доступен</option>
                            <option value="waiting" ${specialist?.status === 'waiting' ? 'selected' : ''}>Лист ожидания</option>
                            <option value="full" ${specialist?.status === 'full' ? 'selected' : ''}>Запись закрыта</option>
                        </select>
                    </div>
                </div>

                <div class="admin-form-group">
                    <label class="admin-form-label">Должности (через запятую) *</label>
                    <textarea class="admin-form-input" id="specSpecialization" rows="2" required>${specialist?.specialization || specialist?.role || ''}</textarea>
                </div>

                <div class="admin-form-row">
                    <div class="admin-form-group">
                        <label class="admin-form-label">Опыт (лет) *</label>
                        <input type="number" class="admin-form-input" id="specExperience" value="${specialist?.experience || 0}" required>
                    </div>
                    <div class="admin-form-group">
                        <label class="admin-form-label">Цена (₽) *</label>
                        <input type="number" class="admin-form-input" id="specPrice" value="${specialist?.price || 0}" required>
                    </div>
                </div>

                <div class="admin-form-group">
                    <label class="admin-form-label">Фото</label>
                    <div class="admin-photo-upload">
                        <img src="${imagePath}" alt="Preview" id="specPhotoPreview" class="admin-photo-preview" onerror="this.src='/images/hero-page.webp'">
                        <div class="admin-photo-controls">
                            <input type="file" id="specPhotoFile" accept="image/*" style="display: none;" onchange="handlePhotoUpload(event)">
                            <button type="button" class="admin-btn admin-btn-secondary" onclick="document.getElementById('specPhotoFile').click()">
                                📁 Загрузить файл
                            </button>
                            <input type="text" class="admin-form-input" id="specPhoto" value="${specialist?.photo || ''}" placeholder="или введите URL изображения">
                        </div>
                    </div>
                </div>

                <!-- Testimonials Section -->
                <div class="admin-testimonials-section">
                    <div class="admin-testimonials-header">
                        <h3 class="admin-testimonials-title">💬 Отзывы</h3>
                        <button type="button" class="admin-btn admin-btn-secondary" onclick="addSimpleTestimonial()">
                            ➕ Добавить отзыв
                        </button>
                    </div>
                    <div class="admin-testimonials-list" id="simpleTestimonialsList">
                        <!-- Testimonials will be rendered here -->
                    </div>
                </div>

                <!-- Page Blocks Section -->
                <div class="admin-blocks-section">
                    <div class="admin-blocks-header">
                        <h3 class="admin-blocks-title">📄 Блоки страницы специалиста</h3>
                        <div class="admin-add-block-menu">
                            <button type="button" class="admin-btn admin-btn-primary" onclick="toggleBlockMenu()">
                                ➕ Добавить блок
                            </button>
                            <div class="admin-add-block-dropdown" id="addBlockDropdown">
                                <div class="admin-block-type-option" onclick="addBlock('text')">
                                    <span>📝</span> Блок с текстом
                                </div>
                                <div class="admin-block-type-option" onclick="addBlock('list')">
                                    <span>📋</span> Блок с пунктами
                                </div>
                                <div class="admin-block-type-option" onclick="addBlock('about')">
                                    <span>👤</span> Блок о специалисте
                                </div>
                                <div class="admin-block-type-option" onclick="addBlock('payment')">
                                    <span>💳</span> Схема оплаты
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="admin-blocks-container" id="specialistBlocksContainer">
                        <!-- Blocks will be rendered here -->
                    </div>
                </div>

                <div class="admin-form-actions">
                    <button type="button" class="admin-btn admin-btn-secondary" onclick="closeSpecialistPopup()">Отмена</button>
                    <button type="submit" class="admin-btn admin-btn-primary">💾 ${specialist ? 'Сохранить' : 'Создать'}</button>
                </div>
            </form>
        `;

        popup.classList.add('active');

        // Close handlers
        popup.querySelector('.admin-popup-overlay').addEventListener('click', closeSpecialistPopup);
        popup.querySelector('.admin-popup-close').addEventListener('click', closeSpecialistPopup);

        // Handle form submission
        document.getElementById('editSpecialistForm').addEventListener('submit', function (e) {
            e.preventDefault();
            saveSpecialist(specialist?.id);
        });

        // Image preview update
        document.getElementById('specPhoto').addEventListener('input', function(e) {
            const preview = document.getElementById('specPhotoPreview');
            const value = e.target.value;
            if (value) {
                preview.src = value.startsWith('http') ? value : '/' + value;
            }
        });
        
        // Initialize testimonials
        const testimonials = specialist?.testimonials ? 
            (typeof specialist.testimonials === 'string' ? JSON.parse(specialist.testimonials) : specialist.testimonials) : [];
        window.currentTestimonials = testimonials;
        renderSimpleTestimonials();
        
        // Initialize blocks system
        const pageBlocks = specialist?.page_blocks ? 
            (typeof specialist.page_blocks === 'string' ? JSON.parse(specialist.page_blocks) : specialist.page_blocks) : [];
        initBlocksSystem(pageBlocks);
    }
    
    // Simple testimonials management
    window.currentTestimonials = [];
    
    window.addSimpleTestimonial = function() {
        window.currentTestimonials.push({ text: '', author: '' });
        renderSimpleTestimonials();
    };
    
    window.deleteSimpleTestimonial = function(index) {
        window.currentTestimonials.splice(index, 1);
        renderSimpleTestimonials();
    };
    
    function renderSimpleTestimonials() {
        const container = document.getElementById('simpleTestimonialsList');
        if (!container) return;
        
        const testimonials = window.currentTestimonials || [];
        
        if (testimonials.length === 0) {
            container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Нет отзывов. Нажмите "Добавить отзыв" чтобы создать первый.</p>';
            return;
        }
        
        container.innerHTML = testimonials.map((t, i) => `
            <div class="admin-testimonial-item">
                <div class="admin-form-row">
                    <div class="admin-form-group" style="flex: 3;">
                        <label class="admin-form-label">Текст отзыва</label>
                        <textarea class="admin-form-input simple-testimonial-field" rows="3"
                                  data-index="${i}" data-field="text"
                                  placeholder="Текст отзыва">${t.text || ''}</textarea>
                    </div>
                    <div class="admin-form-group" style="flex: 1;">
                        <label class="admin-form-label">Автор</label>
                        <input type="text" class="admin-form-input simple-testimonial-field"
                               data-index="${i}" data-field="author"
                               value="${t.author || ''}" placeholder="Имя автора">
                    </div>
                    <div class="admin-form-group" style="flex: 0;">
                        <label class="admin-form-label">&nbsp;</label>
                        <button type="button" class="admin-btn admin-btn-danger" 
                                onclick="deleteSimpleTestimonial(${i})">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Attach listeners
        document.querySelectorAll('.simple-testimonial-field').forEach(field => {
            field.addEventListener('input', function() {
                const index = parseInt(this.dataset.index);
                const fieldName = this.dataset.field;
                window.currentTestimonials[index][fieldName] = this.value;
            });
        });
    }
    
    window.toggleBlockMenu = function() {
        const dropdown = document.getElementById('addBlockDropdown');
        dropdown.classList.toggle('active');
    };
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        const menu = document.querySelector('.admin-add-block-menu');
        const dropdown = document.getElementById('addBlockDropdown');
        if (dropdown && !menu?.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });

    window.deleteSpecialist = async function (id) {
        if (!confirm('Вы уверены, что хотите удалить этого специалиста?')) {
            return;
        }

        try {
            const response = await fetch(API_CONFIG.getApiUrl(`specialists/${id}`), {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                alert('✅ Специалист удален!');
                loadSpecialists();
            } else {
                alert('❌ Ошибка: ' + data.error);
            }
        } catch (error) {
            console.error('Error deleting specialist:', error);
            alert('❌ Ошибка удаления: ' + error.message);
        }
    };

    // loadCourses is defined in admin-courses-certificates.js

    function loadCalendar() {
        pageTitle.textContent = 'Календарь';
        pageSubtitle.textContent = 'Расписание консультаций';

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        adminContent.innerHTML = `
            <div class="admin-section">
                <div class="admin-calendar-header">
                    <button class="admin-btn admin-btn-secondary" onclick="changeMonth(-1)">
                        ← Предыдущий
                    </button>
                    <h2 class="admin-calendar-title" id="calendarTitle">
                        ${getMonthName(currentMonth)} ${currentYear}
                    </h2>
                    <button class="admin-btn admin-btn-secondary" onclick="changeMonth(1)">
                        Следующий →
                    </button>
                </div>

                <div class="admin-calendar-controls">
                    <select class="admin-filter-select" id="calendarSpecialist">
                        <option value="">Все специалисты</option>
                        <option value="1">Маргарита Румянцева</option>
                        <option value="2">Ольга П.</option>
                        <option value="3">Анна Б.</option>
                        <option value="4">Анастасия</option>
                        <option value="5">Марина</option>
                    </select>
                    <button class="admin-btn admin-btn-primary" onclick="addAppointment()">
                        ➕ Добавить запись
                    </button>
                </div>

                <div class="admin-calendar" id="calendar">
                    ${generateCalendar(currentYear, currentMonth)}
                </div>

                <div class="admin-calendar-legend">
                    <div class="admin-legend-item">
                        <span class="admin-legend-color" style="background: #28a745;"></span>
                        <span>Подтверждено</span>
                    </div>
                    <div class="admin-legend-item">
                        <span class="admin-legend-color" style="background: #ffc107;"></span>
                        <span>Ожидает</span>
                    </div>
                    <div class="admin-legend-item">
                        <span class="admin-legend-color" style="background: #dc3545;"></span>
                        <span>Отменено</span>
                    </div>
                </div>
            </div>

            <!-- Appointment Popup -->
            <div class="admin-popup" id="appointmentPopup">
                <div class="admin-popup-overlay"></div>
                <div class="admin-popup-content">
                    <button class="admin-popup-close">&times;</button>
                    <h2 class="admin-popup-title">Добавить запись</h2>
                    <div class="admin-popup-body">
                        <form class="admin-form" id="appointmentForm">
                            <div class="admin-form-group">
                                <label class="admin-form-label">Дата *</label>
                                <input type="date" class="admin-form-input" id="appointmentDate" required>
                            </div>
                            <div class="admin-form-group">
                                <label class="admin-form-label">Время *</label>
                                <input type="time" class="admin-form-input" id="appointmentTime" required>
                            </div>
                            <div class="admin-form-group">
                                <label class="admin-form-label">Специалист *</label>
                                <select class="admin-form-input" id="appointmentSpecialist" required>
                                    <option value="">Выберите специалиста</option>
                                    <option value="1">Маргарита Румянцева</option>
                                    <option value="2">Ольга П.</option>
                                    <option value="3">Анна Б.</option>
                                    <option value="4">Анастасия</option>
                                    <option value="5">Марина</option>
                                </select>
                            </div>
                            <div class="admin-form-group">
                                <label class="admin-form-label">Клиент *</label>
                                <input type="text" class="admin-form-input" id="appointmentClient" required>
                            </div>
                            <div class="admin-form-group">
                                <label class="admin-form-label">Телефон</label>
                                <input type="tel" class="admin-form-input" id="appointmentPhone">
                            </div>
                            <div class="admin-form-group">
                                <label class="admin-form-label">Примечание</label>
                                <textarea class="admin-form-input" id="appointmentNote" rows="3"></textarea>
                            </div>
                            <div class="admin-form-actions">
                                <button type="button" class="admin-btn admin-btn-secondary" onclick="closeAppointmentPopup()">Отмена</button>
                                <button type="submit" class="admin-btn admin-btn-primary">💾 Сохранить</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        // Store current month/year
        window.currentCalendarMonth = currentMonth;
        window.currentCalendarYear = currentYear;

        // Initialize form handler
        const form = document.getElementById('appointmentForm');
        if (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                saveAppointment();
            });
        }
    }

    function generateCalendar(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        let html = '<div class="admin-calendar-grid">';

        // Week days header
        const weekDays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        weekDays.forEach(day => {
            html += `<div class="admin-calendar-weekday">${day}</div>`;
        });

        // Empty cells before first day
        for (let i = 0; i < startingDayOfWeek; i++) {
            html += '<div class="admin-calendar-day admin-calendar-day-empty"></div>';
        }

        // Days of month
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = date.toDateString() === today.toDateString();
            const dayClass = isToday ? 'admin-calendar-day-today' : '';

            html += `
                <div class="admin-calendar-day ${dayClass}" onclick="selectCalendarDay(${year}, ${month}, ${day})">
                    <div class="admin-calendar-day-number">${day}</div>
                    <div class="admin-calendar-day-events">
                        <!-- Events will be loaded here -->
                    </div>
                </div>
            `;
        }

        html += '</div>';
        return html;
    }

    function getMonthName(month) {
        const months = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        return months[month];
    }

    window.changeMonth = function (delta) {
        window.currentCalendarMonth += delta;

        if (window.currentCalendarMonth > 11) {
            window.currentCalendarMonth = 0;
            window.currentCalendarYear++;
        } else if (window.currentCalendarMonth < 0) {
            window.currentCalendarMonth = 11;
            window.currentCalendarYear--;
        }

        const calendar = document.getElementById('calendar');
        const title = document.getElementById('calendarTitle');

        if (calendar) {
            calendar.innerHTML = generateCalendar(window.currentCalendarYear, window.currentCalendarMonth);
        }
        if (title) {
            title.textContent = `${getMonthName(window.currentCalendarMonth)} ${window.currentCalendarYear}`;
        }
    };

    window.selectCalendarDay = function (year, month, day) {
        const date = new Date(year, month, day);
        const dateStr = date.toISOString().split('T')[0];

        document.getElementById('appointmentDate').value = dateStr;
        addAppointment();
    };

    window.addAppointment = function () {
        const popup = document.getElementById('appointmentPopup');
        popup.classList.add('active');

        // Set default date to today if not set
        const dateInput = document.getElementById('appointmentDate');
        if (!dateInput.value) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }

        // Close handlers
        popup.querySelector('.admin-popup-overlay').addEventListener('click', closeAppointmentPopup);
        popup.querySelector('.admin-popup-close').addEventListener('click', closeAppointmentPopup);
    };

    window.closeAppointmentPopup = function () {
        document.getElementById('appointmentPopup').classList.remove('active');
        document.getElementById('appointmentForm').reset();
    };

    window.saveAppointment = function () {
        const data = {
            date: document.getElementById('appointmentDate').value,
            time: document.getElementById('appointmentTime').value,
            specialist_id: document.getElementById('appointmentSpecialist').value,
            client: document.getElementById('appointmentClient').value,
            phone: document.getElementById('appointmentPhone').value,
            note: document.getElementById('appointmentNote').value
        };

        console.log('Saving appointment:', data);

        // Here you would save to backend
        alert('✅ Запись добавлена! (Функция сохранения в разработке)');
        closeAppointmentPopup();
    }

    async function loadSettings() {
        pageTitle.textContent = 'Настройки';
        pageSubtitle.textContent = 'Конфигурация системы';

        adminContent.innerHTML = `
            <div class="admin-section">
                <h2 class="admin-section-title">Интеграция с Telegram</h2>
                <p style="color: #666; margin-bottom: 20px;">
                    Настройте Telegram бота для получения уведомлений о новых заявках
                </p>

                <div class="admin-settings-form">
                    <div class="admin-form-group">
                        <label class="admin-toggle-label">
                            <input type="checkbox" id="telegramEnabled" class="admin-toggle-input">
                            <span class="admin-toggle-slider"></span>
                            <span class="admin-toggle-text">Включить Telegram уведомления</span>
                        </label>
                    </div>

                    <div class="admin-form-group">
                        <label class="admin-form-label">Telegram Bot Token</label>
                        <input type="text" id="telegramToken" class="admin-form-input" placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz">
                        <small class="admin-form-hint">Получите токен у <a href="https://t.me/botfather" target="_blank">@BotFather</a></small>
                    </div>

                    <div class="admin-form-group">
                        <label class="admin-form-label">Telegram Admin ID</label>
                        <input type="text" id="telegramAdminId" class="admin-form-input" placeholder="123456789">
                        <small class="admin-form-hint">Узнайте свой ID у <a href="https://t.me/userinfobot" target="_blank">@userinfobot</a></small>
                    </div>

                    <div class="admin-form-actions">
                        <button class="admin-btn admin-btn-secondary" id="testTelegramBtn">
                            🧪 Проверить подключение
                        </button>
                        <button class="admin-btn admin-btn-primary" id="saveSettingsBtn">
                            💾 Сохранить настройки
                        </button>
                    </div>

                    <div id="settingsMessage" class="admin-message" style="display: none;"></div>
                </div>
            </div>

            <div class="admin-section" style="margin-top: 30px;">
                <h2 class="admin-section-title">Инструкция по настройке</h2>
                <div class="admin-instructions">
                    <ol>
                        <li>Откройте Telegram и найдите <a href="https://t.me/botfather" target="_blank">@BotFather</a></li>
                        <li>Отправьте команду <code>/newbot</code> и следуйте инструкциям</li>
                        <li>Скопируйте полученный токен и вставьте в поле "Telegram Bot Token"</li>
                        <li>Найдите <a href="https://t.me/userinfobot" target="_blank">@userinfobot</a> и отправьте ему любое сообщение</li>
                        <li>Скопируйте ваш ID и вставьте в поле "Telegram Admin ID"</li>
                        <li>Включите тумблер "Включить Telegram уведомления"</li>
                        <li>Нажмите "Проверить подключение" для тестирования</li>
                        <li>Если тест успешен, нажмите "Сохранить настройки"</li>
                    </ol>
                </div>
            </div>
        `;

        // Load current settings
        try {
            const response = await fetch('/api/settings');
            const data = await response.json();

            if (data.success) {
                document.getElementById('telegramEnabled').checked = data.data.telegram_enabled === 'true';
                document.getElementById('telegramToken').value = data.data.telegram_bot_token || '';
                document.getElementById('telegramAdminId').value = data.data.telegram_admin_id || '';
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }

        // Initialize event listeners
        document.getElementById('testTelegramBtn').addEventListener('click', testTelegramConnection);
        document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    }

    async function testTelegramConnection() {
        const token = document.getElementById('telegramToken').value;
        const adminId = document.getElementById('telegramAdminId').value;
        const messageEl = document.getElementById('settingsMessage');

        if (!token || !adminId) {
            showMessage('Заполните все поля', 'error');
            return;
        }

        showMessage('Проверка подключения...', 'info');

        try {
            const response = await fetch('/api/settings/test-telegram', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, adminId })
            });

            const data = await response.json();

            if (data.success) {
                showMessage('✅ Подключение успешно! Проверьте Telegram', 'success');
            } else {
                showMessage('❌ Ошибка: ' + data.error, 'error');
            }
        } catch (error) {
            showMessage('❌ Ошибка подключения: ' + error.message, 'error');
        }
    }

    async function saveSettings() {
        const enabled = document.getElementById('telegramEnabled').checked;
        const token = document.getElementById('telegramToken').value;
        const adminId = document.getElementById('telegramAdminId').value;

        showMessage('Сохранение...', 'info');

        try {
            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegram_enabled: enabled,
                    telegram_bot_token: token,
                    telegram_admin_id: adminId
                })
            });

            const data = await response.json();

            if (data.success) {
                showMessage('✅ Настройки сохранены успешно!', 'success');
            } else {
                showMessage('❌ Ошибка: ' + data.error, 'error');
            }
        } catch (error) {
            showMessage('❌ Ошибка сохранения: ' + error.message, 'error');
        }
    }

    function showMessage(text, type) {
        const messageEl = document.getElementById('settingsMessage');
        messageEl.textContent = text;
        messageEl.className = 'admin-message admin-message-' + type;
        messageEl.style.display = 'block';

        if (type === 'success') {
            setTimeout(() => {
                messageEl.style.display = 'none';
            }, 5000);
        }
    }

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

    // Functions openRequestPopup, closeRequestPopup, saveRequestChanges are defined in admin-request-popup.js

    // Note: deleteRequest is now defined in admin-request-popup.js
    // This is kept for backward compatibility from table actions
    window.deleteRequestFromTable = async function (requestId) {
        const confirmed = await adminConfirm('Переместить заявку в корзину?');
        if (!confirmed) return;

        try {
            const response = await fetch(API_CONFIG.getApiUrl(`requests/${requestId}`), {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                await adminSuccess('Заявка перемещена в корзину!');
                updateRequestsBadge();
                loadRequests();
            } else {
                await adminError('Ошибка: ' + data.error);
            }
        } catch (error) {
            console.error('Error deleting request:', error);
            await adminError('Ошибка удаления: ' + error.message);
        }
    };

    window.createTestRequest = async function () {
        const testData = {
            name: 'Тестовый клиент ' + Date.now(),
            phone: '+7 (999) ' + Math.floor(Math.random() * 900 + 100) + '-' + Math.floor(Math.random() * 90 + 10) + '-' + Math.floor(Math.random() * 90 + 10),
            email: 'test' + Date.now() + '@example.com',
            request_type: ['consultation', 'specialist', 'certificate', 'course', 'supervision'][Math.floor(Math.random() * 5)],
            message: 'Это тестовая заявка, созданная из админ-панели',
            specialist_id: Math.floor(Math.random() * 5) + 1
        };

        try {
            const response = await fetch(API_CONFIG.getApiUrl('requests'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testData)
            });

            const data = await response.json();

            if (data.success) {
                await adminSuccess('Тестовая заявка создана! ID: ' + data.data.id);
                updateRequestsBadge();
                loadRequests();
            } else {
                await adminError('Ошибка: ' + data.error);
            }
        } catch (error) {
            console.error('Error creating test request:', error);
            alert('❌ Ошибка создания: ' + error.message);
        }
    };

    window.exportRequests = function () {
        alert('Функция экспорта в разработке');
    };

    // Bulk actions functions
    window.toggleSelectAll = function (checkbox) {
        const checkboxes = document.querySelectorAll('.admin-checkbox');
        checkboxes.forEach(cb => {
            cb.checked = checkbox.checked;
        });
        updateBulkActions();
    };

    window.updateBulkActions = function () {
        const checkboxes = document.querySelectorAll('.admin-checkbox:checked');
        const count = checkboxes.length;
        const panel = document.getElementById('bulkActionsPanel');
        const countSpan = document.getElementById('bulkSelectedCount');

        if (count > 0) {
            panel.style.display = 'flex';
            countSpan.textContent = count;
        } else {
            panel.style.display = 'none';
        }
    };

    window.getSelectedRequestIds = function () {
        const checkboxes = document.querySelectorAll('.admin-checkbox:checked');
        return Array.from(checkboxes).map(cb => parseInt(cb.dataset.requestId));
    };

    window.clearSelection = function () {
        const checkboxes = document.querySelectorAll('.admin-checkbox');
        checkboxes.forEach(cb => cb.checked = false);
        document.getElementById('selectAllRequests').checked = false;
        updateBulkActions();
    };

    window.bulkViewRequests = function () {
        const ids = getSelectedRequestIds();
        if (ids.length === 0) return;

        if (ids.length === 1) {
            openRequestPopup(ids[0]);
        } else {
            alert(`Выбрано ${ids.length} заявок. Откройте их по одной.`);
        }
    };

    window.bulkArchiveRequests = async function () {
        const ids = getSelectedRequestIds();
        if (ids.length === 0) return;

        // Check if any selected requests are already archived
        const selectedRequests = window.allRequests?.filter(r => ids.includes(r.id)) || [];
        const hasArchivedRequests = selectedRequests.some(r => r.archived === 1);
        
        let message, successMessage;
        if (hasArchivedRequests) {
            message = `Удалить ${ids.length} заявок из архива? Они будут перемещены в корзину.`;
            successMessage = 'Заявки удалены из архива!';
        } else {
            message = `Архивировать ${ids.length} заявок?`;
            successMessage = 'Заявки архивированы!';
        }

        const confirmed = await adminConfirm(message);
        if (!confirmed) return;

        try {
            const promises = ids.map(id => {
                const request = window.allRequests?.find(r => r.id === id);
                const isArchived = request?.archived === 1;
                const url = isArchived 
                    ? API_CONFIG.getApiUrl(`requests/${id}/archive?remove=true`)
                    : API_CONFIG.getApiUrl(`requests/${id}/archive`);
                    
                return fetch(url, { method: 'PUT' });
            });

            await Promise.all(promises);
            await adminSuccess(successMessage);
            clearSelection();
            updateRequestsBadge();
            loadRequests();
        } catch (error) {
            console.error('Error archiving requests:', error);
            await adminError('Ошибка архивирования');
        }
    };

    window.bulkDeleteRequests = async function () {
        const ids = getSelectedRequestIds();
        if (ids.length === 0) return;

        // Check if any selected requests are already deleted (in trash)
        const selectedRequests = window.allRequests?.filter(r => ids.includes(r.id)) || [];
        const hasDeletedRequests = selectedRequests.some(r => r.deleted === 1);
        
        let message, successMessage;
        if (hasDeletedRequests) {
            message = `Удалить ${ids.length} заявок НАВСЕГДА? Это действие нельзя отменить!`;
            successMessage = 'Заявки удалены навсегда!';
        } else {
            message = `Переместить ${ids.length} заявок в корзину?`;
            successMessage = 'Заявки перемещены в корзину!';
        }

        const confirmed = await adminConfirm(message);
        if (!confirmed) return;

        try {
            const promises = ids.map(id => {
                const request = window.allRequests?.find(r => r.id === id);
                const isPermanent = request?.deleted === 1;
                const url = isPermanent 
                    ? API_CONFIG.getApiUrl(`requests/${id}?permanent=true`)
                    : API_CONFIG.getApiUrl(`requests/${id}`);
                    
                return fetch(url, { method: 'DELETE' });
            });

            await Promise.all(promises);
            await adminSuccess(successMessage);
            clearSelection();
            updateRequestsBadge();
            loadRequests();
        } catch (error) {
            console.error('Error deleting requests:', error);
            await adminError('Ошибка удаления');
        }
    };

    window.bulkChangeStatus = async function () {
        const ids = getSelectedRequestIds();
        if (ids.length === 0) return;

        // Create custom modal for status selection
        const statusOptions = [
            { value: 'new', label: '🆕 Новая' },
            { value: 'pending', label: '⏳ В обработке' },
            { value: 'completed', label: '✅ Завершена' }
        ];

        const modal = document.createElement('div');
        modal.className = 'admin-modal active';
        modal.innerHTML = `
            <div class="admin-modal-overlay"></div>
            <div class="admin-modal-content">
                <h3 class="admin-modal-title">Выберите новый статус</h3>
                <div class="admin-modal-body">
                    <select id="bulkStatusSelect" class="admin-form-input">
                        ${statusOptions.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
                    </select>
                </div>
                <div class="admin-modal-actions">
                    <button class="admin-btn admin-btn-secondary" onclick="this.closest('.admin-modal').remove()">Отмена</button>
                    <button class="admin-btn admin-btn-primary" id="confirmBulkStatus">Применить</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('confirmBulkStatus').onclick = async function() {
            const status = document.getElementById('bulkStatusSelect').value;
            modal.remove();

            try {
                await Promise.all(ids.map(id =>
                    fetch(API_CONFIG.getApiUrl(`requests/${id}`), {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status })
                    })
                ));
                await adminSuccess('Статус обновлен!');
                clearSelection();
                updateRequestsBadge();
                loadRequests();
            } catch (error) {
                console.error('Error updating status:', error);
                await adminError('Ошибка обновления');
            }
        };
    };

    // Photo upload handler
    window.handlePhotoUpload = async function (event) {
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
        const preview = document.getElementById('specPhotoPreview');
        const photoInput = document.getElementById('specPhoto');
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

    async function initializeTabs() {
        const tabs = document.querySelectorAll('.admin-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', async function () {
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');

                const tabType = this.getAttribute('data-tab');
                console.log('Switched to tab:', tabType);

                // Load requests based on tab
                try {
                    const response = await fetch(API_CONFIG.getApiUrl(`requests?tab=${tabType}`));
                    const data = await response.json();

                    if (data.success) {
                        const requests = data.data;
                        window.allRequests = requests; // Update global requests
                        const tbody = document.getElementById('requestsTableBody');
                        if (tbody) {
                            tbody.innerHTML = requests.length > 0 ? requests.map(req => `
                                <tr data-request-id="${req.id}">
                                    <td>
                                        <input type="checkbox" class="admin-checkbox" data-request-id="${req.id}" onchange="updateBulkActions()">
                                    </td>
                                    <td>#${req.id}</td>
                                    <td>${req.name}</td>
                                    <td>${req.phone}</td>
                                    <td>${req.email || '-'}</td>
                                    <td>${getRequestTypeLabel(req.request_type)}</td>
                                    <td>${req.specialist_id ? 'ID: ' + req.specialist_id : '-'}</td>
                                    <td>${formatDate(req.created_at)}</td>
                                    <td><span class="admin-status-badge admin-status-${req.status}">${getStatusText(req.status)}</span></td>
                                    <td>
                                        <div class="admin-actions">
                                            <button class="admin-action-btn admin-action-view" onclick="openRequestPopup(${req.id})">Открыть</button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('') : '<tr><td colspan="10" style="text-align: center; padding: 40px; color: #999;">Нет заявок</td></tr>';
                        }
                        // Clear selection after tab switch
                        clearSelection();
                    }
                } catch (error) {
                    console.error('Error loading tab data:', error);
                }
            });
        });
    }

    function initializeFilters() {
        const filterStatus = document.getElementById('filterStatus');
        const filterType = document.getElementById('filterType');
        const filterSpecialist = document.getElementById('filterSpecialist');

        if (filterStatus) {
            filterStatus.addEventListener('change', applyFilters);
        }
        if (filterType) {
            filterType.addEventListener('change', applyFilters);
        }
        if (filterSpecialist) {
            filterSpecialist.addEventListener('change', applyFilters);
        }
    }

    async function applyFilters() {
        const status = document.getElementById('filterStatus')?.value;
        const type = document.getElementById('filterType')?.value;
        const specialist = document.getElementById('filterSpecialist')?.value;

        console.log('Applying filters:', { status, type, specialist });

        // Build query params
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (type) params.append('type', type);
        if (specialist) params.append('specialistId', specialist);

        try {
            const response = await fetch(API_CONFIG.getApiUrl(`requests?${params.toString()}`));
            const data = await response.json();

            if (data.success) {
                const filtered = data.data;

                // Update table
                const tbody = document.getElementById('requestsTableBody');
                if (tbody) {
                    tbody.innerHTML = filtered.length > 0 ? filtered.map(req => `
                        <tr data-request-id="${req.id}">
                            <td>#${req.id}</td>
                            <td>${req.name}</td>
                            <td>${req.phone}</td>
                            <td>${req.email || '-'}</td>
                            <td>${getRequestTypeLabel(req.request_type)}</td>
                            <td>${req.specialist_id ? 'ID: ' + req.specialist_id : '-'}</td>
                            <td>${formatDate(req.created_at)}</td>
                            <td><span class="admin-status-badge admin-status-${req.status}">${getStatusText(req.status)}</span></td>
                            <td>
                                <div class="admin-actions">
                                    <button class="admin-action-btn admin-action-view" onclick="openRequestPopup(${req.id})">Открыть</button>
                                    <button class="admin-action-btn admin-action-delete" onclick="deleteRequest(${req.id})">Удалить</button>
                                </div>
                            </td>
                        </tr>
                    `).join('') : '<tr><td colspan="9" style="text-align: center; padding: 40px; color: #999;">Нет заявок</td></tr>';
                }
            }
        } catch (error) {
            console.error('Error applying filters:', error);
        }
    }

    function initializeRequestActions() {
        // Close popup on overlay click
        const popup = document.getElementById('requestPopup');
        if (popup) {
            const overlay = popup.querySelector('.admin-popup-overlay');
            const closeBtn = popup.querySelector('.admin-popup-close');

            if (overlay) {
                overlay.addEventListener('click', closeRequestPopup);
            }
            if (closeBtn) {
                closeBtn.addEventListener('click', closeRequestPopup);
            }
        }
    }

    function getStatusText(status) {
        const statuses = {
            'new': 'Новая',
            'viewed': 'Просмотрена',
            'pending': 'В обработке',
            'completed': 'Завершена'
        };
        return statuses[status] || status;
    }

    async function updateRequestsBadge() {
        try {
            const response = await fetch(API_CONFIG.getApiUrl('requests/stats/summary'));
            const data = await response.json();

            const badge = document.querySelector('[data-page="requests"] .admin-badge');
            if (badge && data.success) {
                const newCount = data.data.new || 0;
                badge.textContent = newCount;
                
                // Change badge color based on new requests count
                if (newCount > 0) {
                    badge.classList.add('admin-badge-alert');
                    badge.classList.remove('admin-badge-inactive');
                } else {
                    badge.classList.remove('admin-badge-alert');
                    badge.classList.add('admin-badge-inactive');
                }
            }
        } catch (error) {
            console.error('Error updating badge:', error);
        }
    }

    // Make functions available globally
    window.updateRequestsBadge = updateRequestsBadge;
    window.loadRequests = loadRequests;
    window.loadDashboard = loadDashboard;
});
