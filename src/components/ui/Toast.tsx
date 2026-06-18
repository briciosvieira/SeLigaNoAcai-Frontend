import { useEffect } from 'react';
import { useUiStore } from '@/store/ui.store';

const colorMap = {
  success: 'var(--vd-v)',
  error: '#e53e3e',
  warning: 'var(--am)',
  info: 'var(--roxo-v)',
};

export function Toast() {
  const { toast, hideToast } = useUiStore();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(hideToast, 3500);
    return () => clearTimeout(timer);
  }, [toast, hideToast]);

  if (!toast) return null;

  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        bottom: 'calc(var(--bnav) + 16px)',
        left: '50%',
        transform: 'translateX(-50%)',
        background: colorMap[toast.type],
        color: '#fff',
        padding: '10px 20px',
        borderRadius: 'var(--r-full)',
        fontSize: '0.875rem',
        fontWeight: 600,
        zIndex: 9999,
        maxWidth: '90vw',
        textAlign: 'center',
        boxShadow: 'var(--shadow-lg)',
        animation: 'fadeInUp 0.2s ease',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      <style>{`@keyframes fadeInUp { from { opacity:0; transform:translate(-50%,12px); } to { opacity:1; transform:translate(-50%,0); } }`}</style>
      {toast.message}
    </div>
  );
}
