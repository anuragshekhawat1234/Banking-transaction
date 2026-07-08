import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import accountService from '../services/accountService';

export default function Home({ onSelectAccount }) {
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAccess = async (e) => {
    e.preventDefault();
    if (!accountNumber.trim()) {
      setError('Please enter your 10-digit account number.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const account = await accountService.getAccount(accountNumber.trim());
      onSelectAccount(account);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to connect to the banking servers. Please verify backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="welcome-section animate-fade-in">
      <h1 className="welcome-title">
        Future of <span className="gradient-text">Secure Banking</span> is Here
      </h1>
      <p className="welcome-subtitle">
        Welcome to Apex Trust. Execute, monitor, and manage your account balances and transaction histories through our premium banking interface.
      </p>

      <div className="welcome-actions">
        <div className="glass-panel auth-card">
          <h2 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>Access Dashboard</h2>
          
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleAccess}>
            <div className="input-group">
              <label className="input-label" htmlFor="accountNum">Account Number</label>
              <input
                id="accountNum"
                type="text"
                className="form-input"
                placeholder="Enter 10-digit account number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                maxLength={20}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner" style={{ width: '18px', height: '18px' }}></div>
                  Loading Account...
                </>
              ) : (
                'Access Dashboard'
              )}
            </button>
          </form>

          <div className="divider">Or</div>

          <Link to="/create-account" className="btn btn-secondary" style={{ width: '100%' }}>
            Open a New Account
          </Link>
        </div>
      </div>
    </div>
  );
}
