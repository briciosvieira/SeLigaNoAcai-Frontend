import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Banner } from '@/types/banner.types';
import { env } from '@/config/env';

type BannerCarouselProps = {
  banners: Banner[];
  intervalMs?: number;
};

export function BannerCarousel({ banners, intervalMs = 5000 }: BannerCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = banners.length;
  const safeCurrent = total > 0 ? Math.min(current, total - 1) : 0;

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  function pauseBriefly() {
    setPaused(true);
    setTimeout(() => setPaused(false), 3000);
  }

  useEffect(() => {
    if (total <= 1 || paused) return;
    timerRef.current = setInterval(next, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [total, paused, next, intervalMs]);

  // Reset ao mudar quantidade de banners
  useEffect(() => {
    setCurrent(0);
  }, [total]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // só processa swipe horizontal; ignora se movimento vertical foi maior
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0) next(); else prev();
      pauseBriefly();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  }

  function handleNav(fn: () => void) {
    fn();
    pauseBriefly();
  }

  if (total === 0) {
    return <div className="bc-empty" />;
  }

  return (
    <div
      className="bc"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Track deslizante */}
      <div
        className="bc__track"
        style={{ transform: `translateX(-${safeCurrent * 100}%)` }}
      >
        {banners.map((banner, i) => {
          const desktopSrc = `${env.apiUrl}${banner.imageUrl}`;
          const mobileSrc = banner.mobileImageUrl
            ? `${env.apiUrl}${banner.mobileImageUrl}`
            : desktopSrc;

          const tabletSrc = banner.tabletImageUrl
            ? `${env.apiUrl}${banner.tabletImageUrl}`
            : null;

          return (
            <div key={banner.id} className="bc__slide" aria-hidden={i !== safeCurrent}>
              <picture className="bc__picture">
                <source media="(min-width: 1024px)" srcSet={desktopSrc} />
                {tabletSrc && <source media="(min-width: 768px)" srcSet={tabletSrc} />}
                <img
                  src={mobileSrc}
                  alt={`Banner ${i + 1}`}
                  className="bc__img"
                  draggable={false}
                />
              </picture>
            </div>
          );
        })}
      </div>

      {/* Setas (aparecem no desktop) */}
      {total > 1 && (
        <>
          <button
            className="bc__arrow bc__arrow--left"
            onClick={() => handleNav(prev)}
            aria-label="Banner anterior"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            className="bc__arrow bc__arrow--right"
            onClick={() => handleNav(next)}
            aria-label="Próximo banner"
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {/* Dots */}
      {total > 1 && (
        <div className="bc__dots" role="tablist">
          {banners.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === safeCurrent}
              className={`bc__dot${i === safeCurrent ? ' bc__dot--active' : ''}`}
              onClick={() => { setCurrent(i); pauseBriefly(); }}
              aria-label={`Ir para banner ${i + 1}`}
            />
          ))}
        </div>
      )}

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .bc {
    position: relative;
    width: 100%;
    aspect-ratio: 2/1;
    overflow: hidden;
    border-radius: 3px;
    background: var(--c2);
    user-select: none;
    flex-shrink: 0;
  }

  .bc-empty {
    width: 100%;
    aspect-ratio: 2/1;
    border-radius: 3px;
    background: linear-gradient(145deg, #2d0a55 0%, #1e0838 55%, #0d0d0d 100%);
  }

  .bc__track {
    display: flex;
    height: 100%;
    transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
  }

  .bc__slide {
    flex-shrink: 0;
    width: 100%;
    height: 100%;
  }

  .bc__picture {
    display: block;
    width: 100%;
    height: 100%;
  }

  .bc__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center center;
    display: block;
    pointer-events: none;
  }

  /* setas: ocultas no mobile */
  .bc__arrow {
    display: none;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.42);
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    align-items: center;
    justify-content: center;
    color: #fff;
    cursor: pointer;
    z-index: 10;
    transition: background 0.2s;
    flex-shrink: 0;
  }
  .bc__arrow:hover  { background: rgba(0, 0, 0, 0.65); }
  .bc__arrow--left  { left:  14px; }
  .bc__arrow--right { right: 14px; }

  /* dots */
  .bc__dots {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 6px;
    z-index: 10;
  }

  .bc__dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.35);
    border: none;
    cursor: pointer;
    padding: 0;
    transition: background 0.25s, width 0.25s;
    flex-shrink: 0;
  }
  .bc__dot--active {
    background: #fff;
    width: 20px;
    border-radius: 4px;
  }

  @media (min-width: 768px) {
    .bc       { aspect-ratio: 3/1; }
    .bc-empty { aspect-ratio: 3/1; }
  }

  @media (min-width: 1024px) {
    .bc       { aspect-ratio: 4/1; border-radius: 3px; }
    .bc-empty { aspect-ratio: 4/1; border-radius: 3px; }
    .bc__arrow { display: flex; }
    .bc__dot       { width: 8px;  height: 8px; }
    .bc__dot--active { width: 24px; }
  }
`;
