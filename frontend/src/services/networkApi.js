import api from './api';

export const fetchNetworkCurrent = () => api.get('/network/current').then(r => r.data);
export const fetchNetworkHistory = (range = '1h') => api.get(`/network/history?range=${range}`).then(r => r.data);
export const fetchEpochInfo = () => api.get('/epoch/current').then(r => r.data);
