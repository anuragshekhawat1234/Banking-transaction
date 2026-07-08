import React from 'react';

export default function TransactionTable({ transactions, loading }) {
  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="empty-state">
        <div className="spinner"></div>
        <p style={{ marginTop: '10px' }}>Loading transaction records...</p>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="empty-state">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, marginBottom: '10px' }}>
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <p>No transactions found for this account.</p>
      </div>
    );
  }

  return (
    <div className="transactions-table-container">
      <table className="transactions-table">
        <thead>
          <tr>
            <th>Date & Time</th>
            <th>Type</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Balance After</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => {
            const isDeposit = tx.type === 'DEPOSIT';
            return (
              <tr key={tx.id}>
                <td>{formatDateTime(tx.timestamp)}</td>
                <td>
                  <span className={`badge ${isDeposit ? 'badge-deposit' : 'badge-withdrawal'}`}>
                    {isDeposit ? '↑ Deposit' : '↓ Withdrawal'}
                  </span>
                </td>
                <td>{tx.description || (isDeposit ? 'Deposit' : 'Withdrawal')}</td>
                <td className={isDeposit ? 'amount-positive' : 'amount-negative'}>
                  {isDeposit ? '+' : '-'}{formatCurrency(tx.amount)}
                </td>
                <td style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-heading)' }}>
                  {formatCurrency(tx.balanceAfter)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
