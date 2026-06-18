import { useEffect, useRef, useState } from 'react';
import { Plus, Search, Package } from 'lucide-react';
import { useAdminProducts } from '@/hooks/useAdminProducts';
import type { AdminStatusFilter, AdminTypeFilter } from '@/hooks/useAdminProducts';
import { usePermissions } from '@/hooks/usePermissions';
import { formatBRL } from '@/utils/currency.util';
import { getImageUrl } from '@/utils/image-url.util';
import { safeText } from '@/utils/format.util';
import { AdminProductDetailDrawer } from '../components/AdminProductDetailDrawer';
import { AdminProductForm } from '../components/AdminProductForm';
import type { Product } from '@/types/product.types';

export function AdminProductsPage() {
  const {
    products, selectedProduct, categories, variants, productRelations, allOptionGroups,
    isLoading, isDetailLoading, isSaving, isUploading, isLinkingSaving, error,
    searchTerm, setSearchTerm,
    categoryFilter, setCategoryFilter,
    statusFilter, setStatusFilter,
    typeFilter, setTypeFilter,
    loadProducts, loadCategories,
    openProductDetail, closeProductDetail,
    uploadProductImage, createProduct, updateProduct, deleteProduct,
    toggleProductStatus,
    createVariant, updateVariant, deleteVariant,
    linkOptionGroup, unlinkOptionGroup,
  } = useAdminProducts();

  const { isAdmin, hasPermission } = usePermissions();
  const canManage = isAdmin || hasPermission('MANAGE_PRODUCTS');

  const [searchInput, setSearchInput] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  function handleSearchChange(value: string) {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchTerm(value), 400);
  }

  function handleEdit(product: Product) {
    setEditingProduct(product);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingProduct(null);
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Produtos</h1>
        {canManage && (
          <button
            onClick={() => { setEditingProduct(null); setShowForm(true); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px',
              background: 'var(--roxo-v)', color: '#fff', border: 'none',
              borderRadius: 'var(--r-md)', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
            }}
          >
            <Plus size={16} /> Novo produto
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--t2)', pointerEvents: 'none' }} />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar produto…"
              style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: 'var(--r-md)', border: '1px solid var(--c3)', background: 'var(--c2)', color: 'var(--txt)', fontSize: '0.875rem', boxSizing: 'border-box' }}
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ padding: '9px 12px', borderRadius: 'var(--r-md)', border: '1px solid var(--c3)', background: 'var(--c2)', color: 'var(--txt)', fontSize: '0.875rem', minWidth: 160, cursor: 'pointer' }}
          >
            <option value="">Todas as categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
          {(['all', 'active', 'inactive'] as AdminStatusFilter[]).map((s) => (
            <FilterTab key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
              {s === 'all' ? 'Todos' : s === 'active' ? 'Ativos' : 'Inativos'}
            </FilterTab>
          ))}
          <span style={{ width: 1, background: 'var(--c3)', alignSelf: 'stretch', margin: '0 6px' }} />
          {(['all', 'product', 'combo'] as AdminTypeFilter[]).map((t) => (
            <FilterTab key={t} active={typeFilter === t} onClick={() => setTypeFilter(t)}>
              {t === 'all' ? 'Qualquer tipo' : t === 'product' ? 'Produtos' : 'Combos'}
            </FilterTab>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', color: '#f87171', borderRadius: 'var(--r-md)', marginBottom: 14, border: '1px solid rgba(239,68,68,0.25)', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {isLoading && (
        <p style={{ textAlign: 'center', padding: '48px 0', color: 'var(--t2)' }}>Carregando produtos…</p>
      )}

      {!isLoading && products.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <Package size={40} style={{ opacity: 0.2, margin: '0 auto 12px', display: 'block' }} />
          <p style={{ color: 'var(--t2)' }}>
            {searchTerm || categoryFilter || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Nenhum produto encontrado para os filtros aplicados.'
              : 'Nenhum produto cadastrado.'}
          </p>
        </div>
      )}

      {/* Cards (mobile) */}
      {!isLoading && products.length > 0 && (
        <>
          <div className="ap-cards">
            {products.map((p) => {
              const img = getImageUrl(p.imageUrl);
              return (
                <div key={p.id} className="ap-card" onClick={() => openProductDetail(p.id)}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 52, height: 52, flexShrink: 0, borderRadius: 'var(--r-md)', overflow: 'hidden', background: 'var(--c3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {img
                        ? <img src={img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <Package size={20} style={{ opacity: 0.3 }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--t2)', marginTop: 2 }}>{safeText(p.category?.name ?? null)}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                    <span style={{ fontWeight: 700, color: 'var(--am)', fontSize: '0.9rem' }}>{formatBRL(p.basePrice)}</span>
                    <StatusDot active={p.isActive} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table (desktop) */}
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Categoria</th>
                  <th>Preço</th>
                  <th>Variações</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const img = getImageUrl(p.imageUrl);
                  return (
                    <tr key={p.id} className="ap-row" onClick={() => openProductDetail(p.id)}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 'var(--r-md)', overflow: 'hidden', background: 'var(--c3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {img
                              ? <img src={img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <Package size={16} style={{ opacity: 0.3 }} />}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>{p.name}</p>
                            {p.description && (
                              <p style={{ fontSize: '0.72rem', color: 'var(--t2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>{p.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--t2)' }}>{safeText(p.category?.name ?? null)}</td>
                      <td style={{ fontWeight: 700, color: 'var(--am)', fontSize: '0.875rem' }}>{formatBRL(p.basePrice)}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--t2)' }}>{p.variants?.length ?? 0}</td>
                      <td><StatusBadge active={p.isActive} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Detail Drawer */}
      <AdminProductDetailDrawer
        product={selectedProduct}
        isLoading={isDetailLoading}
        isSaving={isSaving}
        variants={variants}
        productRelations={productRelations}
        allOptionGroups={allOptionGroups}
        isLinkingSaving={isLinkingSaving}
        onClose={closeProductDetail}
        onEdit={handleEdit}
        onToggleStatus={toggleProductStatus}
        onDelete={deleteProduct}
        onCreateVariant={createVariant}
        onUpdateVariant={updateVariant}
        onDeleteVariant={deleteVariant}
        onLinkOptionGroup={linkOptionGroup}
        onUnlinkOptionGroup={unlinkOptionGroup}
      />

      {/* Form Modal */}
      {showForm && (
        <AdminProductForm
          product={editingProduct}
          categories={categories}
          isUploading={isUploading}
          isSaving={isSaving}
          onClose={handleCloseForm}
          onCreate={createProduct}
          onUpdate={updateProduct}
          onUploadImage={uploadProductImage}
        />
      )}

      <style>{`
        .ap-cards { display: flex; flex-direction: column; gap: 10px; }
        .ap-card {
          background: var(--card); border: 1px solid var(--c3); border-radius: var(--r-lg);
          padding: 14px; cursor: pointer; transition: border-color 0.15s;
        }
        .ap-card:hover { border-color: var(--roxo-v); }
        .ap-table-wrap { display: none; }

        @media (min-width: 1024px) {
          .ap-cards { display: none; }
          .ap-table-wrap { display: block; overflow-x: auto; }
          .ap-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
          .ap-table th {
            text-align: left; padding: 10px 14px; font-size: 0.72rem; font-weight: 700;
            color: var(--t2); text-transform: uppercase; letter-spacing: 0.6px;
            border-bottom: 1px solid var(--c3);
          }
          .ap-row { cursor: pointer; transition: background 0.1s; }
          .ap-row:hover { background: var(--c2); }
          .ap-row td { padding: 12px 14px; border-bottom: 1px solid var(--c3); vertical-align: middle; }
        }
      `}</style>
    </div>
  );
}

function FilterTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px', borderRadius: 'var(--r-full)', fontSize: '0.8rem', fontWeight: 600,
        border: `1px solid ${active ? 'var(--roxo-v)' : 'var(--c3)'}`,
        background: active ? 'var(--roxo-v)' : 'transparent',
        color: active ? '#fff' : 'var(--t2)',
        cursor: 'pointer', transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 'var(--r-full)', fontSize: '0.72rem', fontWeight: 700,
      background: active ? 'rgba(76,175,80,0.15)' : 'rgba(239,68,68,0.15)',
      color: active ? '#4caf50' : '#f87171',
      border: `1px solid ${active ? '#4caf5033' : '#f8717133'}`,
    }}>
      {active ? 'Ativo' : 'Inativo'}
    </span>
  );
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 'var(--r-full)', fontSize: '0.7rem', fontWeight: 700,
      background: active ? 'rgba(76,175,80,0.15)' : 'rgba(239,68,68,0.15)',
      color: active ? '#4caf50' : '#f87171',
    }}>
      {active ? 'Ativo' : 'Inativo'}
    </span>
  );
}
