import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ activeAccount, onClearAccount }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onClearAccount();
    navigate('/');
  };

  return (
    <nav className="navbar glass-panel">
      <Link to={activeAccount ? "/dashboard" : "/"} className="brand">
        <div className="brand-icon">A</div>
        <span className="brand-text">Apex Trust</span>
      </Link>
      <div className="nav-links">
        {activeAccount ? (
          <>
            <Link to="/dashboard" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
              Dashboard
            </Link>
            <button onClick={handleLogout} className="btn btn-danger" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
              Exit Account
            </button>
          </>
        ) : (
          <Link to="/create-account" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
            Open Account
          </Link>
        )}
      </div>
    </nav>
  );
}
