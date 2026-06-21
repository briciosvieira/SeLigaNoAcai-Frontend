import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { Toast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/auth.store';
import { useLoyaltyStore } from '@/store/loyalty.store';
import { getMyLoyaltyRequest } from '@/services/loyalty.service';

export function CustomerLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setLoyalty = useLoyaltyStore((s) => s.set);

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
