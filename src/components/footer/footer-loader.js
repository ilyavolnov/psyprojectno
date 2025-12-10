// Footer Loader - Dynamically loads footer from includes/footer.html

(function() {
    // Find footer placeholder or create one
    const loadFooter = async () => {
        try {
            const response = await fetch('includes/footer.html');
            if (!response.ok) throw new Error('Footer not found');
            
            const footerHTML = await response.text();
            
            // Find existing footer or create placeholder
            let footerElement = document.querySelector('footer.footer');
            
            if (footerElement) {
                // Replace existing footer
                footerElement.outerHTML = footerHTML;
            } else {
                // Append to body if no footer exists
                document.body.insertAdjacentHTML('beforeend', footerHTML);
            }
        } catch (error) {
            console.error('Error loading footer:', error);
        }
    };

    // Load footer when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadFooter);
    } else {
        loadFooter();
    }
})();
