import api from './api';

export const fetchTopValidators = (limit = 50) => 
  api.get(`/validators/top?limit=${limit}`).then(r => r.data);

export const fetchValidatorDetail = (votePubkey) => 
  api.get(`/validators/${votePubkey}`).then(r => r.data);
