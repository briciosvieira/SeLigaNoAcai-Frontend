import { useEffect, useState } from 'react';
import { getActiveAnnouncementRequest } from '@/services/announcement.service';
import { resolveImageUrl } from '@/utils/image-url.util';
import type { Announcement } from '@/types/announcement.types';

export function AnnouncementModal() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getActiveAnnouncementRequest()
      .then((data) => {
        if (cancelled || !data) return;
        const key = `announcement-closed-${data.id}`;
        if (sessionStorage.getItem(key)) return;
        setAnnouncement(data);
        setVisible(true);
      })
      .catch(() => {/* silently ignore — modal is non-critical */});
    return () => { cancelled = true; };
  }, []);

  function handleClose() {
    if (announcement) {
      sessionStorage.setItem(`announcement-closed-${announcement.id}`, '1');
    }
    setVisible(false);
  }

  if (!visible || !announcement) return null;

  const imgSrc = resolveImageUrl(announcement.imageUrl);
  if (!imgSrc) return null;

  return (
    <>
      <div
        className="announcement-modal-overlay"
        onClick={handleClose}
        role="dialog"
        aria-modal="true"
        aria-label="Informativo"
      >
        <div
          className="announcement-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={imgSrc}
            alt="Informativo"
            className="announcement-modal-image"
          />
          <button
            className="announcement-modal-close"
            onClick={handleClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
      </div>

      <style>{`
        .announcement-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
          background: rgba(0, 0, 0, 0.72);
          backdrop-filter: blur(8px);
          animation: ann-fade-in 0.22s ease;
        }

        @keyframes ann-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .announcement-modal {
          position: relative;
          width: min(520px, 100%);
          border-radius: 24px;
          overflow: hidden;
          background: #12051a;
          box-shadow: 0 28px 90px rgba(0, 0, 0, 0.55);
          animation: ann-scale-in 0.22s ease;
        }

        @keyframes ann-scale-in {
          from { transform: scale(0.94); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }

        .announcement-modal-image {
          width: 100%;
          display: block;
          object-fit: contain;
        }

        .announcement-modal-close {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 38px;
          height: 38px;
          border: 0;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.58);
          color: #ffffff;
          font-size: 22px;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
        }

        .announcement-modal-close:hover {
          background: rgba(0, 0, 0, 0.78);
        }
      `}</style>
    </>
  );
}
