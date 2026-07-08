import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreateAccount from './pages/CreateAccount';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  const [activeAccount, setActiveAccount] = useState(() => {
    const saved = localStorage.getItem('apex_active_account');
    return saved ? JSON.parse(saved) : null;
  });

  const handleSelectAccount = (account) => {
    setActiveAccount(account);
    localStorage.setItem('apex_active_account', JSON.stringify(account));
  };

  const handleUpdateBalance = (newBalance) => {
    if (activeAccount) {
      const updated = { ...activeAccount, balance: newBalance };
      setActiveAccount(updated);
      localStorage.setItem('apex_active_account', JSON.stringify(updated));
    }
  };

  const handleClearAccount = () => {
    setActiveAccount(null);
    localStorage.removeItem('apex_active_account');
  };

  return (
    <Router>
      <div className="app-container">
        <Navbar activeAccount={activeAccount} onClearAccount={handleClearAccount} />
        
        <main className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={
                activeAccount ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Home onSelectAccount={handleSelectAccount} />
                )
              } 
            />
            <Route 
              path="/create-account" 
              element={
                activeAccount ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <CreateAccount onSelectAccount={handleSelectAccount} />
                )
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <Dashboard 
                  activeAccount={activeAccount} 
                  onUpdateBalance={handleUpdateBalance} 
                />
              } 
            />
            {/* Fallback redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
