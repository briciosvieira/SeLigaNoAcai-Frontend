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
  Menu,
  X,
  LogOut,
  ArrowLeft,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { Toast } from '@/components/ui/Toast';

export function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const user = useAuthStore((s) => s.user);

  const isAdmin = user?.role === 'ADMIN';
  const canManageProducts = isAdmin || user?.permissions?.includes('MANAGE_PRODUCTS');
  const canManageStore = isAdmin || user?.permissions?.includes('MANAGE_STORE');
  const canManageZones = isAdmin || user?.permissions?.includes('MANAGE_DELIVERY_ZONES');

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} />, end: true },
    { to: '/admin/orders', label: 'Pedidos', icon: <ClipboardList size={18} /> },
    { to: '/admin/banners', label: 'Banners', icon: <Images size={18} /> },
    ...(canManageProducts ? [
      { to: '/admin/products', label: 'Produtos', icon: <Package size={18} />, end: false },
      { to: '/admin/options', label: 'Adicionais', icon: <Settings2 size={18} />, end: false },
      { to: '/admin/promotions', label: 'Promoções', icon: <Tag size={18} />, end: false },
    ] : []),
    ...(canManageStore ? [{ to: '/admin/store', label: 'Loja', icon: <Store size={18} />, end: false }] : []),
    ...(canManageZones ? [{ to: '/admin/delivery-zones', label: 'Zonas de entrega', icon: <MapPin size={18} />, end: false }] : []),
    ...(canManageProducts ? [{ to: '/admin/loyalty', label: 'Fidelidade', icon: <Gift size={18} />, end: false }] : []),
    { to: '/admin/customers', label: 'Clientes', icon: <Users size={18} /> },
    ...(isAdmin ? [{ to: '/admin/users', label: 'Usuários', icon: <UserCog size={18} />, end: false }] : []),
  ];

  function handleLogout() {
    clearAuth();
    navigate('/login');
  }

  const sidebarStyle: React.CSSProperties = {
    width: 220,
    background: 'var(--c1)',
    borderRight: '1px solid var(--c3)',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 0',
    minHeight: '100dvh',
    flexShrink: 0,
  };

  const navLinkStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 20px',
    color: isActive ? 'var(--roxo-c)' : 'var(--t2)',
    background: isActive ? 'var(--c2)' : 'transparent',
    borderLeft: isActive ? '3px solid var(--roxo-v)' : '3px solid transparent',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: 600,
    transition: 'all var(--transition)',
  });

  return (
    <div style={{ display: 'flex', minHeight: '100dvh' }}>
      {/* Sidebar desktop */}
      <aside className="hide-sm" style={sidebarStyle}>
        <div style={{ padding: '0 20px 24px', fontFamily: 'var(--font-brand)', fontSize: '1.1rem', color: 'var(--roxo-c)' }}>
          Admin Panel
        </div>
        <nav style={{ flex: 1 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => navLinkStyle(isActive)}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ borderTop: '1px solid var(--c3)', paddingTop: 8 }}>
          <button
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', color: 'var(--roxo-c)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, width: '100%' }}
          >
            <ArrowLeft size={16} /> Voltar ao site
          </button>
          <button
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', color: 'var(--t2)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', width: '100%' }}
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300, background: 'var(--c1)', borderBottom: '1px solid var(--c3)', display: 'flex', alignItems: 'center', padding: '0 16px', height: 56 }} className="hide-lg">
        <button onClick={() => setMenuOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--txt)', cursor: 'pointer' }}>
          <Menu size={24} />
        </button>
        <span style={{ marginLeft: 12, fontFamily: 'var(--font-brand)', color: 'var(--roxo-c)' }}>Admin</span>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.7)' }} onClick={() => setMenuOpen(false)}>
          <div style={{ ...sidebarStyle, position: 'absolute', top: 0, left: 0 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px 24px', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-brand)', fontSize: '1.1rem', color: 'var(--roxo-c)' }}>Admin Panel</span>
              <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--t2)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <nav style={{ flex: 1 }}>
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMenuOpen(false)}
                  style={({ isActive }) => navLinkStyle(isActive)}
                >
                  {item.icon}{item.label}
                </NavLink>
              ))}
            </nav>
            <div style={{ borderTop: '1px solid var(--c3)', paddingTop: 8 }}>
              <button onClick={() => { navigate('/'); setMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', color: 'var(--roxo-c)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, width: '100%' }}>
                <ArrowLeft size={16} /> Voltar ao site
              </button>
              <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', color: 'var(--t2)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', width: '100%' }}>
                <LogOut size={16} /> Sair
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: 56, minWidth: 0 }} className="admin-content">
        <style>{`.hide-lg { display: flex; } @media (min-width: 1024px) { .hide-lg { display: none !important; } .admin-content { padding-top: 0 !important; } }`}</style>
        <main style={{ flex: 1, padding: '24px 16px', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>

      <Toast />
    </div>
  );
}
