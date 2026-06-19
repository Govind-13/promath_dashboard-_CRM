interface StateProps {
  title: string;
  message?: string;
  icon?: string;
}

export function EmptyState({ title, message, icon = '○' }: StateProps) {
  return (
    <div className="empty-state">
      <div className="state-icon">{icon}</div>
      <div className="state-title">{title}</div>
      {message && <div className="state-message">{message}</div>}
    </div>
  );
}

export function LoadingState({ title = 'Loading...', message, icon = '◌' }: Partial<StateProps>) {
  return (
    <div className="loading-state">
      <div className="state-icon">{icon}</div>
      <div className="state-title">{title}</div>
      {message && <div className="state-message">{message}</div>}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', message, icon = '!' }: Partial<StateProps>) {
  return (
    <div className="error-state">
      <div className="state-icon">{icon}</div>
      <div className="state-title">{title}</div>
      {message && <div className="state-message">{message}</div>}
    </div>
  );
}
