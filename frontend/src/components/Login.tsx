import { useState } from 'react';
import { ROLES } from '../constants/roles';

interface LoginProps {
  onSelect: (role: string) => void;
}

const ADMIN_PASSWORD = 'promath2025';

export function Login({ onSelect }: LoginProps) {
  const [step, setStep] = useState<'roles' | 'admin-auth'>('roles');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleRoleClick = (key: string) => {
    if (key === 'admin') {
      setStep('admin-auth');
      setPassword('');
      setError('');
    } else {
      onSelect(key);
    }
  };

  const handleAdminLogin = () => {
    if (password === ADMIN_PASSWORD) {
      onSelect('admin');
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  return (
    <div className="login-container">
      <div className="login-inner">
        <div className="login-badge">
          <div className="dot" />
          <span>PROMATH TECHNOLOGY · SALES CRM</span>
        </div>
        <h1 className="login-title">
          Promath<span style={{ color: 'var(--accent)' }}>.</span>
        </h1>

        {step === 'roles' && (
          <>
            <p className="login-sub">Select your role to continue</p>
            <div className="login-grid">
              {Object.entries(ROLES).map(([key, r]) => (
                <button key={key} className="role-card" onClick={() => handleRoleClick(key)}>
                  <div className="role-icon" style={{ background: r.bg }}>
                    {r.icon}
                  </div>
                  <div className="role-name">{r.label}</div>
                  <div className="role-desc">{r.desc}</div>
                  <div className="role-enter" style={{ color: r.color }}>
                    Enter <span>→</span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 'admin-auth' && (
          <div style={{ maxWidth: '360px', margin: '0 auto', width: '100%' }}>
            <p className="login-sub">Admin access requires a password</p>
            <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '11px', background: ROLES.admin.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                  {ROLES.admin.icon}
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)' }}>{ROLES.admin.label}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{ROLES.admin.desc}</div>
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label className="label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input className="input" type={showPw ? 'text' : 'password'} value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
                    placeholder="Enter admin password" autoFocus style={{ paddingRight: '44px' }} />
                  <button onClick={() => setShowPw(v => !v)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '16px', color: 'var(--muted)', padding: '0', lineHeight: 1 }}>
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
                {error && <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '5px' }}>⚠️ {error}</div>}
              </div>
              <button className="btn-primary" onClick={handleAdminLogin} style={{ width: '100%', justifyContent: 'center', padding: '12px' }} disabled={!password}>
                Sign In as Admin
              </button>
            </div>
            <button onClick={() => { setStep('roles'); setError(''); setPassword(''); }}
              style={{ marginTop: '16px', width: '100%', border: 'none', background: 'transparent', color: 'var(--muted)', cursor: 'pointer', fontSize: '13px', padding: '8px' }}>
              ← Back to role selection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
