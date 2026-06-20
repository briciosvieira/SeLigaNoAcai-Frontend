import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoyalty } from '@/hooks/useLoyalty';
import { useAuthStore } from '@/store/auth.store';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { formatBRL } from '@/utils/currency.util';
import './LoyaltyPage.css';

function LoyaltyStampGrid({ stamps, total }: { stamps: number; total: number }) {
  return (
    <div className="loyalty-stamp-grid">
      {Array.from({ length: total }).map((_, index) => {
        const filled = index < stamps;
        return (
          <div
            key={index}
            className={['loyalty-stamp', filled ? 'filled' : ''].filter(Boolean).join(' ')}
          >
            {filled ? '✓' : ''}
          </div>
        );
      })}
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function LoyaltyPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isDisabled, error, reload } = useLoyalty();

  useEffect(() => {
    if (isDisabled) {
      navigate('/', { replace: true });
    }
  }, [isDisabled, navigate]);

  if (isLoading) return <FullPageSpinner />;
  if (isDisabled) return null;

  const settings = data?.settings;
  const card = data?.card;
  const history = data?.history ?? [];

  const firstName = (card?.customerName ?? user?.fullName ?? '').split(' ')[0];
  const stampsRequired = settings?.stampsRequired ?? 10;
  const stamps = card?.stamps ?? 0;
  const availableRewards = card?.availableRewards ?? 0;
  const minAmount = Number(settings?.minOrderAmount ?? 0);
  const cardImageUrl = settings?.cardImageUrl;

  const cardStyle: React.CSSProperties = cardImageUrl
    ? { backgroundImage: `url(${cardImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};

  const defaultDesc = settings
    ? `A cada compra acima de ${formatBRL(minAmount)} você ganha 1 selo. Complete ${stampsRequired} selos e ganhe 1 brinde.`
    : '';

  return (
    <div className="loyalty-page">
      <div className="loyalty-container">
        {/* Hero */}
        <div className="loyalty-hero">
          <h1>Olá, {firstName || 'cliente'}!</h1>
          <p>{settings?.description ?? defaultDesc}</p>
        </div>

        {/* Error */}
        {error && (
          <div className="loyalty-error">
            <span>{error}</span>
            <button onClick={reload} className="loyalty-retry-btn">
              Tentar novamente
            </button>
          </div>
        )}

        {/* Card virtual */}
        {!error && card && (
          <>
            <div
              className={`loyalty-card-virtual${cardImageUrl ? ' has-image' : ''}`}
              style={cardStyle}
            >
              {cardImageUrl && <div className="loyalty-card-overlay" />}

              <div className="loyalty-card-content">
                <p className="loyalty-card-eyebrow">Cartão Fidelidade</p>
                <h2 className="loyalty-card-title">
                  {settings?.title ?? 'Se Liga no Açaí'}
                </h2>
                <p className="loyalty-card-customer">{card.customerName}</p>

                <LoyaltyStampGrid stamps={stamps} total={stampsRequired} />

                <div className="loyalty-card-progress">
                  <span>{stamps}/{stampsRequired} selos</span>
                  {availableRewards > 0 && (
                    <div className="loyalty-reward-box">
                      🎁 {availableRewards} {availableRewards === 1 ? 'brinde disponível' : 'brindes disponíveis'}
                    </div>
                  )}
                </div>

                {settings?.rewardDescription && (
                  <p className="loyalty-card-reward-desc">
                    Brinde: {settings.rewardDescription}
                  </p>
                )}
              </div>
            </div>

            {/* Info grid */}
            <div className="loyalty-info-grid">
              <div className="loyalty-info-box">
                <span className="loyalty-info-label">Selos atuais</span>
                <strong className="loyalty-info-value">{stamps}/{stampsRequired}</strong>
              </div>
              <div className="loyalty-info-box">
                <span className="loyalty-info-label">Total conquistados</span>
                <strong className="loyalty-info-value">{card.totalEarnedStamps}</strong>
              </div>
              <div className="loyalty-info-box">
                <span className="loyalty-info-label">Brindes disponíveis</span>
                <strong className="loyalty-info-value loyalty-reward-count">{availableRewards}</strong>
              </div>
              <div className="loyalty-info-box">
                <span className="loyalty-info-label">Compra mínima</span>
                <strong className="loyalty-info-value">{formatBRL(minAmount)}</strong>
              </div>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="loyalty-history">
                <h3 className="loyalty-history-title">Histórico</h3>
                <div className="loyalty-history-list">
                  {history.map((item) => (
                    <div key={item.id} className="loyalty-history-item">
                      <div className="loyalty-history-info">
                        <span className={`loyalty-history-type ${item.quantity > 0 ? 'earned' : 'removed'}`}>
                          {item.quantity > 0 ? `+${item.quantity}` : item.quantity} selo{Math.abs(item.quantity) !== 1 ? 's' : ''}
                        </span>
                        {item.reason && (
                          <span className="loyalty-history-reason">{item.reason}</span>
                        )}
                      </div>
                      <span className="loyalty-history-date">{formatDate(item.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
