import { Home, Search, ClipboardList, ShoppingCart, Gift, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useCartStore } from '@/store/cart.store';

type NavItem = {
  to: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
  badge?: number;
};

export function BottomNav() {
  const itemCount = useCartStore((s) => s.items.reduce((acc, i) => acc + i.quantity, 0));

  const items: NavItem[] = [
    { to: '/', label: 'Início', icon: <Home size={22} />, end: true },
    { to: '/search', label: 'Buscar', icon: <Search size={22} /> },
    { to: '/orders', label: 'Pedidos', icon: <ClipboardList size={22} /> },
    { to: '/cart', label: 'Carrinho', icon: <ShoppingCart size={22} />, badge: itemCount },
    { to: '/loyalty', label: 'Fidelidade', icon: <Gift size={22} /> },
    { to: '/profile', label: 'Perfil', icon: <User size={22} /> },
  ];

  return (
    <>
      <nav className="bottom-nav" aria-label="Navegação principal">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `bottom-nav-item${isActive ? ' bottom-nav-item--active' : ''}`
            }
          >
            <span className="bottom-nav-icon">
              {item.icon}
              {item.badge != null && item.badge > 0 && (
                <span className="bottom-nav-badge">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </span>
            <span className="bottom-nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <style>{navStyles}</style>
    </>
  );
}

const navStyles = `
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: var(--bnav);
    background: var(--c1);
    border-top: 1px solid var(--c2);
    display: flex;
    align-items: stretch;
    z-index: 200;
  }

  .bottom-nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    color: var(--t2);
    text-decoration: none;
    font-size: 0.6rem;
    font-weight: 600;
    padding: 4px 0;
    transition: color 0.2s;
    -webkit-tap-highlight-color: transparent;
  }

  .bottom-nav-item--active { color: var(--roxo-c); }
  .bottom-nav-item:hover { color: var(--txt); }

  .bottom-nav-icon {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .bottom-nav-badge {
    position: absolute;
    top: -5px;
    right: -7px;
    background: var(--roxo-v);
    color: #fff;
    font-size: 0.5rem;
    font-weight: 700;
    border-radius: 50%;
    width: 14px;
    height: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .bottom-nav-label { line-height: 1; }

  /* Esconder bottom nav no desktop */
  @media (min-width: 1024px) {
    .bottom-nav { display: none; }
  }
`;
