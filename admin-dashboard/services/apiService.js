// API Service for Memory Box Admin Dashboard
// Handles all API communication with the backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // Helper method to get auth headers
    getAuthHeaders() {
        const token = localStorage.getItem('adminToken');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
        };
    }

    // Generic API call method
    async apiCall(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getAuthHeaders(),
            ...options,
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                if (response.status === 401) {
                    // Token expired, redirect to login
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminUser');
                    window.location.href = '/admin/login';
                    throw new Error('Authentication required');
                }
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API call failed for ${endpoint}:`, error);
            throw error;
        }
    }

    // Authentication
    async login(credentials) {
        return this.apiCall('/admin/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    }

    async refreshToken() {
        return this.apiCall('/admin/auth/refresh', {
            method: 'POST',
        });
    }

    // Dashboard Statistics
    async getDashboardStats() {
        return this.apiCall('/admin/dashboard/stats');
    }

    async getRealTimeStats() {
        return this.apiCall('/admin/dashboard/realtime');
    }

    // User Management
    async getUsers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.apiCall(`/admin/users?${queryString}`);
    }

    async getUserById(userId) {
        return this.apiCall(`/admin/users/${userId}`);
    }

    async updateUser(userId, userData) {
        return this.apiCall(`/admin/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData),
        });
    }

    async deleteUser(userId) {
        return this.apiCall(`/admin/users/${userId}`, {
            method: 'DELETE',
        });
    }

    async banUser(userId, reason) {
        return this.apiCall(`/admin/users/${userId}/ban`, {
            method: 'POST',
            body: JSON.stringify({ reason }),
        });
    }

    // Content Management
    async getMemories(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.apiCall(`/admin/memories?${queryString}`);
    }

    async getMemoryById(memoryId) {
        return this.apiCall(`/admin/memories/${memoryId}`);
    }

    async updateMemory(memoryId, memoryData) {
        return this.apiCall(`/admin/memories/${memoryId}`, {
            method: 'PUT',
            body: JSON.stringify(memoryData),
        });
    }

    async deleteMemory(memoryId) {
        return this.apiCall(`/admin/memories/${memoryId}`, {
            method: 'DELETE',
        });
    }

    async moderateContent(contentId, action, reason) {
        return this.apiCall(`/admin/content/moderate`, {
            method: 'POST',
            body: JSON.stringify({ contentId, action, reason }),
        });
    }

    // AI Letters Management
    async getLetters(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.apiCall(`/admin/letters?${queryString}`);
    }

    async createLetter(letterData) {
        return this.apiCall('/admin/letters', {
            method: 'POST',
            body: JSON.stringify(letterData),
        });
    }

    async updateLetter(letterId, letterData) {
        return this.apiCall(`/admin/letters/${letterId}`, {
            method: 'PUT',
            body: JSON.stringify(letterData),
        });
    }

    async deleteLetter(letterId) {
        return this.apiCall(`/admin/letters/${letterId}`, {
            method: 'DELETE',
        });
    }

    async generateLetter(letterData) {
        return this.apiCall('/admin/letters/generate', {
            method: 'POST',
            body: JSON.stringify(letterData),
        });
    }

    // Analytics
    async getAnalytics(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.apiCall(`/admin/analytics?${queryString}`);
    }

    async getUserBehavior(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.apiCall(`/admin/analytics/behavior?${queryString}`);
    }

    async getRevenueAnalytics(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.apiCall(`/admin/analytics/revenue?${queryString}`);
    }

    // Revenue & Billing
    async getRevenueData(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.apiCall(`/admin/revenue?${queryString}`);
    }

    async getSubscriptions(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.apiCall(`/admin/subscriptions?${queryString}`);
    }

    async getTransactions(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.apiCall(`/admin/transactions?${queryString}`);
    }

    async retryFailedPayment(paymentId) {
        return this.apiCall(`/admin/payments/${paymentId}/retry`, {
            method: 'POST',
        });
    }

    async createCoupon(couponData) {
        return this.apiCall('/admin/coupons', {
            method: 'POST',
            body: JSON.stringify(couponData),
        });
    }

    async updateCoupon(couponId, couponData) {
        return this.apiCall(`/admin/coupons/${couponId}`, {
            method: 'PUT',
            body: JSON.stringify(couponData),
        });
    }

    // Automation & Workflows
    async getWorkflows(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.apiCall(`/admin/automation/workflows?${queryString}`);
    }

    async createWorkflow(workflowData) {
        return this.apiCall('/admin/automation/workflows', {
            method: 'POST',
            body: JSON.stringify(workflowData),
        });
    }

    async updateWorkflow(workflowId, workflowData) {
        return this.apiCall(`/admin/automation/workflows/${workflowId}`, {
            method: 'PUT',
            body: JSON.stringify(workflowData),
        });
    }

    async deleteWorkflow(workflowId) {
        return this.apiCall(`/admin/automation/workflows/${workflowId}`, {
            method: 'DELETE',
        });
    }

    async runWorkflow(workflowId) {
        return this.apiCall(`/admin/automation/workflows/${workflowId}/run`, {
            method: 'POST',
        });
    }

    async pauseWorkflow(workflowId) {
        return this.apiCall(`/admin/automation/workflows/${workflowId}/pause`, {
            method: 'POST',
        });
    }

    // Settings Management
    async getSettings() {
        return this.apiCall('/admin/settings');
    }

    async updateSettings(settingsData) {
        return this.apiCall('/admin/settings', {
            method: 'PUT',
            body: JSON.stringify(settingsData),
        });
    }

    async updateSMTPSettings(smtpData) {
        return this.apiCall('/admin/settings/smtp', {
            method: 'PUT',
            body: JSON.stringify(smtpData),
        });
    }

    async testSMTPConnection(smtpData) {
        return this.apiCall('/admin/settings/smtp/test', {
            method: 'POST',
            body: JSON.stringify(smtpData),
        });
    }

    // System Operations
    async getSystemHealth() {
        return this.apiCall('/admin/system/health');
    }

    async getSystemLogs(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.apiCall(`/admin/system/logs?${queryString}`);
    }

    async createBackup() {
        return this.apiCall('/admin/system/backup', {
            method: 'POST',
        });
    }

    async getBackups() {
        return this.apiCall('/admin/system/backups');
    }

    // Integrations
    async getIntegrations() {
        return this.apiCall('/admin/integrations');
    }

    async updateIntegration(integrationId, integrationData) {
        return this.apiCall(`/admin/integrations/${integrationId}`, {
            method: 'PUT',
            body: JSON.stringify(integrationData),
        });
    }

    async testIntegration(integrationId) {
        return this.apiCall(`/admin/integrations/${integrationId}/test`, {
            method: 'POST',
        });
    }

    // File Upload
    async uploadFile(file, folder = 'general') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        return this.apiCall('/admin/upload', {
            method: 'POST',
            headers: {
                'Authorization': this.getAuthHeaders().Authorization,
            },
            body: formData,
        });
    }

    // Bulk Operations
    async bulkDeleteUsers(userIds) {
        return this.apiCall('/admin/users/bulk-delete', {
            method: 'POST',
            body: JSON.stringify({ userIds }),
        });
    }

    async bulkUpdateUsers(userIds, updateData) {
        return this.apiCall('/admin/users/bulk-update', {
            method: 'POST',
            body: JSON.stringify({ userIds, updateData }),
        });
    }

    async exportData(type, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.apiCall(`/admin/export/${type}?${queryString}`);
    }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
