import React, { useState } from 'react';

export default function AccountCard({ account }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(account.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format account number as XXXX XXXX XXXX
  const formatAccountNumber = (num) => {
    if (!num) return '';
    return num.replace(/(\d{4})/g, '$1 ').trim();
  };

  return (
    <div className="credit-card">
      <div className="card-top">
        <span className="card-bank">Apex Premium</span>
        <div className="card-chip"></div>
      </div>

      <div className="card-middle">
        <div className="card-number">
          <span>{formatAccountNumber(account.accountNumber)}</span>
          <button className="copy-btn" onClick={copyToClipboard} title="Copy Account Number">
            {copied ? (
              <span style={{ color: 'var(--color-success)' }}>Copied!</span>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="card-bottom">
        <div>
          <div className="card-holder-label">Account Holder</div>
          <div className="card-holder-name">{account.holderName}</div>
        </div>
        <div className="card-type-badge">
          {account.accountType}
        </div>
      </div>
    </div>
  );
}
