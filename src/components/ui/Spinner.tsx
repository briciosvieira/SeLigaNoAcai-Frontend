type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
};

const sizeMap = { sm: 20, md: 32, lg: 48 };

export function Spinner({ size = 'md', color = 'var(--roxo-v)' }: SpinnerProps) {
  const px = sizeMap[size];

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      style={{ animation: 'spin 0.8s linear infinite', display: 'block' }}
      aria-label="Carregando"
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

export function FullPageSpinner({ text }: { text?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 14,
      }}
    >
      <Spinner size="lg" />
      {text && (
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>{text}</p>
      )}
    </div>
  );
}
