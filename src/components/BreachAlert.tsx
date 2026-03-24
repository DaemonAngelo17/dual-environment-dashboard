import React from 'react';

interface BreachAlertProps {
  onReset: () => void;
}

export const BreachAlert: React.FC<BreachAlertProps> = ({ onReset }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(255, 0, 0, 0.2)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      animation: 'redFlash 1s infinite alternate'
    }}>
      <style>
        {`
          @keyframes redFlash {
            from { background-color: rgba(255, 0, 0, 0.1); }
            to { background-color: rgba(255, 0, 0, 0.4); }
          }
        `}
      </style>
      
      <div style={{
        background: '#111',
        border: '3px solid var(--neon-red)',
        padding: '50px 100px',
        boxShadow: '0 0 50px rgba(255,0,0,0.8)',
        textAlign: 'center',
        borderRadius: '10px'
      }}>
        <h1 style={{
          color: 'var(--neon-red)',
          fontFamily: 'var(--font-data)',
          fontSize: '4rem',
          margin: '0 0 20px 0',
          textShadow: '0 0 20px var(--neon-red)',
          animation: 'pulseText 0.5s infinite alternate'
        }}>
          CRITICAL BREACH
        </h1>
        <p style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '40px' }}>
          STRUCTURAL INTEGRITY COMPROMISED. ATMOSPHERIC BLEED IN PROGRESS.
        </p>
        <button 
          className="sci-btn" 
          onClick={onReset}
          style={{ width: '100%', fontSize: '1.5rem', borderColor: 'var(--neon-red)', color: 'var(--neon-red)' }}
        >
          RESET SIMULATION
        </button>
      </div>
    </div>
  );
};
