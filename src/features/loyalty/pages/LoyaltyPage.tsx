import { useEffect } from 'react';
import { useLoyalty } from '@/hooks/useLoyalty';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Gift } from 'lucide-react';

export function LoyaltyPage() {
  const { card, benefits, isLoading, error, loadLoyalty } = useLoyalty();

  useEffect(() => {
    loadLoyalty();
  }, []);

  if (isLoading) return <FullPageSpinner />;

  return (
    <div>
      <div style={{ padding: '20px 16px 12px' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Fidelidade</h1>
        <p style={{ color: 'var(--t2)', fontSize: '0.875rem' }}>Acumule carimbos e ganhe prêmios</p>
      </div>

      {error && (
        <EmptyState
          icon={<Gift size={48} />}
          title="Erro ao carregar fidelidade"
          description={error}
          action={<button onClick={loadLoyalty} style={{ color: 'var(--roxo-c)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Tentar novamente</button>}
        />
      )}

      {!error && !card && !isLoading && (
        <EmptyState
          icon={<Gift size={48} />}
          title="Você ainda não tem cartão fidelidade"
          description="Faça um pedido para começar a acumular carimbos"
        />
      )}

      {!error && card && (
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Cartão */}
          <div style={{
            background: 'linear-gradient(135deg, var(--roxo), var(--roxo-v))',
            borderRadius: 'var(--r-xl)',
            padding: 20,
            boxShadow: 'var(--shadow-md)',
          }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--roxo-c)', fontWeight: 600, marginBottom: 12 }}>SEU CARTÃO FIDELIDADE</p>

            {/* Carimbos */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(card.maxStamps, 5)}, 1fr)`, gap: 8, marginBottom: 16 }}>
              {Array.from({ length: card.maxStamps }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.3)',
                    background: i < card.stamps ? 'var(--am)' : 'rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                  }}
                >
                  {i < card.stamps ? '🍇' : ''}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
                {card.stamps}/{card.maxStamps} carimbos
              </span>
              {card.isComplete && (
                <span style={{ background: 'var(--am)', color: '#000', fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: 'var(--r-full)' }}>
                  COMPLETO!
                </span>
              )}
            </div>

            {card.rewardDescription && (
              <p style={{ marginTop: 12, fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                Prêmio: {card.rewardDescription}
              </p>
            )}
          </div>

          {/* Benefícios */}
          {benefits.length > 0 && (
            <div>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--t2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                Benefícios disponíveis
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {benefits.map((b) => (
                  <div key={b.id} style={{ background: 'var(--card)', borderRadius: 'var(--r-md)', padding: 14, border: '1px solid var(--c3)' }}>
                    <p style={{ fontWeight: 700, marginBottom: 2 }}>{b.title}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--t2)' }}>{b.description}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--am)', marginTop: 4, fontWeight: 600 }}>
                      {b.requiredStamps} carimbos
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
