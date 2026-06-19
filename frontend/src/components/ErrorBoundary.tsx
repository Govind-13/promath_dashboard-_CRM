import React from 'react';

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Promath CRM render error', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="login-container">
          <div className="login-card" style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: 24, marginBottom: 12 }}>Unable to display the dashboard</h1>
            <p style={{ color: 'var(--ink-light)', marginBottom: 20 }}>
              Refresh the page. If the issue continues, contact the administrator.
            </p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
