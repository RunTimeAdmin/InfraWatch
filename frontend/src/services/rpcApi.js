import api from './api';

export const fetchRpcStatus = () => api.get('/rpc/status').then(r => r.data);

export const fetchRpcHistory = (provider, range = '1h') => 
  api.get(`/rpc/${encodeURIComponent(provider)}/history?range=${range}`).then(r => r.data);
