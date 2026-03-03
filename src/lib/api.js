import axios from 'axios';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => {
        return response.data?.data || response.data;
    },
    (error) => {
        const message = error.response?.data?.message || error.message || 'Something went wrong';
        return Promise.reject(new Error(message));
    }
);

export async function login(email, password) {
    return api.post('/auth/login', { email, password });
}

export async function fetchVendors() {
    return api.get('/vendors');
}

export async function createVendor(vendorData) {
    return api.post('/vendors', vendorData);
}

export async function fetchPayouts(filters = {}) {
    return api.get('/payouts', { params: filters });
}

export async function fetchPayoutById(id) {
    return api.get(`/payouts/${id}`);
}

export async function createPayout(payoutData) {
    return api.post('/payouts', payoutData);
}

export async function submitPayout(id) {
    return api.post(`/payouts/${id}/submit`);
}

export async function approvePayout(id) {
    return api.post(`/payouts/${id}/approve`);
}

export async function rejectPayout(id, decision_reason) {
    return api.post(`/payouts/${id}/reject`, { decision_reason });
}
