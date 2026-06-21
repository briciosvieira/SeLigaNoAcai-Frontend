import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoyalty } from '@/hooks/useLoyalty';
import { useAuthStore } from '@/store/auth.store';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { formatBRL } from '@/utils/currency.util';
import { resolveImageUrl } from '@/utils/image-url.util';
import type { LoyaltyCurrentCard, LoyaltyCardStatus } from '@/types/loyalty.types';
import './LoyaltyPage.css';

/* ── Helpers ── */

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return String(iso);
  }
}

function getCardStatusLabel(status: string): string {
  const s = String(status).toUpperCase();
  if (s === 'ACTIVE') return 'Ativo';
  if (s === 'COMPLETED') return 'Completo';
  if (s === 'EXPIRED') return 'Expirado';
  if (s === 'REDEEMED') return 'Brinde entregue';
  return status;
}

function getCardStatusClass(status: string): string {
  const s = String(status).toUpperCase() as LoyaltyCardStatus;
  if (s === 'ACTIVE') return 'active';
  if (s === 'COMPLETED') return 'completed';
  if (s === 'EXPIRED') return 'expired';
  if (s === 'REDEEMED') return 'redeemed';
  return 'unknown';
}

/* ── Stamp grid — columns adapt to stampsRequired ── */

function LoyaltyStampGrid({ stamps, total }: { stamps: number; total: number }) {
  const cols = total <= 5 ? total : 5;
  return (
    <div
      className="loyalty-stamp-grid"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {Array.from({ length: total }).map((_, index) => {
        const filled = index < stamps;
        return (
          <div
            key={index}
            className={['loyalty-stamp', filled ? 'filled' : ''].filter(Boolean).join(' ')}
          >
            {filled && (
              <svg viewBox="0 0 24 24" fill="none" className="loyalty-stamp-check">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Card status badge ── */

function CardStatusBadge({ status }: { status: string }) {
  return (
    <span className={`loyalty-card-status-badge ${getCardStatusClass(status)}`}>
      {getCardStatusLabel(status)}
    </span>
  );
}

/* ── Previous card item ── */

function PreviousCardItem({
  card,
  index,
  defaultReward,
}: {
  card: LoyaltyCurrentCard;
  index: number;
  defaultReward: string;
}) {
  const reward = card.rewardDescription ?? defaultReward;
  const statusUp = String(card.status).toUpperCase();

  const endDate =
    statusUp === 'REDEEMED'
      ? (card.redeemedAt ?? card.completedAt ?? card.expiresAt)
      : (card.completedAt ?? card.expiresAt);

  return (
    <div className="loyalty-prev-card">
      <div className="loyalty-prev-card-header">
        <span className="loyalty-prev-card-number">Cartão #{index + 1}</span>
        <CardStatusBadge status={card.status} />
      </div>

      <div className="loyalty-prev-card-grid">
        <div className="loyalty-prev-card-item">
          <span>Período</span>
          <strong>
            {formatDate(card.startedAt)}
            {endDate ? ` – ${formatDate(endDate)}` : ''}
          </strong>
        </div>
        <div className="loyalty-prev-card-item">
          <span>Selos</span>
          <strong>{card.stamps}/{card.stampsRequired}</strong>
        </div>
        {reward && (
          <div className="loyalty-prev-card-item">
            <span>Brinde</span>
            <strong>{reward}</strong>
          </div>
        )}
        {statusUp === 'REDEEMED' && card.redeemedAt && (
          <div className="loyalty-prev-card-item">
            <span>Retirado em</span>
            <strong>{formatDate(card.redeemedAt)}</strong>
          </div>
        )}
        {statusUp === 'EXPIRED' && card.expiresAt && (
          <div className="loyalty-prev-card-item">
            <span>Expirou em</span>
            <strong>{formatDate(card.expiresAt)}</strong>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main page ── */

export function LoyaltyPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isDisabled, error, reload } = useLoyalty();

  const [cardImageError, setCardImageError] = useState(false);

  useEffect(() => {
    if (isDisabled) {
      navigate('/', { replace: true });
    }
  }, [isDisabled, navigate]);

  if (isLoading) return <FullPageSpinner />;
  if (isDisabled) return null;

  const settings = data?.settings;
  const currentCard = data?.currentCard ?? null;
  const previousCards = data?.previousCards ?? [];
  const availableRewards = data?.availableRewards ?? 0;

  const customerName = data?.customerName ?? user?.fullName ?? '';
  const firstName = customerName.split(' ')[0] || 'cliente';

  const stampsRequired = currentCard?.stampsRequired ?? settings?.stampsRequired ?? 10;
  const stamps = currentCard?.stamps ?? 0;
  const minAmount = Number(settings?.minOrderAmount ?? 0);

  const isCompleted = currentCard?.status === 'COMPLETED';
  const isActive = currentCard?.status === 'ACTIVE';
  const hasCurrentCard = currentCard !== null && currentCard !== undefined;

  const resolvedCardImageUrl = !cardImageError ? resolveImageUrl(settings?.cardImageUrl) : null;
  const cardStyle: React.CSSProperties = resolvedCardImageUrl
    ? { backgroundImage: `url(${resolvedCardImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};

  const defaultDesc = settings
    ? `A cada compra acima de ${formatBRL(minAmount)} você ganha 1 selo. Complete ${stampsRequired} selos e ganhe 1 brinde.`
    : '';

  return (
    <div className="loyalty-page">
      <div className="loyalty-container">
        {/* Hero */}
        <div className="loyalty-hero">
          <h1>Olá, {firstName}!</h1>
          <p>{settings?.description ?? defaultDesc}</p>
          {settings?.validityMonths && (
            <p className="loyalty-hero-validity">
              Cartão válido por {settings.validityMonths}{' '}
              {settings.validityMonths === 1 ? 'mês' : 'meses'} após a primeira compra.
            </p>
          )}
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

        {/* Available rewards banner */}
        {!error && availableRewards > 0 && (
          <div className="loyalty-rewards-banner">
            <span className="loyalty-rewards-banner-icon">🎁</span>
            <div>
              <p className="loyalty-rewards-banner-title">
                Você tem {availableRewards}{' '}
                {availableRewards === 1 ? 'brinde disponível' : 'brindes disponíveis'}!
              </p>
              <p className="loyalty-rewards-banner-sub">
                Apresente este app na loja para retirar seu brinde.
              </p>
            </div>
          </div>
        )}

        {/* No card yet — empty state */}
        {!error && !hasCurrentCard && (
          <div className="loyalty-empty-state">
            <div className="loyalty-empty-icon">🛒</div>
            <h2>Você ainda não iniciou seu cartão.</h2>
            <p>
              Faça uma compra acima de {formatBRL(minAmount)} para começar e ganhar seu primeiro
              selo!
            </p>
          </div>
        )}

        {/* Current card */}
        {!error && hasCurrentCard && (
          <>
            {/* COMPLETED banner */}
            {isCompleted && (
              <div className="loyalty-completed-banner">
                <span>🎉</span>
                <div>
                  <p className="loyalty-completed-banner-title">Brinde disponível!</p>
                  <p className="loyalty-completed-banner-sub">
                    Seu cartão está completo. Apresente este app na loja para retirar seu brinde.
                  </p>
                </div>
              </div>
            )}

            {/* Virtual card */}
            <div
              className={[
                'loyalty-card-virtual',
                resolvedCardImageUrl ? 'has-image' : '',
                isCompleted ? 'is-completed' : '',
                isActive ? 'is-active' : '',
              ].filter(Boolean).join(' ')}
              style={cardStyle}
            >
              {resolvedCardImageUrl && (
                <img
                  src={resolvedCardImageUrl}
                  alt=""
                  style={{ display: 'none' }}
                  onError={() => setCardImageError(true)}
                />
              )}
              {resolvedCardImageUrl && <div className="loyalty-card-overlay" />}

              <div className="loyalty-card-content">
                <div className="loyalty-card-top-row">
                  <p className="loyalty-card-eyebrow">Cartão Fidelidade</p>
                  {currentCard.status && <CardStatusBadge status={currentCard.status} />}
                </div>

                <h2 className="loyalty-card-title">
                  {settings?.title ?? 'Se Liga no Açaí'}
                </h2>
                <p className="loyalty-card-customer">{customerName}</p>

                <LoyaltyStampGrid stamps={stamps} total={stampsRequired} />

                <div className="loyalty-card-progress">
                  <span>{stamps}/{stampsRequired} selos</span>
                </div>

                {(currentCard.rewardDescription ?? settings?.rewardDescription) && (
                  <p className="loyalty-card-reward-desc">
                    Brinde: {currentCard.rewardDescription ?? settings?.rewardDescription}
                  </p>
                )}

                {currentCard.expiresAt && (
                  <p className="loyalty-card-validity">
                    Válido até {formatDate(currentCard.expiresAt)}
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
                <span className="loyalty-info-label">Brindes disponíveis</span>
                <strong className={`loyalty-info-value${availableRewards > 0 ? ' loyalty-reward-count' : ''}`}>
                  {availableRewards}
                </strong>
              </div>
              {minAmount > 0 && (
                <div className="loyalty-info-box">
                  <span className="loyalty-info-label">Compra mínima</span>
                  <strong className="loyalty-info-value">{formatBRL(minAmount)}</strong>
                </div>
              )}
              {currentCard.startedAt && (
                <div className="loyalty-info-box">
                  <span className="loyalty-info-label">Início</span>
                  <strong className="loyalty-info-value loyalty-info-value--sm">
                    {formatDate(currentCard.startedAt)}
                  </strong>
                </div>
              )}
              {currentCard.expiresAt && (
                <div className="loyalty-info-box">
                  <span className="loyalty-info-label">Validade</span>
                  <strong className="loyalty-info-value loyalty-info-value--sm">
                    {formatDate(currentCard.expiresAt)}
                  </strong>
                </div>
              )}
              {currentCard.completedAt && (
                <div className="loyalty-info-box">
                  <span className="loyalty-info-label">Completado em</span>
                  <strong className="loyalty-info-value loyalty-info-value--sm">
                    {formatDate(currentCard.completedAt)}
                  </strong>
                </div>
              )}
            </div>
          </>
        )}

        {/* Previous cards */}
        {previousCards.length > 0 && (
          <div className="loyalty-prev-cards">
            <h3 className="loyalty-prev-cards-title">Cartões anteriores</h3>
            <div className="loyalty-prev-cards-list">
              {previousCards.map((card, i) => (
                <PreviousCardItem
                  key={card.id ?? i}
                  card={card}
                  index={i}
                  defaultReward={settings?.rewardDescription ?? ''}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
