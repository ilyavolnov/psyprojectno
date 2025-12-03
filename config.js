// API Configuration
const API_CONFIG = {
    getBaseURL: function() {
        // В продакшене используем относительные пути
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3001/api';
        }
        return '/api';
    }
};

// Export for use in other files
window.API_CONFIG = API_CONFIG;
