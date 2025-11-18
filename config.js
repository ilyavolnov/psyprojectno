// API Configuration
const API_CONFIG = {
    // Автоматически определяем URL API
    baseURL: window.location.hostname === 'localhost' 
        ? 'http://localhost:3001'
        : window.location.origin,
    
    // Endpoints
    endpoints: {
        specialists: '/api/specialists',
        courses: '/api/courses',
        supervisions: '/api/supervisions',
        requests: '/api/requests',
        promoCodes: '/api/promo-codes',
        settings: '/api/settings',
        upload: '/api/upload'
    }
};

// Helper function для API запросов
window.apiRequest = async function(endpoint, options = {}) {
    const url = `${API_CONFIG.baseURL}${endpoint}`;
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };
    
    const response = await fetch(url, { ...defaultOptions, ...options });
    return response.json();
};
