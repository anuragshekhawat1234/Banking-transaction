import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import accountService from '../services/accountService';
import transactionService from '../services/transactionService';
import AccountCard from '../components/AccountCard';
import TransactionTable from '../components/TransactionTable';

export default function Dashboard({ activeAccount, onUpdateBalance }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to welcome/auth if no account is selected
  useEffect(() => {
    if (!activeAccount) {
      navigate('/');
    }
  }, [activeAccount, navigate]);

  // States
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loadingTx, setLoadingTx] = useState(false);
  
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  
  const [txAmount, setTxAmount] = useState('');
  const [txDesc, setTxDesc] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showWelcomeAlert, setShowWelcomeAlert] = useState(
    location.state?.showWelcome || false
  );

  const PAGE_SIZE = 5;

  // Load Transactions
  const loadTransactions = async (page = 0) => {
    if (!activeAccount) return;
    setLoadingTx(true);
    try {
      const data = await transactionService.getTransactionHistory(
        activeAccount.accountNumber,
        page,
        PAGE_SIZE
      );
      setTransactions(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setCurrentPage(data.number);
    } catch (err) {
      console.error('Failed to load transaction history', err);
    } finally {
      setLoadingTx(false);
    }
  };

  useEffect(() => {
    if (activeAccount) {
      loadTransactions(0);
    }
  }, [activeAccount]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      loadTransactions(newPage);
    }
  };

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    const amt = parseFloat(txAmount);
    if (isNaN(amt) || amt <= 0) {
      setModalError('Please enter a valid amount greater than zero.');
      return;
    }

    setModalLoading(true);
    try {
      const response = await transactionService.deposit({
        accountNumber: activeAccount.accountNumber,
        amount: amt,
        description: txDesc,
      });

      // Fetch updated balance
      const balanceData = await accountService.getBalance(activeAccount.accountNumber);
      onUpdateBalance(balanceData.balance);

      setSuccessMessage(`Successfully deposited $${amt.toFixed(2)}.`);
      setTimeout(() => setSuccessMessage(''), 4000);
      
      // Reset & Close
      setTxAmount('');
      setTxDesc('');
      setShowDepositModal(false);
      
      // Reload page 0
      loadTransactions(0);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setModalError(err.response.data.message);
      } else {
        setModalError('Deposit transaction failed.');
      }
    } finally {
      setModalLoading(false);
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    const amt = parseFloat(txAmount);
    if (isNaN(amt) || amt <= 0) {
      setModalError('Please enter a valid amount greater than zero.');
      return;
    }

    setModalLoading(true);
    try {
      const response = await transactionService.withdraw({
        accountNumber: activeAccount.accountNumber,
        amount: amt,
        description: txDesc,
      });

      // Fetch updated balance
      const balanceData = await accountService.getBalance(activeAccount.accountNumber);
      onUpdateBalance(balanceData.balance);

      setSuccessMessage(`Successfully withdrew $${amt.toFixed(2)}.`);
      setTimeout(() => setSuccessMessage(''), 4000);
      
      // Reset & Close
      setTxAmount('');
      setTxDesc('');
      setShowWithdrawModal(false);

      // Reload page 0
      loadTransactions(0);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setModalError(err.response.data.message);
      } else {
        setModalError('Withdrawal transaction failed.');
      }
    } finally {
      setModalLoading(false);
    }
  };

  const openDeposit = () => {
    setTxAmount('');
    setTxDesc('');
    setModalError('');
    setShowDepositModal(true);
  };

  const openWithdraw = () => {
    setTxAmount('');
    setTxDesc('');
    setModalError('');
    setShowWithdrawModal(true);
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (!activeAccount) return null;

  return (
    <div className="animate-fade-in">
      {showWelcomeAlert && (
        <div className="alert alert-success" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <strong style={{ fontSize: '1.05rem' }}>Welcome to Apex Trust!</strong>
            <button 
              onClick={() => setShowWelcomeAlert(false)} 
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: 'auto', fontWeight: 'bold' }}
            >
              ✕
            </button>
          </div>
          <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>
            Your account has been generated successfully. Please make sure to save your Account Number: 
            <strong style={{ fontSize: '1rem', marginLeft: '6px', color: '#fff', background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '4px' }}>
              {activeAccount.accountNumber}
            </strong>
          </p>
        </div>
      )}

      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      <div className="dashboard-grid">
        {/* Left Column: Account Summary & Actions */}
        <div>
          <AccountCard account={activeAccount} />

          <div className="glass-panel details-panel" style={{ marginBottom: '1.5rem' }}>
            <span className="balance-title">Available Balance</span>
            <div className="balance-amount">
              {formatCurrency(activeAccount.balance)}
            </div>
            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Account Holder:</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{activeAccount.holderName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Email Registered:</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{activeAccount.email}</span>
              </div>
            </div>
          </div>

          <div className="glass-panel actions-card">
            <h3 className="actions-title">Account Services</h3>
            <div className="action-buttons">
              <button onClick={openDeposit} className="btn btn-success">
                Deposit
              </button>
              <button onClick={openWithdraw} className="btn btn-secondary">
                Withdraw
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Paginated Transaction History */}
        <div className="glass-panel transactions-panel">
          <div className="panel-header">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Transaction Statement</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Total: {totalElements} record(s)
            </span>
          </div>

          <TransactionTable transactions={transactions} loading={loadingTx} />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination">
              <span className="pagination-info">
                Page {currentPage + 1} of {totalPages}
              </span>
              <div className="pagination-controls">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0 || loadingTx}
                  className="pagination-btn"
                >
                  ◀ Prev
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1 || loadingTx}
                  className="pagination-btn"
                >
                  Next ▶
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <button className="modal-close" onClick={() => setShowDepositModal(false)}>✕</button>
            <div className="modal-header">
              <h3 className="modal-title">Deposit Funds</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Add funds securely to your account.
              </p>
            </div>

            {modalError && <div className="alert alert-danger" style={{ padding: '8px 12px', fontSize: '0.85rem' }}>{modalError}</div>}

            <form onSubmit={handleDepositSubmit}>
              <div className="input-group">
                <label className="input-label">Deposit Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-input"
                  placeholder="0.00"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Description (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Freelance project payment"
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDepositModal(false)} disabled={modalLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success" disabled={modalLoading}>
                  {modalLoading ? <div className="spinner" style={{ width: '18px', height: '18px' }}></div> : 'Complete Deposit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <button className="modal-close" onClick={() => setShowWithdrawModal(false)}>✕</button>
            <div className="modal-header">
              <h3 className="modal-title">Withdraw Funds</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Instant debit from your account balance.
              </p>
            </div>

            {modalError && <div className="alert alert-danger" style={{ padding: '8px 12px', fontSize: '0.85rem' }}>{modalError}</div>}

            <form onSubmit={handleWithdrawSubmit}>
              <div className="input-group">
                <label className="input-label">Withdrawal Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-input"
                  placeholder="0.00"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Description (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. ATM withdrawal"
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowWithdrawModal(false)} disabled={modalLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger" disabled={modalLoading}>
                  {modalLoading ? <div className="spinner" style={{ width: '18px', height: '18px' }}></div> : 'Complete Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
