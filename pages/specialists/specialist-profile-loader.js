// Specialist Profile Loader
class SpecialistProfile {
    constructor() {
        this.specialist = null;
        this.container = document.getElementById('profileContent');
        this.init();
    }

    async init() {
        const specialistId = this.getSpecialistId();
        if (specialistId) {
            await this.loadSpecialist(specialistId);
            this.render();
        } else {
            this.showError('Специалист не найден');
        }
    }

    getSpecialistId() {
        const params = new URLSearchParams(window.location.search);
        return parseInt(params.get('id'));
    }

    async loadSpecialist(id) {
        try {
            // Try loading from API first
            const response = await fetch(`http://localhost:3001/api/specialists/${id}`);
            const data = await response.json();
            if (data.success) {
                this.specialist = data.data;
                // Parse JSON fields
                if (typeof this.specialist.testimonials === 'string') {
                    this.specialist.testimonials = JSON.parse(this.specialist.testimonials || '[]');
                }
                if (typeof this.specialist.page_blocks === 'string') {
                    this.specialist.page_blocks = JSON.parse(this.specialist.page_blocks || '[]');
                }
            }
        } catch (error) {
            console.error('Error loading specialist from API:', error);
            // Fallback to JSON file
            try {
                const response = await fetch('specialists-data.json');
                const data = await response.json();
                this.specialist = data.specialists.find(s => s.id === id);
            } catch (fallbackError) {
                console.error('Error loading specialist from JSON:', fallbackError);
            }
        }
    }

    getStatusBadge(status) {
        const badges = {
            'available': '<span class="status-badge status-available">Доступен для записи</span>',
            'full': '<span class="status-badge status-full">Полная запись</span>',
            'waiting': '<span class="status-badge status-waiting">Запись в лист ожидания</span>'
        };
        return badges[status] || '';
    }

    getButtonText(status) {
        const buttons = {
            'available': 'Записаться на консультацию',
            'full': 'Полная запись',
            'waiting': 'Записаться в лист ожидания'
        };
        return buttons[status] || 'Записаться';
    }

    render() {
        if (!this.specialist) {
            this.showError('Специалист не найден');
            return;
        }

        const spec = this.specialist;
        
        // Update breadcrumb
        const breadcrumbName = document.getElementById('breadcrumbName');
        if (breadcrumbName) {
            breadcrumbName.textContent = spec.name;
        }
        
        // Update page title
        document.title = `${spec.name} - Специалист - Маргарита Румянцева`;
        
        // Handle specializations - can be array or string
        let specializations = [];
        if (spec.specializations && Array.isArray(spec.specializations)) {
            specializations = spec.specializations;
        } else if (spec.specialization) {
            // If it's a string, split by comma
            specializations = spec.specialization.split(',').map(s => s.trim());
        }
        
        const specTags = specializations.map(s => 
            `<span class="spec-tag">✦ ${s}</span>`
        ).join('');

        const statusBadge = this.getStatusBadge(spec.status);
        const buttonText = this.getButtonText(spec.status);
        const buttonDisabled = spec.status === 'full' ? 'disabled' : '';
        const description = spec.description || 'Описание специалиста будет добавлено позже.';

        this.container.innerHTML = `
            <div class="profile-header">
                <div class="profile-photo">
                    <img src="${spec.photo}" alt="${spec.name}">
                    ${statusBadge}
                </div>
                <div class="profile-info">
                    <h1 class="profile-name">${spec.name}</h1>
                    <p class="profile-role">${spec.role || spec.specialization || ''}</p>
                    <div class="profile-specializations">
                        ${specTags}
                    </div>
                    <div class="profile-meta">
                        <div class="profile-meta-item">
                            <span class="meta-label">Опыт работы:</span>
                            <span class="meta-value">${spec.experience} лет</span>
                        </div>
                        <div class="profile-meta-item">
                            <span class="meta-label">Стоимость:</span>
                            <span class="meta-value">${spec.price} ₽</span>
                        </div>
                        ${spec.duration ? `
                        <div class="profile-meta-item">
                            <span class="meta-label">Длительность:</span>
                            <span class="meta-value">${spec.duration}</span>
                        </div>` : ''}
                    </div>
                    <p class="profile-price-note">*стоимость онлайн-консультации</p>
                    <div class="profile-actions">
                        <button class="profile-cta-btn profile-pay-btn" ${buttonDisabled} data-price="${spec.price}" data-specialist="${spec.name}">
                            <span>Оплатить</span>
                        </button>
                        <button class="profile-cta-btn profile-schedule-btn">
                            <span>Расписание</span>
                        </button>
                    </div>
                    <button class="profile-review-btn-secondary">
                        <span>Оставить отзыв</span>
                    </button>
                </div>
            </div>

            <div class="profile-details">
                <div class="profile-block">
                    <h3 class="profile-block-title">О специалисте</h3>
                    <p class="profile-description">${description}</p>
                </div>

                ${this.renderPageBlocks()}
            </div>
        `;
    }

