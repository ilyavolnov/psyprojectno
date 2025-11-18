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
                    .replace(/href="index\.html#courses"/g, `href="${basePath}index.html#courses"`)
                    .replace(/href="index\.html"/g, `href="${basePath}index.html"`)
                    .replace(/href="pages\/specialists\/specialists\.html"/g, `href="${basePath}pages/specialists/specialists.html"`)
                    .replace(/href="pages\/supervisions\/supervision\.html"/g, `href="${basePath}pages/supervisions/supervision.html"`)
                    .replace(/href="pages\/certificates\/certificates\.html"/g, `href="${basePath}pages/certificates/certificates.html"`);
                
                placeholder.innerHTML = updatedHtml;
                
                // Initialize consultation button
                const ctaButton = placeholder.querySelector('.cta-button');
                if (ctaButton && typeof openConsultationPopup === 'function') {
                    ctaButton.addEventListener('click', openConsultationPopup);
                }
            }
        })
        .catch(error => console.error('Error loading header:', error));

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
