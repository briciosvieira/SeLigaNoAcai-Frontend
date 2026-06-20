import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCatalog } from '@/hooks/useCatalog';
import { useBanners } from '@/hooks/useBanners';
import { useLocationStore } from '@/store/location.store';
import { useCartStore } from '@/store/cart.store';
import { useProductBuilder } from '@/hooks/useProductBuilder';
import { useStoreAvailabilityCountdown } from '@/hooks/useStoreAvailabilityCountdown';
import { StoreAvailabilityBadge } from '@/components/store/StoreAvailabilityBadge';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { BannerCarousel } from '@/components/banner/BannerCarousel';
import { ProductBuilderModal } from '../components/ProductBuilderModal';
import { formatCurrency } from '@/utils/currency.util';
import { getImageUrl } from '@/utils/image-url.util';
import { MapPin, Search, Package, ChevronRight } from 'lucide-react';
import { useLoyaltyStore } from '@/store/loyalty.store';
import type { Product } from '@/types/product.types';

export function isComboProduct(product: Product): boolean {
  const categoryName = product.category?.name ?? '';
  const categorySlug = product.category?.slug ?? '';
  const productName = product.name ?? '';

  const value = `${categoryName} ${categorySlug} ${productName}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  return value.includes('combo');
}

export function HomePage() {
  const navigate = useNavigate();
  const loyaltyRewards = useLoyaltyStore((s) => s.availableRewards);
  const loyaltyEnabled = useLoyaltyStore((s) => s.isEnabled);
  const { store, categories, products, isLoading, error, loadAll, loadStore, getProductsByCategory } = useCatalog();
  const remainingSeconds = useStoreAvailabilityCountdown(
    store?.availability?.remainingSeconds ?? 0,
    () => void loadStore(),
  );
  const { banners, loadActiveBanners } = useBanners();
  const selectedZone = useLocationStore((s) => s.selectedDeliveryZone);
  const addItem = useCartStore((s) => s.addItem);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const builder = useProductBuilder();

  useEffect(() => {
    loadAll();
    loadActiveBanners();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchCategory = !activeCategory || p.categoryId === activeCategory;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch && p.isActive;
  });

  if (isLoading) return <FullPageSpinner />;

  function handleAddToCart() {
    const item = builder.buildCartItem();
    if (!item) return;
    addItem(item);
    builder.closeProduct();
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 64 }}>
      {/* Carrossel de banners */}
      <BannerCarousel banners={banners} />

      {/* Banner de brinde fidelidade */}
      {loyaltyEnabled === true && loyaltyRewards > 0 && (
        <button
          onClick={() => navigate('/loyalty')}
          style={{
            width: '100%',
            padding: '11px 16px',
            background: 'linear-gradient(90deg, rgba(255,193,7,0.18), rgba(255,160,0,0.10))',
            border: 'none',
            borderBottom: '1px solid rgba(255,193,7,0.28)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: '#ffe100',
            fontSize: '0.875rem',
            fontWeight: 700,
            justifyContent: 'space-between',
            textAlign: 'left',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            🎁
            <span>
              Você tem {loyaltyRewards} {loyaltyRewards === 1 ? 'brinde de fidelidade disponível' : 'brindes de fidelidade disponíveis'}!
            </span>
          </span>
          <ChevronRight size={15} style={{ flexShrink: 0 }} />
        </button>
      )}

      {/* Alerta de bairro */}
      {!selectedZone && (
        <div style={{ borderBottom: '1px solid rgba(139,47,201,0.3)' }}>
          <button
            onClick={() => navigate('/location')}
            style={{
              width: '100%', padding: '11px 16px',
              background: 'rgba(91,26,138,0.35)', border: 'none',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              color: 'var(--roxo-c)', fontSize: '0.85rem', fontWeight: 600,
              justifyContent: 'space-between',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={15} />
              Selecione seu bairro para ver taxa de entrega
            </span>
            <ChevronRight size={15} />
          </button>

          {store?.availability && (
            <div
              style={{
                display: 'flex', justifyContent: 'flex-end',
                padding: '6px 16px 8px',
              }}
            >
              <StoreAvailabilityBadge
                availability={store.availability}
                remainingSeconds={remainingSeconds}
                compact
              />
            </div>
          )}
        </div>
      )}

      {selectedZone && (
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 12, padding: '9px 16px',
            borderBottom: '1px solid var(--c2)',
          }}
        >
          <button
            onClick={() => navigate('/location')}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              color: 'var(--am)', fontSize: '0.78rem', fontWeight: 600,
              padding: 0,
            }}
          >
            <MapPin size={13} />
            {selectedZone.neighborhood}
            <span style={{ color: 'var(--t3)', marginLeft: 4 }}>· alterar</span>
          </button>

          {store?.availability && (
            <StoreAvailabilityBadge
              availability={store.availability}
              remainingSeconds={remainingSeconds}
              compact
            />
          )}
        </div>
      )}

      {/* Busca */}
      <div style={{ padding: '12px 16px 8px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--t2)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px 10px 36px',
              background: 'rgba(34,34,34,0.8)', border: '1px solid var(--c3)',
              borderRadius: 'var(--r-full)', color: 'var(--txt)', fontSize: '0.875rem',
              outline: 'none', backdropFilter: 'blur(4px)',
            }}
          />
        </div>
      </div>

      {/* Categorias */}
      {categories.length > 0 && (
        <div style={{ padding: '4px 16px 12px', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
          <CategoryChip label="Todos" active={!activeCategory} onClick={() => setActiveCategory(null)} />
          {categories.map((cat) => (
            <CategoryChip
              key={cat.id}
              label={cat.name}
              active={activeCategory === cat.id}
              onClick={() => setActiveCategory(cat.id)}
            />
          ))}
        </div>
      )}

      {/* Produtos */}
      {error && (
        <EmptyState
          icon={<Package size={48} />}
          title="Não foi possível carregar o cardápio"
          description={error}
          action={
            <button onClick={loadAll} style={{ color: 'var(--roxo-c)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              Tentar novamente
            </button>
          }
        />
      )}

      {!error && filteredProducts.length === 0 && !isLoading && (
        <EmptyState
          icon={<Package size={48} />}
          title="Nenhum produto encontrado"
          description={search ? `Sem resultados para "${search}"` : 'Cardápio vazio no momento'}
        />
      )}

      {!error && filteredProducts.length > 0 && (
        <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {activeCategory ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} onOpen={builder.openProduct} />
              ))}
            </div>
          ) : (
            categories.map((cat) => {
              const catProducts = getProductsByCategory(cat.id).filter(
                (p) => !search || p.name.toLowerCase().includes(search.toLowerCase()),
              );
              if (catProducts.length === 0) return null;
              return (
                <div key={cat.id} style={{ marginBottom: 12 }}>
                  <h2 style={{
                    fontSize: '0.85rem', fontWeight: 800, color: 'var(--purple-soft)',
                    marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1.2, paddingLeft: 2,
                  }}>
                    {cat.name}
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                    {catProducts.map((p) => (
                      <ProductCard key={p.id} product={p} onOpen={builder.openProduct} />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modal de montagem */}
      <ProductBuilderModal builder={builder} onAddToCart={handleAddToCart} />
    </div>
  );
}

function CategoryChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0, padding: '6px 16px', borderRadius: 'var(--r-full)',
        border: `1px solid ${active ? 'var(--roxo-v)' : 'rgba(255,255,255,0.1)'}`,
        background: active ? 'var(--roxo-v)' : 'rgba(255,255,255,0.05)',
        color: active ? '#fff' : 'var(--t2)', fontWeight: 600, fontSize: '0.8rem',
        cursor: 'pointer', whiteSpace: 'nowrap', backdropFilter: 'blur(4px)',
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      {label}
    </button>
  );
}

function ProductCard({ product, onOpen }: { product: Product; onOpen: (id: string) => void }) {
  const imgSrc = getImageUrl(product.imageUrl);
  const isCombo = isComboProduct(product);
  const basePrice = Number(product.basePrice ?? 0);

  return (
    <div
      onClick={() => onOpen(product.id)}
      style={{
        display: 'flex', gap: 16, background: 'var(--surface)',
        borderRadius: 'var(--r-xl)', padding: 16, cursor: 'pointer',
        border: '1px solid var(--border)', backdropFilter: 'blur(6px)',
        transition: 'background 0.2s, border-color 0.2s, transform 0.2s',
        position: 'relative', overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = 'var(--surface-strong)';
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--purple-soft)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = 'var(--surface)';
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
        (e.currentTarget as HTMLDivElement).style.transform = 'none';
      }}
    >
      {isCombo && (
        <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--purple)', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '4px 12px', borderBottomLeftRadius: 'var(--r-md)', textTransform: 'uppercase', letterSpacing: 1 }}>
          Combo
        </div>
      )}

      {imgSrc ? (
        <img src={imgSrc} alt={product.name} style={{ width: 90, height: 90, borderRadius: 'var(--r-md)', objectFit: 'cover', flexShrink: 0 }} />
      ) : (
        <div style={{ width: 90, height: 90, borderRadius: 'var(--r-md)', background: 'rgba(255,255,255,0.05)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
          <Package size={28} color="var(--t3)" />
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4, color: '#fff' }}>{product.name}</p>
        {product.description && (
          <p style={{
            fontSize: '0.8rem', color: 'var(--t2)', marginBottom: 8,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            lineHeight: 1.4
          }}>
            {product.description}
          </p>
        )}
        <p style={{ fontWeight: 800, color: 'var(--yellow)', fontSize: '1rem', marginTop: 'auto' }}>
          {formatCurrency(basePrice)}
        </p>
      </div>
    </div>
  );
}
