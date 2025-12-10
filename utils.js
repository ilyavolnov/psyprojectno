// Утилитарные функции для всего приложения

// Helper function to determine base path based on current location
function getBasePath() {
    return window.location.pathname.includes('/pages/') ? '../..' : '.';
}

// Helper function to get API base URL
function getApiBaseUrl() {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3001/api'
        : '/api';
}

// Универсальная функция для получения данных о курсе
async function getCourse(identifier, isSlug = true) {
    try {
        const apiPath = getApiBaseUrl();
        const endpoint = isSlug 
            ? `${apiPath}/courses/slug/${identifier}` 
            : `${apiPath}/courses/${identifier}`;
            
        const response = await fetch(endpoint);
        const data = await response.json();
        
        return data;
    } catch (error) {
        console.error('Error fetching course:', error);
        return { success: false, error: error.message };
    }
}

// Универсальная функция для отправки запросов
async function sendRequest(data) {
    try {
        const apiPath = getApiBaseUrl();
        const response = await fetch(`${apiPath}/requests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        return await response.json();
    } catch (error) {
        console.error('Error sending request:', error);
        return { success: false, error: error.message };
    }
}

// Универсальная функция для валидации промокода
async function validatePromoCode(code) {
    try {
        const apiPath = getApiBaseUrl();
        const response = await fetch(`${apiPath}/promo-codes/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code })
        });

        return await response.json();
    } catch (error) {
        console.error('Error validating promo code:', error);
        return { success: false, error: error.message };
    }
}

// Make functions available globally
window.getBasePath = getBasePath;
window.getApiBaseUrl = getApiBaseUrl;
window.getCourse = getCourse;
window.sendRequest = sendRequest;
window.validatePromoCode = validatePromoCode;