type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

type BadgeProps = {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  default: { background: 'var(--c3)', color: 'var(--txt)' },
  success: { background: 'var(--vd)', color: '#fff' },
  warning: { background: 'var(--am)', color: '#000' },
  danger: { background: '#e53e3e', color: '#fff' },
  info: { background: 'var(--roxo-v)', color: '#fff' },
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={className}
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 'var(--r-full)',
        fontSize: '0.75rem',
        fontWeight: 700,
        ...variantStyles[variant],
      }}
    >
      {children}
    </span>
  );
}
