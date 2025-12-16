// Admin API Client
class AdminAPI {
    constructor() {
        // Use the API_CONFIG to get the base URL
    }

    async request(endpoint, options = {}) {
        const url = API_CONFIG.getApiUrl(endpoint);

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const config = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Requests endpoints
    async getRequests(filters = {}) {
        const params = new URLSearchParams(filters);
        return this.request(`/requests?${params}`);
    }

    async getRequest(id) {
        return this.request(`/requests/${id}`);
    }

    async createRequest(data) {
        return this.request('/requests', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateRequest(id, data) {
        return this.request(`/requests/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async archiveRequest(id) {
        return this.request(`/requests/${id}/archive`, {
            method: 'PUT',
        });
    }

    async deleteRequest(id) {
        return this.request(`/requests/${id}`, {
            method: 'DELETE',
        });
    }

    async getRequestsStats() {
        return this.request('/requests/stats/summary');
    }
}

// Export for use in admin panel
const adminAPI = new AdminAPI();
