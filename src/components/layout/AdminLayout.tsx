import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  UserCog,
  Images,
  Package,
  Settings2,
  Store,
  MapPin,
  Tag,
  Gift,
  Megaphone,
  LogOut,
  ArrowLeft,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { Toast } from '@/components/ui/Toast';

export function AdminLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const user = useAuthStore((s) => s.user);

  const isAdmin = user?.role === 'ADMIN';
  const canManageProducts = isAdmin || user?.permissions?.includes('MANAGE_PRODUCTS');
  const canManageStore = isAdmin || user?.permissions?.includes('MANAGE_STORE');
  const canManageZones = isAdmin || user?.permissions?.includes('MANAGE_DELIVERY_ZONES');
  const canManagePayments = isAdmin || user?.permissions?.includes('MANAGE_PAYMENTS');

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} />, end: true },
    { to: '/admin/orders', label: 'Pedidos', icon: <ClipboardList size={18} /> },
    { to: '/admin/banners', label: 'Banners', icon: <Images size={18} /> },
    { to: '/admin/announcements', label: 'Informativos', icon: <Megaphone size={18} /> },
    ...(canManageProducts ? [
      { to: '/admin/products', label: 'Produtos', icon: <Package size={18} />, end: false },
      { to: '/admin/options', label: 'Adicionais', icon: <Settings2 size={18} />, end: false },
      { to: '/admin/promotions', label: 'Promoções', icon: <Tag size={18} />, end: false },
    ] : []),
    ...(canManageStore ? [{ to: '/admin/store', label: 'Loja', icon: <Store size={18} />, end: false }] : []),
    ...(canManageZones ? [{ to: '/admin/delivery-zones', label: 'Zonas de entrega', icon: <MapPin size={18} />, end: false }] : []),
    ...(canManageProducts ? [{ to: '/admin/loyalty', label: 'Fidelidade', icon: <Gift size={18} />, end: false }] : []),
    { to: '/admin/customers', label: 'Clientes', icon: <Users size={18} /> },
    ...(canManagePayments ? [{ to: '/admin/inter-webhook', label: 'PIX Inter', icon: <Zap size={18} />, end: false }] : []),
    ...(isAdmin ? [{ to: '/admin/users', label: 'Usuários', icon: <UserCog size={18} />, end: false }] : []),
  ];

  function handleLogout() {
    clearAuth();
    navigate('/login');
  }

  function closeSidebar() {
    setIsMobileSidebarOpen(false);
  }

  return (
    <div className="admin-layout">
      <aside className={['admin-sidebar', isMobileSidebarOpen ? 'is-open' : ''].filter(Boolean).join(' ')}>
        <div className="admin-sidebar-brand">
          Admin Panel
        </div>

        <nav className="admin-sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={closeSidebar}
              className={({ isActive }) =>
                ['admin-nav-link', isActive ? 'admin-nav-link--active' : ''].filter(Boolean).join(' ')
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button
            className="admin-sidebar-action admin-sidebar-action--back"
            onClick={() => { navigate('/'); closeSidebar(); }}
          >
            <ArrowLeft size={16} /> Voltar ao site
          </button>
          <button
            className="admin-sidebar-action admin-sidebar-action--logout"
            onClick={handleLogout}
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      </aside>

      {isMobileSidebarOpen && (
        <button
          type="button"
          className="admin-sidebar-overlay"
          onClick={closeSidebar}
          aria-label="Fechar menu"
        />
      )}

      <main className="admin-main">
        <header className="admin-mobile-header">
          <button
            type="button"
            className="admin-menu-button"
            onClick={() => setIsMobileSidebarOpen(true)}
            aria-label="Abrir menu"
          >
            ☰
          </button>
          <strong style={{ fontFamily: 'var(--font-brand)', color: 'var(--roxo-c)' }}>Admin</strong>
        </header>

        <div className="admin-page-content">
          <Outlet />
        </div>
      </main>

      <Toast />
      <style>{adminLayoutStyles}</style>
    </div>
  );
}

const adminLayoutStyles = `
  .admin-layout {
    min-height: 100dvh;
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr);
    background: var(--bg);
  }

  .admin-sidebar {
    background: var(--c1);
    border-right: 1px solid var(--c3);
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    position: sticky;
    top: 0;
    height: 100dvh;
    overflow-y: auto;
  }

  .admin-sidebar-brand {
    padding: 24px 20px 20px;
    font-family: var(--font-brand);
    font-size: 1.1rem;
    color: var(--roxo-c);
    flex-shrink: 0;
    border-bottom: 1px solid var(--c3);
    margin-bottom: 8px;
  }

  .admin-sidebar-nav {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .admin-nav-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 20px;
    color: var(--t2);
    background: transparent;
    border-left: 3px solid transparent;
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 600;
    transition: all var(--transition);
  }

  .admin-nav-link:hover {
    color: var(--txt);
    background: var(--c2);
  }

  .admin-nav-link--active {
    color: var(--roxo-c);
    background: var(--c2);
    border-left-color: var(--roxo-v);
  }

  .admin-sidebar-footer {
    border-top: 1px solid var(--c3);
    padding-top: 8px;
    flex-shrink: 0;
  }

  .admin-sidebar-action {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 600;
    width: 100%;
    text-align: left;
    transition: color 0.15s;
  }

  .admin-sidebar-action--back {
    color: var(--roxo-c);
  }

  .admin-sidebar-action--logout {
    color: var(--t2);
    font-weight: 400;
  }

  .admin-sidebar-action--logout:hover {
    color: #f87171;
  }

  .admin-main {
    min-width: 0;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
  }

  .admin-mobile-header {
    display: none;
  }

  .admin-sidebar-overlay {
    display: none;
  }

  .admin-page-content {
    flex: 1;
    padding: 24px;
  }

  /* ── Mobile ── */
  @media (max-width: 1023px) {
    .admin-layout {
      display: block;
    }

    .admin-sidebar {
      position: fixed;
      inset: 0 auto 0 0;
      z-index: 120;
      width: min(280px, 82vw);
      height: 100%;
      transform: translateX(-105%);
      transition: transform 0.22s ease;
      box-shadow: 24px 0 70px rgba(0, 0, 0, 0.45);
    }

    .admin-sidebar.is-open {
      transform: translateX(0);
    }

    .admin-sidebar-overlay {
      display: block;
      position: fixed;
      inset: 0;
      z-index: 110;
      border: 0;
      padding: 0;
      background: rgba(0, 0, 0, 0.58);
      cursor: pointer;
    }

    .admin-mobile-header {
      position: sticky;
      top: 0;
      z-index: 80;
      min-height: 56px;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 14px;
      background: rgba(16, 16, 18, 0.96);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(12px);
      flex-shrink: 0;
    }

    .admin-menu-button {
      width: 40px;
      height: 40px;
      border: 0;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
      font-size: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .admin-page-content {
      padding: 16px 14px 32px;
    }
  }
`;
