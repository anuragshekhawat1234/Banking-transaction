import api from './api';

const accountService = {
  createAccount: async (accountData) => {
    const response = await api.post('/accounts', accountData);
    return response.data;
  },

  getAccount: async (accountNumber) => {
    const response = await api.get(`/accounts/${accountNumber}`);
    return response.data;
  },

  getBalance: async (accountNumber) => {
    const response = await api.get(`/accounts/${accountNumber}/balance`);
    return response.data;
  },
};

export default accountService;
