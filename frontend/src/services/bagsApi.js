import api from './api';

export const fetchBagsPools = async () => {
  const { data } = await api.get('/bags/pools');
  return data;
};

export const fetchBagsLaunches = async () => {
  const { data } = await api.get('/bags/launches');
  return data;
};

export const fetchTokenFees = async (tokenMint) => {
  const { data } = await api.get(`/bags/fees/${tokenMint}`);
  return data;
};
