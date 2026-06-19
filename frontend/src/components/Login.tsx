import { useState } from 'react';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo">Promath<span>.</span></div>
          <h1>Welcome back</h1>
          <p>Sign in to continue to your CRM workspace.</p>
        </div>
        <div className="login-form">
          <div className="field">
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={event => { setEmail(event.target.value); setError(''); }}
              onKeyDown={event => event.key === 'Enter' && submit()}
              placeholder="admin@example.com"
              autoFocus
            />
          </div>
          <div className="field">
            <label className="label">Password</label>
            <div className="password-input">
              <input
                className="input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={event => { setPassword(event.target.value); setError(''); }}
                onKeyDown={event => event.key === 'Enter' && submit()}
                placeholder="Password"
              />
              <button type="button" onClick={() => setShowPassword(value => !value)}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          {error && <div className="inline-alert error">{error}</div>}
          <button className="btn btn-primary login-submit" onClick={submit} disabled={!email || !password || busy}>
            {busy ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}
