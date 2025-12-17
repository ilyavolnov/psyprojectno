// Universal component loader with automatic path detection

(function() {
    // Determine the depth level based on current page location
    function getBasePath() {
        const path = window.location.pathname;
        const depth = (path.match(/\//g) || []).length - 1;
        
        // If in pages subdirectory (e.g., pages/specialists/specialists.html)
        if (path.includes('/pages/')) {
            return '../../';
        }
        // If in root (e.g., index.html)
        return '';
    }

    const basePath = getBasePath();

    // Load header
    fetch(basePath + 'includes/header.html')
        .then(response => response.text())
        .then(html => {
            const placeholder = document.getElementById('header-placeholder');
            if (placeholder) {
                // Update paths in header HTML
                const updatedHtml = html
                    .replace(/href="index\.html"/g, `href="${basePath}index.html"`)
                    .replace(/href="pages\/courses\/courses\.html"/g, `href="${basePath}pages/courses/courses.html"`)
                    .replace(/href="pages\/specialists\/specialists\.html"/g, `href="${basePath}pages/specialists/specialists.html"`)
                    .replace(/href="pages\/supervisions\/supervision\.html"/g, `href="${basePath}pages/supervisions/supervision.html"`)
                    .replace(/href="pages\/certificates\/certificates\.html"/g, `href="${basePath}pages/certificates/certificates.html"`);
                
                placeholder.innerHTML = updatedHtml;
                
                // Initialize consultation button
                const ctaButton = placeholder.querySelector('.cta-button');
                if (ctaButton && typeof openConsultationPopup === 'function') {
                    ctaButton.addEventListener('click', openConsultationPopup);
                }
                
                // Initialize burger menu
                initBurgerMenu();
            }
        })
        .catch(error => console.error('Error loading header:', error));
    
    // Burger menu initialization
    function initBurgerMenu() {
        const burgerMenu = document.querySelector('.burger-menu');
        const nav = document.querySelector('.nav');
        
        if (!burgerMenu || !nav) return;
        
        // Toggle menu
        burgerMenu.addEventListener('click', () => {
            burgerMenu.classList.toggle('active');
            nav.classList.toggle('active');
            document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
        });
        
        // Close menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                burgerMenu.classList.remove('active');
                nav.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && !burgerMenu.contains(e.target) && nav.classList.contains('active')) {
                burgerMenu.classList.remove('active');
                nav.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Load footer
    fetch(basePath + 'includes/footer.html')
        .then(response => response.text())
        .then(html => {
            const placeholder = document.getElementById('footer-placeholder');
            if (placeholder) {
                // Update paths in footer HTML
                const updatedHtml = html
                    .replace(/href="index\.html"/g, `href="${basePath}index.html"`)
                    .replace(/href="pages\/specialists\/specialists\.html"/g, `href="${basePath}pages/specialists/specialists.html"`)
                    .replace(/href="pages\/supervisions\/supervision\.html"/g, `href="${basePath}pages/supervisions/supervision.html"`)
                    .replace(/href="pages\/certificates\/certificates\.html"/g, `href="${basePath}pages/certificates/certificates.html"`)
                    .replace(/href="admin-login\.html"/g, `href="${basePath}admin-login.html"`);
                
                placeholder.innerHTML = updatedHtml;
            }
        })
        .catch(error => console.error('Error loading footer:', error));
})();
