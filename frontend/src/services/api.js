import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const checkHealth = () => api.get('/health');

// Triage
export const submitTriage = (data) => api.post('/triage', data);
export const getTriageCases = () => api.get('/triage/cases');
export const getTriageCase = (id) => api.get(`/triage/cases/${id}`);

// Teleconsultation
export const getTeleconsultOptions = (caseId) => api.get(`/teleconsult/options/${caseId}`);
export const bookAppointment = (data) => api.post('/teleconsult/book', data);
export const getAppointments = () => api.get('/teleconsult/appointments');

// Medicine Stock
export const getStock = () => api.get('/stock');
export const updateStock = (id, quantity) => api.patch(`/stock/${id}`, { quantity });

// Follow-ups
export const getFollowUps = () => api.get('/followup');
export const updateFollowUp = (id, data) => api.patch(`/followup/${id}`, data);

// Dashboard
export const getDashboard = () => api.get('/dashboard');

// AI Insights
export const getInsights = () => api.get('/insights');
