import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import accountService from '../services/accountService';

export default function CreateAccount({ onSelectAccount }) {
  const [formData, setFormData] = useState({
    holderName: '',
    email: '',
    initialDeposit: '100.00',
    accountType: 'SAVINGS',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error on type
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const initialDep = parseFloat(formData.initialDeposit);
    if (isNaN(initialDep) || initialDep < 0) {
      setError('Initial deposit cannot be negative.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        initialDeposit: initialDep,
      };

      const account = await accountService.createAccount(payload);
      onSelectAccount(account);
      // Pass a flag to show the welcome banner on the dashboard
      navigate('/dashboard', { state: { showWelcome: true } });
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        if (errorData.errors) {
          // Validation field errors
          setFieldErrors(errorData.errors);
        } else if (errorData.message) {
          setError(errorData.message);
        } else {
          setError('Failed to create account.');
        }
      } else {
        setError('Failed to connect to the banking servers. Please verify backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="welcome-section animate-fade-in" style={{ minHeight: 'auto', padding: '20px 0' }}>
      <div className="glass-panel auth-card" style={{ maxWidth: '550px', textAlign: 'left' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontWeight: 700 }}>Open Account</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Open your instant Apex digital savings or current account. Start trading in minutes.
        </p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="holderName">Full Name</label>
            <input
              id="holderName"
              type="text"
              name="holderName"
              className="form-input"
              placeholder="e.g. John Doe"
              value={formData.holderName}
              onChange={handleChange}
              required
            />
            {fieldErrors.holderName && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>{fieldErrors.holderName}</span>}
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              className="form-input"
              placeholder="e.g. john.doe@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {fieldErrors.email && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>{fieldErrors.email}</span>}
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="initialDeposit">Initial Deposit ($)</label>
            <input
              id="initialDeposit"
              type="number"
              name="initialDeposit"
              step="0.01"
              min="0.00"
              className="form-input"
              placeholder="0.00"
              value={formData.initialDeposit}
              onChange={handleChange}
              required
            />
            {fieldErrors.initialDeposit && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>{fieldErrors.initialDeposit}</span>}
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="accountType">Account Type</label>
            <select
              id="accountType"
              name="accountType"
              className="form-select"
              value={formData.accountType}
              onChange={handleChange}
              required
            >
              <option value="SAVINGS">Savings Account</option>
              <option value="CURRENT">Current Account</option>
            </select>
            {fieldErrors.accountType && <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>{fieldErrors.accountType}</span>}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '2rem' }}>
            <Link to="/" className="btn btn-secondary" style={{ flex: 1 }}>
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner" style={{ width: '18px', height: '18px' }}></div>
                  Processing...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