    renderPageBlocks() {
        const spec = this.specialist;
        
        // If page_blocks exist in database, use them
        if (spec.page_blocks && spec.page_blocks.length > 0) {
            return spec.page_blocks.map(block => this.renderBlock(block)).join('');
        }
        
        // Fallback to old structure
        const blocks = [];
        
        if (spec.therapyMethods && spec.therapyMethods.length > 0) {
            blocks.push(this.renderBlock({
                type: 'list',
                title: 'Терапия в доказательных модальностях',
                items: spec.therapyMethods
            }));
        }
        
        if (spec.additionalServices) {
            blocks.push(this.renderBlock({
                type: 'text',
                title: 'Дополнительные услуги',
                content: spec.additionalServices
            }));
        }
        
        if (spec.education && spec.education.length > 0) {
            blocks.push(this.renderBlock({
                type: 'list',
                title: 'Образование',
                items: spec.education
            }));
        }
        
        if (spec.approaches && spec.approaches.length > 0) {
            blocks.push(this.renderBlock({
                type: 'list',
                title: 'Подходы в работе',
                items: spec.approaches
            }));
        }
        
        if (spec.testimonials && spec.testimonials.length > 0) {
            blocks.push(this.renderBlock({
                type: 'testimonials',
                title: 'Отзывы клиентов',
                testimonials: spec.testimonials
            }));
        }
        
        return blocks.join('');
    }
    
    renderBlock(block) {
        switch(block.type) {
            case 'text':
            case 'about':
                return `
                    <div class="profile-block">
                        <h3 class="profile-block-title">${block.title}</h3>
                        <p class="profile-description">${block.content}</p>
                    </div>
                `;
                
            case 'list':
                return `
                    <div class="profile-block">
                        <h3 class="profile-block-title">${block.title}</h3>
                        <ul class="profile-list">
                            ${block.items.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                `;
                
            case 'payment':
                return `
                    <div class="profile-block payment-block">
                        <h3 class="profile-block-title">${block.title}</h3>
                        <div class="payment-info">
                            ${block.items.map(item => `<p>${item}</p>`).join('')}
                        </div>
                    </div>
                `;
                
            case 'testimonials':
                if (!block.testimonials || block.testimonials.length === 0) return '';
                return `
                    <div class="profile-block testimonials-block">
                        <h3 class="profile-block-title">${block.title || 'Отзывы клиентов'}</h3>
                        <div class="testimonials-list">
                            ${block.testimonials.map(t => `
                                <div class="testimonial-item">
                                    <p class="testimonial-text">"${t.text}"</p>
                                    <p class="testimonial-author">— ${t.author}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
                
            default:
                return '';
        }
    }

    showError(message) {
        this.container.innerHTML = `
            <div class="error-message">
                <h2>${message}</h2>
                <a href="specialists.html" class="specialist-btn specialist-btn-primary">Вернуться к списку</a>
            </div>
        `;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('profileContent')) {
        new SpecialistProfile();
    }
});
