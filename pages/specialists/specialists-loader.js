// Specialists Data Loader
class SpecialistsManager {
    constructor() {
        this.specialists = [];
        this.displayedCount = 0;
        this.itemsPerPage = 9;
        this.container = document.querySelector('.specialists-grid');
        this.loadMoreBtn = document.querySelector('.load-more-btn');
        
        this.init();
    }

    async init() {
        await this.loadData();
        this.renderSpecialists();
        this.setupLoadMore();
    }

    async loadData() {
        try {
            // Try loading from API first (always fresh data)
            try {
                const apiResponse = await fetch('http://localhost:3001/api/specialists');
                const apiData = await apiResponse.json();
                
                if (apiData.success && apiData.data) {
                    console.log('✅ Loaded specialists from API');
                    this.specialists = apiData.data;
                    
                    // Sort by status: available -> waiting -> full
                    const statusOrder = { 'available': 1, 'waiting': 2, 'full': 3 };
                    this.specialists.sort((a, b) => {
                        return statusOrder[a.status] - statusOrder[b.status];
                    });
                    return;
                }
            } catch (apiError) {
                console.log('⚠️ API not available, falling back to JSON file');
            }
            
            // Fallback to JSON file
            const response = await fetch('specialists-data.json');
            const data = await response.json();
            
            // Sort by status: available -> waiting -> full
            const statusOrder = { 'available': 1, 'waiting': 2, 'full': 3 };
            this.specialists = data.specialists.sort((a, b) => {
                return statusOrder[a.status] - statusOrder[b.status];
            });
        } catch (error) {
            console.error('Error loading specialists:', error);
        }
    }

    getStatusBadge(status) {
        const badges = {
            'available': '<span class="status-badge status-available">Доступен</span>',
            'full': '<span class="status-badge status-full">Полная запись</span>',
            'waiting': '<span class="status-badge status-waiting">Лист ожидания</span>'
        };
        return badges[status] || '';
    }

    getButtonText(status) {
        const buttons = {
            'available': 'Записаться',
            'full': 'Полная запись',
            'waiting': 'В лист ожидания'
        };
        return buttons[status] || 'Записаться';
    }

    createSpecialistCard(specialist) {
        const specTags = specialist.specializations.map(spec => 
            `<span class="spec-tag">✦ ${spec}</span>`
        ).join('');

        const statusBadge = this.getStatusBadge(specialist.status);
        const buttonText = this.getButtonText(specialist.status);
        const buttonDisabled = specialist.status === 'full' ? 'disabled' : '';

        return `
            <div class="specialist-card" data-scroll>
                <div class="specialist-photo">
                    <img src="${specialist.photo}" alt="${specialist.name}">
                    ${statusBadge}
                </div>
                <div class="specialist-info">
                    <div class="specialist-info-top">
                        <h3 class="specialist-name">${specialist.name}</h3>
                        <p class="specialist-role">${specialist.role}</p>
                        <div class="specialist-specialization">
                            ${specTags}
                        </div>
                        <p class="specialist-experience">Опыт: ${specialist.experience} лет</p>
                    </div>
                    <div class="specialist-info-bottom">
                        <p class="specialist-price">${specialist.price} ₽</p>
                        <div class="specialist-actions">
                            <a href="specialist-profile.html?id=${specialist.id}" class="specialist-btn specialist-btn-outline">Подробнее</a>
                            <button class="specialist-btn specialist-btn-primary" ${buttonDisabled}>${buttonText}</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderSpecialists() {
        const start = this.displayedCount;
        const end = Math.min(start + this.itemsPerPage, this.specialists.length);
        
        for (let i = start; i < end; i++) {
            const card = this.createSpecialistCard(this.specialists[i]);
            this.container.insertAdjacentHTML('beforeend', card);
        }
        
        this.displayedCount = end;
        
        // Update load more button
        if (this.loadMoreBtn) {
            if (this.displayedCount >= this.specialists.length) {
                this.loadMoreBtn.style.display = 'none';
            }
        }

        // Trigger scroll animations
        this.triggerScrollAnimations();
    }

    setupLoadMore() {
        if (this.loadMoreBtn) {
            this.loadMoreBtn.addEventListener('click', () => {
                this.renderSpecialists();
            });
        }
    }

    triggerScrollAnimations() {
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            const newCards = document.querySelectorAll('.specialist-card:not(.animated)');
            
            newCards.forEach((card, index) => {
                card.classList.add('animated');
                
                // Set initial state
                gsap.set(card, { opacity: 0, y: 50 });
                
                // Animate
                gsap.to(card, {
                    scrollTrigger: {
                        trigger: card,
                        start: 'top bottom-=50',
                        toggleActions: 'play none none none',
                        once: true
                    },
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    delay: index * 0.1,
                    ease: 'power3.out'
                });
            });
        } else {
            const newCards = document.querySelectorAll('.specialist-card:not(.animated)');
            newCards.forEach(card => {
                card.classList.add('animated');
                card.style.opacity = '1';
            });
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.specialists-grid');
    
    if (grid) {
        new SpecialistsManager();
    }
    
    // Parallax effect for clouds
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        const clouds = document.querySelectorAll('[data-parallax]');
        
        clouds.forEach((cloud) => {
            const section = cloud.closest('section');
            
            if (section) {
                gsap.fromTo(cloud,
                    {
                        y: 0,
                        x: 0
                    },
                    {
                        y: -80,
                        x: 20,
                        scrollTrigger: {
                            trigger: section,
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: 1.5
                        }
                    }
                );
            }
        });
    }
});
