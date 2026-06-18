import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '@/hooks/useLocation';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatBRL } from '@/utils/currency.util';
import { MapPin, Check } from 'lucide-react';
import type { DeliveryZone } from '@/types/delivery-zone.types';

export function LocationPage() {
  const navigate = useNavigate();
  const { zones, isLoading, error, selectedDeliveryZone, loadDeliveryZones, selectDeliveryZone } =
    useLocation();

  useEffect(() => {
    loadDeliveryZones();
  }, []);

  const availableZones = zones.filter((z) => z.isAvailable);

  function handleSelect(zone: DeliveryZone) {
    selectDeliveryZone(zone);
    navigate(-1);
  }

  function zoneFeeLabel(zone: DeliveryZone): string {
    const fee = Number(zone.deliveryFee);
    return fee === 0 ? 'Grátis' : formatBRL(fee);
  }

  return (
    <div style={{ maxWidth: 'var(--max)', margin: '0 auto' }}>
      <div style={{ padding: '20px 16px 12px' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 4 }}>Selecionar bairro</h1>
        <p style={{ color: 'var(--t2)', fontSize: '0.875rem' }}>
          Escolha o bairro para calcular a taxa de entrega
        </p>
      </div>

      {isLoading && <FullPageSpinner />}

      {!isLoading && error && (
        <EmptyState
          icon={<MapPin size={48} />}
          title="Erro ao carregar bairros"
          description={error}
          action={
            <button
              onClick={loadDeliveryZones}
              style={{ color: 'var(--roxo-c)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              Tentar novamente
            </button>
          }
        />
      )}

      {!isLoading && !error && availableZones.length === 0 && (
        <EmptyState
          icon={<MapPin size={48} />}
          title="Nenhuma região disponível"
          description="Nenhuma região disponível para entrega no momento."
        />
      )}

      {!isLoading && !error && availableZones.length > 0 && (
        <ul style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {availableZones.map((zone) => {
            const isSelected = selectedDeliveryZone?.id === zone.id;
            return (
              <li key={zone.id}>
                <button
                  onClick={() => handleSelect(zone)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: isSelected ? 'rgba(91,26,138,0.3)' : 'var(--card)',
                    border: `1px solid ${isSelected ? 'var(--roxo-v)' : 'var(--c3)'}`,
                    borderRadius: 'var(--r-md)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    transition: 'background 0.15s, border-color 0.15s',
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--txt)', marginBottom: 2 }}>
                      {zone.neighborhood}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--t2)', marginBottom: 6 }}>
                      {zone.city} · {zone.state}
                    </p>
                    <span style={{ fontSize: '0.875rem', color: 'var(--am)', fontWeight: 700 }}>
                      {zoneFeeLabel(zone)}
                    </span>
                  </div>
                  {isSelected && <Check size={20} color="#4caf50" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
