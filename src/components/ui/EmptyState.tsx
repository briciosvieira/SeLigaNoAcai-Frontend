type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        gap: 12,
      }}
    >
      {icon && <div style={{ opacity: 0.4, marginBottom: 4 }}>{icon}</div>}
      <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--txt)' }}>{title}</p>
      {description && (
        <p style={{ fontSize: '0.875rem', color: 'var(--t2)', maxWidth: 280 }}>{description}</p>
      )}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}
