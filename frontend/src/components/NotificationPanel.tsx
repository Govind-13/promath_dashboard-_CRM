import type { Notification } from '../types/college.types';
import { formatDate } from '../utils/college';

interface NotificationPanelProps {
  notifications: Notification[];
  onRead?: (id: string) => void;
  title?: string;
}

export function NotificationPanel({ notifications, onRead, title = 'Updates' }: NotificationPanelProps) {
  return (
    <section className="notification-panel">
      <div className="notification-panel-header">
        <div>
          <h2>{title}</h2>
          <p>{notifications.filter(item => !item.read).length} unread</p>
        </div>
        <span aria-hidden="true">🔔</span>
      </div>
      <div className="notification-list">
        {notifications.map(notification => (
          <button
            key={notification.id}
            className={`notification-item ${notification.read ? '' : 'unread'}`.trim()}
            onClick={() => onRead?.(notification.id)}
          >
            {!notification.read && <span className="notification-dot" />}
            <span>
              <strong>{notification.message}</strong>
              <small>{formatDate(notification.timestamp)}</small>
            </span>
          </button>
        ))}
        {notifications.length === 0 && (
          <div className="empty-state">
            <div className="state-icon">✓</div>
            <div className="state-title">You're all caught up</div>
          </div>
        )}
      </div>
    </section>
  );
}
