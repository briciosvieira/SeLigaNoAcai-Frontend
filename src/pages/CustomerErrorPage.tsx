import { useNavigate, useRouteError } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export function CustomerErrorPage() {
  const navigate = useNavigate();
  const error = useRouteError() as { status?: number; statusText?: string } | null;
  const is404 = error?.status === 404;

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        background: 'var(--bg)',
        gap: 16,
        textAlign: 'center',
      }}
    >
      <AlertCircle size={56} color="rgba(168,85,247,0.7)" />
      <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>
        {is404 ? 'Página não encontrada' : 'Ops, algo deu errado'}
      </h1>
      <p style={{ color: 'var(--t2)', fontSize: '0.95rem', maxWidth: 320, margin: 0 }}>
        {is404
          ? 'Não encontramos essa página. Ela pode ter sido removida ou o link está incorreto.'
          : 'Ocorreu um erro inesperado. Tente novamente em instantes.'}
      </p>
      <button
        type="button"
        onClick={() => navigate('/')}
        style={{
          padding: '12px 28px',
          borderRadius: '14px',
          border: 'none',
          background: 'var(--purple)',
          color: '#fff',
          fontWeight: 800,
          fontSize: '0.95rem',
          cursor: 'pointer',
          marginTop: 8,
        }}
      >
        Voltar para o início
      </button>
    </div>
  );
}
