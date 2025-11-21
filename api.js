// ============================================
// API Configuration
// ============================================

const API_CONFIG = {
    BASE_URL: 'https://oasis-app-api.vercel.app/api',
    
    // Endpoints
    ENDPOINTS: {
        // Auth
        LOGIN: '/login',
        SIGNUP: '/signup',
        USERS: '/users',
        
        // Habits
        HABITS: '/habits',
        HABIT_BY_ID: (id) => `/habits/${id}`,
        HABIT_TOGGLE: (id) => `/habits/${id}/toggle`,
        HABITS_BY_USER: (userId) => `/habits/user/${userId}`,
        
        // Categories
        CATEGORIES: '/categories',
        CATEGORY_BY_ID: (id) => `/categories/${id}`,
        CATEGORIES_BY_USER: (userId) => `/categories/user/${userId}`,
        
        // Journal
        JOURNAL: '/journal',
        JOURNAL_BY_ID: (id) => `/journal/${id}`,
        JOURNAL_BY_USER: (userId) => `/journal/user/${userId}`,
        JOURNAL_BY_DATE: (userId, date) => `/journal/user/${userId}/date/${date}`
    }
};

// ============================================
// API Service - HTTP Requests
// ============================================

const API = {
    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;
        
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
                // Retorna o erro do servidor sem lançar exceção
                return { success: false, error: data.erro || data.error || 'Erro desconhecido' };
            }
            
            return data;
        } catch (error) {
            // Erro de rede ou de conexão
            console.error('API Error:', error);
            return { success: false, error: 'Erro na requisição. Verifique sua conexão.' };
        }
    },
    
    // GET request
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },
    
    // POST request
    async post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    },
    
    // PUT request
    async put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    },
    
    // DELETE request
    async delete(endpoint, body = null) {
        const options = { method: 'DELETE' };
        if (body) {
            options.body = JSON.stringify(body);
        }
        return this.request(endpoint, options);
    },
    
    // ========================================
    // AUTH ENDPOINTS
    // ========================================
    
    async login(email, senha) {
        return this.post(API_CONFIG.ENDPOINTS.LOGIN, { email, senha });
    },
    
    async signup(userData) {
        return this.post(API_CONFIG.ENDPOINTS.SIGNUP, userData);
    },
    
    async getUsers() {
        return this.get(API_CONFIG.ENDPOINTS.USERS);
    },

    async updateUser(userId, userData) {
        return this.put(`${API_CONFIG.ENDPOINTS.USERS}/${userId}`, userData);
    },
    
    // ========================================
    // HABITS ENDPOINTS
    // ========================================
    
    async getHabits() {
        return this.get(API_CONFIG.ENDPOINTS.HABITS);
    },
    
    async getHabitsByUser(userId) {
        return this.get(API_CONFIG.ENDPOINTS.HABITS_BY_USER(userId));
    },
    
    async getHabitById(id) {
        return this.get(API_CONFIG.ENDPOINTS.HABIT_BY_ID(id));
    },
    
    async createHabit(habitData) {
        return this.post(API_CONFIG.ENDPOINTS.HABITS, habitData);
    },
    
    async updateHabit(id, habitData) {
        return this.put(API_CONFIG.ENDPOINTS.HABIT_BY_ID(id), habitData);
    },
    
    async deleteHabit(id) {
        return this.delete(API_CONFIG.ENDPOINTS.HABIT_BY_ID(id));
    },
    
    async toggleHabitComplete(id) {
        return this.post(API_CONFIG.ENDPOINTS.HABIT_TOGGLE(id));
    },
    
    // ========================================
    // CATEGORIES ENDPOINTS
    // ========================================
    
    async getCategories(userId = null) {
        const endpoint = userId 
            ? `${API_CONFIG.ENDPOINTS.CATEGORIES}?user_id=${userId}`
            : API_CONFIG.ENDPOINTS.CATEGORIES;
        return this.get(endpoint);
    },
    
    async getCategoryById(id) {
        return this.get(API_CONFIG.ENDPOINTS.CATEGORY_BY_ID(id));
    },
    
    async getUserCategories(userId) {
        return this.get(API_CONFIG.ENDPOINTS.CATEGORIES_BY_USER(userId));
    },
    
    async createCategory(categoryData) {
        return this.post(API_CONFIG.ENDPOINTS.CATEGORIES, categoryData);
    },
    
    async updateCategory(id, categoryData) {
        return this.put(API_CONFIG.ENDPOINTS.CATEGORY_BY_ID(id), categoryData);
    },
    
    async deleteCategory(id, userId) {
        return this.delete(API_CONFIG.ENDPOINTS.CATEGORY_BY_ID(id), { user_id: userId });
    },
    
    // ========================================
    // JOURNAL ENDPOINTS
    // ========================================
    
    async getJournalEntries() {
        return this.get(API_CONFIG.ENDPOINTS.JOURNAL);
    },
    
    async getJournalEntriesByUser(userId) {
        return this.get(API_CONFIG.ENDPOINTS.JOURNAL_BY_USER(userId));
    },
    
    async getJournalEntryById(id) {
        return this.get(API_CONFIG.ENDPOINTS.JOURNAL_BY_ID(id));
    },
    
    async getJournalEntryByDate(userId, date) {
        return this.get(API_CONFIG.ENDPOINTS.JOURNAL_BY_DATE(userId, date));
    },
    
    async createJournalEntry(entryData) {
        return this.post(API_CONFIG.ENDPOINTS.JOURNAL, entryData);
    },
    
    async updateJournalEntry(id, entryData) {
        return this.put(API_CONFIG.ENDPOINTS.JOURNAL_BY_ID(id), entryData);
    },
    
    async deleteJournalEntry(id, userId) {
        return this.delete(API_CONFIG.ENDPOINTS.JOURNAL_BY_ID(id), { user_id: userId });
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_CONFIG, API };
}
