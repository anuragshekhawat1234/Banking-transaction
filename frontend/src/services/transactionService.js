import api from './api';

const transactionService = {
  deposit: async (transactionData) => {
    const response = await api.post('/transactions/deposit', transactionData);
    return response.data;
  },

  withdraw: async (transactionData) => {
    const response = await api.post('/transactions/withdraw', transactionData);
    return response.data;
  },

  getTransactionHistory: async (accountNumber, page = 0, size = 10) => {
    const response = await api.get(`/transactions/${accountNumber}/history`, {
      params: { page, size },
    });
    return response.data;
  },
};

export default transactionService;
