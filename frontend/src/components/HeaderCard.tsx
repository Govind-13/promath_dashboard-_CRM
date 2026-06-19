import type { ReactNode } from 'react';

interface HeaderCardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function HeaderCard({ title, subtitle, action, className = '' }: HeaderCardProps) {
  return (
    <header className={`header-card ${className}`.trim()}>
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}
