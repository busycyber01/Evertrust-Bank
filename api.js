// API configuration
const API_BASE_URL = 'https://evertrust-backend.onrender.com/'; // Replace with your actual backend URL

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
        },
    };
    
    const config = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    };
    
    if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        // Handle unauthorized responses
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
            throw new Error('Authentication failed');
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || `API request failed with status ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
}

// Auth API calls
const authAPI = {
    signup: (userData) => apiCall('/api/auth/signup', {
        method: 'POST',
        body: userData,
    }),
    
    login: (credentials) => apiCall('/api/auth/login', {
        method: 'POST',
        body: credentials,
    }),
};

// User API calls
const userAPI = {
    getBalance: () => apiCall('/api/users/balance'),
    
    getTransactions: (limit = 10) => apiCall(`/api/users/transactions?limit=${limit}`),
    
    requestFunds: (amount, reason) => apiCall('/api/users/request-funds', {
        method: 'POST',
        body: { amount, reason },
    }),
    
    getFundRequests: () => apiCall('/api/users/fund-requests'),
    
    transfer: (recipientEmail, amount, description) => apiCall('/api/transfer', {
        method: 'POST',
        body: { recipientEmail, amount, description },
    }),
    
    withdraw: (amount, description) => apiCall('/api/withdraw', {
        method: 'POST',
        body: { amount, description },
    }),
    
    getProfile: () => apiCall('/api/users/profile'),
};

// Admin API calls
const adminAPI = {
    getDashboardStats: () => apiCall('/api/admin/dashboard/stats'),
    
    getFundRequests: (status = null, page = 1, limit = 10) => {
        let url = `/api/admin/fund-requests?page=${page}&limit=${limit}`;
        if (status) url += `&status=${status}`;
        return apiCall(url);
    },
    
    approveRequest: (requestId) => apiCall(`/api/admin/fund-requests/${requestId}/approve`, {
        method: 'POST',
    }),
    
    rejectRequest: (requestId, reason) => apiCall(`/api/admin/fund-requests/${requestId}/reject`, {
        method: 'POST',
        body: { reason },
    }),
    
    getUsers: (page = 1, limit = 10) => apiCall(`/api/admin/users?page=${page}&limit=${limit}`),
    
    getUser: (userId) => apiCall(`/api/admin/users/${userId}`),
    
    addFunds: (userId, amount, description) => apiCall(`/api/admin/users/${userId}/add-funds`, {
        method: 'POST',
        body: { amount, description },
    }),
    
    getTransactions: (page = 1, limit = 50) => apiCall(`/api/admin/transactions?page=${page}&limit=${limit}`),
    
    getTransaction: (transactionId) => apiCall(`/api/admin/transactions/${transactionId}`),
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        authAPI,
        userAPI,
        adminAPI
    };
}
