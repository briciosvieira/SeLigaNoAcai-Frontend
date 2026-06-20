import { ShoppingBag, LogIn, User, LogOut, ChevronDown, ShieldCheck, MessageCircle } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { useLoyaltyStore } from '@/store/loyalty.store';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { buildWhatsAppUrl } from '@/utils/whatsapp';

export function Header() {
  const navigate = useNavigate();
  const itemCount = useCartStore((s) => s.items.reduce((acc, i) => acc + i.quantity, 0));
  const { isAuthenticated, user } = useAuthStore();
  const loyaltyEnabled = useLoyaltyStore((s) => s.isEnabled);
  const { logout } = useAuth();

  const desktopNavItems = [
    { to: '/', label: 'Início', end: true },
    { to: '/orders', label: 'Pedidos', end: false },
    ...(loyaltyEnabled === true ? [{ to: '/loyalty', label: 'Fidelidade', end: false }] : []),
  ];
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const store = useCurrentStore();
  const whatsappUrl = buildWhatsAppUrl(store?.whatsappNumber, 'Olá! Gostaria de mais informações.');

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="header-logo"
            aria-label="Ir para início"
          >
            Se Liga no Açaí
          </button>

          {/* Nav desktop (só aparece em desktop via CSS) */}
          <nav className="header-desktop-nav">
            {desktopNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `header-nav-link${isActive ? ' header-nav-link--active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Ações direita */}
          <div className="header-actions">
            {/* WhatsApp desktop — visível só no desktop */}
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="header-whatsapp-btn header-whatsapp-btn--desktop"
                aria-label="Falar no WhatsApp"
              >
                <MessageCircle size={15} />
                <span>WhatsApp</span>
              </a>
            )}

            {/* Auth desktop — dropdown com perfil + sair */}
            <div className="header-auth-desktop">
              {isAuthenticated ? (
                <div className="header-user-menu" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((v) => !v)}
                    className={`header-user-btn${dropdownOpen ? ' header-user-btn--open' : ''}`}
                    aria-haspopup="true"
                    aria-expanded={dropdownOpen}
                    aria-label="Menu do usuário"
                  >
                    <User size={15} />
                    <span>{user?.fullName?.split(' ')[0]}</span>
                    <ChevronDown size={12} className={`header-chevron${dropdownOpen ? ' header-chevron--up' : ''}`} />
                  </button>

                  {dropdownOpen && (
                    <div className="header-user-dropdown" role="menu">
                      <button
                        role="menuitem"
                        onClick={() => { navigate('/profile'); setDropdownOpen(false); }}
                        className="header-dropdown-item"
                      >
                        <User size={14} />
                        Meu perfil
                      </button>
                      {(user?.role === 'ADMIN' || user?.role === 'STAFF') && (
                        <>
                          <div className="header-dropdown-divider" />
                          <button
                            role="menuitem"
                            onClick={() => { navigate('/admin'); setDropdownOpen(false); }}
                            className="header-dropdown-item header-dropdown-item--admin"
                          >
                            <ShieldCheck size={14} />
                            Painel Admin
                          </button>
                        </>
                      )}
                      <div className="header-dropdown-divider" />
                      <button
                        role="menuitem"
                        onClick={() => { logout(); setDropdownOpen(false); }}
                        className="header-dropdown-item header-dropdown-item--danger"
                      >
                        <LogOut size={14} />
                        Sair
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="header-login-btn"
                >
                  <LogIn size={15} />
                  <span>Entrar</span>
                </button>
              )}
            </div>

            {/* WhatsApp mobile — visível só em mobile, quando número disponível */}
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="header-whatsapp-btn header-whatsapp-btn--mobile"
                aria-label="Falar no WhatsApp"
              >
                <MessageCircle size={20} />
              </a>
            )}

            {/* Logout mobile — visível só quando autenticado e sem WhatsApp, oculto no desktop */}
            {isAuthenticated && !whatsappUrl && (
              <button
                onClick={() => logout()}
                className="header-logout-mobile"
                aria-label="Sair da conta"
              >
                <LogOut size={20} />
              </button>
            )}

            {/* Carrinho */}
            <button
              onClick={() => navigate('/cart')}
              className="header-cart-btn"
              aria-label="Carrinho"
            >
              <ShoppingBag size={22} />
              {itemCount > 0 && (
                <span className="header-cart-badge">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <style>{headerStyles}</style>
    </>
  );
}

const headerStyles = `
  .site-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: var(--c1);
    border-bottom: 1px solid var(--c2);
  }

  .header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    height: 56px;
    padding: 0 16px;
    max-width: 480px;
    margin: 0 auto;
  }

  .header-logo {
    font-family: var(--font-brand);
    font-size: 1.15rem;
    color: var(--roxo-c);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    flex-shrink: 0;
    white-space: nowrap;
    max-width: calc(100vw - 130px);
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .header-desktop-nav { display: none; }
  .header-auth-desktop { display: none; }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    margin-left: auto;
  }

  /* WhatsApp button */
  .header-whatsapp-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    background: #25d366;
    color: #fff;
    font-size: 0.82rem;
    font-weight: 700;
    border-radius: var(--r-full);
    padding: 6px 10px;
    text-decoration: none;
    transition: background 0.15s;
    white-space: nowrap;
  }
  .header-whatsapp-btn:hover { background: #1ebe57; }

  /* Mobile: ícone apenas, sem label */
  .header-whatsapp-btn--mobile span { display: none; }
  /* Desktop variant hidden em mobile */
  .header-whatsapp-btn--desktop { display: none; }

  /* Logout mobile — visível só em mobile/tablet */
  .header-logout-mobile {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--t2);
    padding: 6px;
    border-radius: var(--r-sm);
    transition: color 0.2s;
  }
  .header-logout-mobile:hover { color: #ff5555; }

  .header-cart-btn {
    position: relative;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--txt);
    padding: 6px;
    display: flex;
  }

  .header-cart-badge {
    position: absolute;
    top: 0;
    right: 0;
    background: var(--roxo-v);
    color: #fff;
    font-size: 0.55rem;
    font-weight: 700;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Desktop user dropdown */
  .header-user-menu {
    position: relative;
  }

  .header-user-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--c2);
    border: 1px solid var(--c3);
    border-radius: var(--r-full);
    color: var(--txt);
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    padding: 5px 12px;
    transition: background 0.2s, border-color 0.2s;
  }
  .header-user-btn:hover,
  .header-user-btn--open { background: var(--c3); border-color: var(--roxo-v); }

  .header-chevron {
    transition: transform 0.2s;
    opacity: 0.6;
  }
  .header-chevron--up { transform: rotate(180deg); }

  .header-user-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    min-width: 168px;
    background: var(--c1);
    border: 1px solid var(--c3);
    border-radius: var(--r-md);
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    overflow: hidden;
    z-index: 200;
    animation: dropdownFadeIn 0.12s ease;
  }

  @keyframes dropdownFadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .header-dropdown-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 10px 14px;
    background: none;
    border: none;
    color: var(--txt);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    text-align: left;
    transition: background 0.15s;
  }
  .header-dropdown-item:hover { background: var(--c2); }
  .header-dropdown-item--admin { color: var(--roxo-c); }
  .header-dropdown-item--admin:hover { background: rgba(139,47,201,0.15); }

  .header-dropdown-item--danger { color: #ff6b6b; }
  .header-dropdown-item--danger:hover { background: rgba(255,80,80,0.1); }

  .header-dropdown-divider {
    height: 1px;
    background: var(--c2);
    margin: 2px 0;
  }

  .header-login-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--roxo-v);
    border: none;
    border-radius: var(--r-full);
    color: #fff;
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    padding: 6px 14px;
  }

  .header-nav-link {
    color: var(--t2);
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 600;
    padding: 4px 2px;
    border-bottom: 2px solid transparent;
    transition: color 0.2s, border-color 0.2s;
    white-space: nowrap;
  }
  .header-nav-link:hover { color: var(--txt); }
  .header-nav-link--active { color: var(--roxo-c); border-bottom-color: var(--roxo-c); }

  /* Tablet */
  @media (min-width: 768px) {
    .header-inner { max-width: 720px; }
  }

  /* Desktop */
  @media (min-width: 1024px) {
    .header-inner {
      max-width: 1180px;
      gap: 24px;
      height: 64px;
    }

    .header-logo { font-size: 1.4rem; }

    .header-desktop-nav {
      display: flex;
      align-items: center;
      gap: 24px;
      flex: 1;
    }

    .header-auth-desktop { display: flex; align-items: center; }

    /* No desktop, o logout já fica no dropdown — esconde o ícone mobile */
    .header-logout-mobile { display: none; }

    /* No desktop, mostra o botão desktop e esconde o mobile */
    .header-whatsapp-btn--desktop { display: flex; }
    .header-whatsapp-btn--mobile { display: none; }
  }
`;
