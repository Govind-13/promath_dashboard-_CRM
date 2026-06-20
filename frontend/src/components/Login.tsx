import { useState } from 'react';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onForgotPassword: (email: string) => Promise<{ message: string }>;
  onResetPassword: (token: string, password: string) => Promise<{ message: string }>;
}

type Mode = 'login' | 'forgot' | 'reset';

export function Login({ onLogin, onForgotPassword, onResetPassword }: LoginProps) {
  const resetToken = new URLSearchParams(window.location.search).get('resetToken') || '';
  const [mode, setMode] = useState<Mode>(resetToken ? 'reset' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const clearFeedback = () => { setError(''); setMessage(''); };

  const submitLogin = async () => {
    setBusy(true);
    clearFeedback();
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  const submitForgot = async () => {
    setBusy(true);
    clearFeedback();
    try {
      const response = await onForgotPassword(email);
      setMessage(response.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send reset email');
    } finally {
      setBusy(false);
    }
  };

  const submitReset = async () => {
    clearFeedback();
    if (password !== confirmPassword) return setError('Passwords do not match');
    setBusy(true);
    try {
      const response = await onResetPassword(resetToken, password);
      window.history.replaceState({}, document.title, window.location.pathname);
      setPassword('');
      setConfirmPassword('');
      setMode('login');
      setMessage(response.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reset password');
    } finally {
      setBusy(false);
    }
  };

  const heading = mode === 'forgot' ? 'Forgot password?' : mode === 'reset' ? 'Choose new password' : 'Welcome back';
  const subtitle = mode === 'forgot'
    ? 'Enter your account email and we will send a reset link.'
    : mode === 'reset'
      ? 'Create a strong password with at least 10 characters.'
      : 'Sign in to continue to your CRM workspace.';

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo">Promath<span>.</span></div>
          <h1>{heading}</h1>
          <p>{subtitle}</p>
        </div>
        <div className="login-form">
          {mode !== 'reset' && (
            <div className="field">
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={event => { setEmail(event.target.value); clearFeedback(); }}
                onKeyDown={event => event.key === 'Enter' && (mode === 'login' ? submitLogin() : submitForgot())}
                placeholder="admin@example.com"
                autoFocus
              />
            </div>
          )}

          {mode !== 'forgot' && (
            <div className="field">
              <label className="label">{mode === 'reset' ? 'New Password' : 'Password'}</label>
              <div className="password-input">
                <input
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  minLength={mode === 'reset' ? 10 : undefined}
                  onChange={event => { setPassword(event.target.value); clearFeedback(); }}
                  onKeyDown={event => event.key === 'Enter' && mode === 'login' && submitLogin()}
                  placeholder={mode === 'reset' ? 'At least 10 characters' : 'Password'}
                  autoFocus={mode === 'reset'}
                />
                <button type="button" onClick={() => setShowPassword(value => !value)}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          )}

          {mode === 'reset' && (
            <div className="field">
              <label className="label">Confirm Password</label>
              <input
                className="input"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={event => { setConfirmPassword(event.target.value); clearFeedback(); }}
                onKeyDown={event => event.key === 'Enter' && submitReset()}
                placeholder="Enter password again"
              />
            </div>
          )}

          {mode === 'login' && (
            <button className="forgot-password-link" type="button" onClick={() => { clearFeedback(); setMode('forgot'); }}>
              Forgot password?
            </button>
          )}
          {error && <div className="inline-alert error">{error}</div>}
          {message && <div className="inline-alert success">{message}</div>}

          <button
            className="btn btn-primary login-submit"
            onClick={mode === 'login' ? submitLogin : mode === 'forgot' ? submitForgot : submitReset}
            disabled={
              busy ||
              (mode === 'login' && (!email || !password)) ||
              (mode === 'forgot' && !email) ||
              (mode === 'reset' && (!password || !confirmPassword || password.length < 10))
            }
          >
            {busy ? 'Please wait...' : mode === 'login' ? 'Sign In' : mode === 'forgot' ? 'Send Reset Link' : 'Reset Password'}
          </button>

          {mode !== 'login' && (
            <button className="back-to-login" type="button" onClick={() => { clearFeedback(); setMode('login'); }}>
              ← Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
