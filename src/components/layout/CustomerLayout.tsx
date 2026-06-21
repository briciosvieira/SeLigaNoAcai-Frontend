import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { Toast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/auth.store';
import { useLoyaltyStore } from '@/store/loyalty.store';
import { getMyLoyaltyRequest } from '@/services/loyalty.service';
import { acceptLegalTermsRequest } from '@/services/auth.service';

export function CustomerLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isGuest = useAuthStore((s) => s.isGuest);
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const setLoyalty = useLoyaltyStore((s) => s.set);
  const [acceptingTerms, setAcceptingTerms] = useState(false);

  const needsTermsAcceptance =
    isAuthenticated && !isGuest && user?.termsAcceptedAt == null;

  async function handleAcceptTerms() {
    setAcceptingTerms(true);
    try {
      const updated = await acceptLegalTermsRequest();
      updateUser(updated);
    } finally {
      setAcceptingTerms(false);
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      setLoyalty({ isEnabled: false, availableRewards: 0 });
      return;
    }
    getMyLoyaltyRequest()
      .then((res) => {
        setLoyalty({
          isEnabled: res.settings.isEnabled,
          availableRewards: res.availableRewards ?? 0,
        });
      })
      .catch(() => {
        setLoyalty({ isEnabled: false });
      });
  }, [isAuthenticated, setLoyalty]);

  return (
    <>
      <div className="customer-layout">
        <Header />

        <main className="customer-content">
          <Outlet />
        </main>

        <BottomNav />
      </div>

      <Toast />

      {needsTermsAcceptance && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
          background: 'rgba(0,0,0,0.88)',
          backdropFilter: 'blur(6px)',
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #1e0a30, #12051a)',
            borderRadius: 20, padding: '32px 28px',
            width: '100%', maxWidth: 420,
            border: '1px solid rgba(255,255,255,0.12)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 10, color: '#fff' }}>
              Termos de Uso e Privacidade
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, marginBottom: 24 }}>
              Para continuar usando o Se Liga no Açaí, você precisa aceitar nossos termos.
              Leia os documentos antes de confirmar:
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
              <a href="/termos-de-uso" target="_blank" rel="noopener noreferrer"
                style={{ color: '#d8b4fe', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}>
                Termos de Uso ↗
              </a>
              <a href="/politica-de-privacidade" target="_blank" rel="noopener noreferrer"
                style={{ color: '#d8b4fe', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}>
                Política de Privacidade ↗
              </a>
            </div>
            <button
              type="button"
              onClick={handleAcceptTerms}
              disabled={acceptingTerms}
              style={{
                width: '100%', padding: '13px',
                background: acceptingTerms ? 'rgba(91,26,138,0.5)' : 'var(--roxo-v, #7c3aed)',
                border: 'none', borderRadius: 10,
                color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                cursor: acceptingTerms ? 'not-allowed' : 'pointer',
              }}
            >
              {acceptingTerms ? 'Registrando...' : 'Li e aceito os termos'}
            </button>
          </div>
        </div>
      )}

      <style>{layoutStyles}</style>
    </>
  );
}

const layoutStyles = `
  .customer-layout {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    color: #ffffff;
    background:
      radial-gradient(circle at 10% 0%, rgba(178, 70, 255, 0.34), transparent 34%),
      radial-gradient(circle at 88% 8%, rgba(236, 72, 153, 0.20), transparent 32%),
      radial-gradient(circle at 50% 38%, rgba(91, 33, 182, 0.24), transparent 42%),
      linear-gradient(180deg, #310840 0%, #1b0628 38%, #100515 68%, #09070d 100%);
    background-attachment: fixed;

    /* Escopo do tema cliente para as superfícies (Cards, Modais, etc) */
    --surface: rgba(255, 255, 255, 0.065);
    --surface-strong: rgba(255, 255, 255, 0.095);
    --border: rgba(255, 255, 255, 0.12);
    --card: linear-gradient(145deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.045)), rgba(49, 8, 64, 0.28);
  }

  .customer-layout header {
    background: linear-gradient(90deg, rgba(49, 8, 64, 0.90), rgba(23, 6, 32, 0.82)) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.10) !important;
    backdrop-filter: blur(14px) !important;
  }

  /* Mobile: coluna única, bottom nav, max 480px centralizado */
  .customer-content {
    flex: 1;
    width: 100%;
    max-width: 480px;
    margin: 0 auto;
    padding-bottom: calc(var(--bnav) + 8px);
    overflow-x: hidden;
  }

  /* Tablet: um pouco mais largo */
  @media (min-width: 768px) {
    .customer-content {
      max-width: 720px;
    }
  }

  /* Desktop: largura total, sem bottom nav, layout em grid */
  @media (min-width: 1024px) {
    .customer-layout {
      max-width: 100%;
    }

    .customer-content {
      max-width: 1180px;
      padding-bottom: 32px;
      padding-top: 8px;
    }
  }
`;
