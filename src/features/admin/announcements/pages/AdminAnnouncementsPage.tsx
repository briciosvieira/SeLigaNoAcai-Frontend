import { useEffect, useRef, useState } from 'react';
import { Upload, Trash2, Plus, X, Check } from 'lucide-react';
import {
  getAdminAnnouncementsRequest,
  createAdminAnnouncementRequest,
  updateAdminAnnouncementRequest,
  deleteAdminAnnouncementRequest,
  uploadAnnouncementImageRequest,
} from '@/services/announcement.service';
import { resolveImageUrl } from '@/utils/image-url.util';
import { getApiErrorMessage } from '@/utils/api-error.util';
import type { Announcement } from '@/types/announcement.types';
import './AdminAnnouncementsPage.css';

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
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

function toInputDate(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

const EMPTY_FORM = { imageUrl: '', startAt: '', endAt: '', isActive: true };

export function AdminAnnouncementsPage() {
  const [list, setList] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    setIsLoading(true);
    try {
      const data = await getAdminAnnouncementsRequest();
      setList(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  function openForm() {
    setForm(EMPTY_FORM);
    setError(null);
    setSuccess(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setForm(EMPTY_FORM);
  }

  async function handleUploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const { url } = await uploadAnnouncementImageRequest(file);
      setForm((prev) => ({ ...prev, imageUrl: url }));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsUploading(false);
      if (imgInputRef.current) imgInputRef.current.value = '';
    }
  }

  async function handleSubmit() {
    if (!form.imageUrl) { setError('Faça upload de uma imagem primeiro.'); return; }
    if (!form.startAt) { setError('Defina a data de início.'); return; }
    if (!form.endAt) { setError('Defina a data de fim.'); return; }

    setIsSubmitting(true);
    setError(null);
    try {
      await createAdminAnnouncementRequest({
        imageUrl: form.imageUrl,
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt + 'T23:59:59').toISOString(),
        isActive: form.isActive,
      });
      setSuccess('Informativo criado com sucesso!');
      closeForm();
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleActive(item: Announcement) {
    try {
      await updateAdminAnnouncementRequest(item.id, { isActive: !item.isActive });
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Excluir este informativo?')) return;
    setDeletingId(id);
    try {
      await deleteAdminAnnouncementRequest(id);
      setSuccess('Informativo excluído.');
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="admin-ann-page">
      <div className="admin-ann-header">
        <div>
          <h1>Informativos</h1>
          <p>Gerencie os banners informativos exibidos na tela inicial do app</p>
        </div>
        <button className="admin-ann-new-btn" onClick={openForm} type="button">
          <Plus size={15} /> Novo informativo
        </button>
      </div>

      {error && (
        <div className="admin-ann-alert error">
          <span>{error}</span>
          <button onClick={() => setError(null)}><X size={14} /></button>
        </div>
      )}
      {success && (
        <div className="admin-ann-alert success">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)}><X size={14} /></button>
        </div>
      )}

      {/* Creation form */}
      {showForm && (
        <div className="admin-ann-form-card">
          <div className="admin-ann-form-title-row">
            <h2>Novo informativo</h2>
            <button className="admin-ann-form-close" onClick={closeForm} type="button">
              <X size={16} />
            </button>
          </div>

          {/* Image upload */}
          <div className="admin-ann-field">
            <label>Imagem</label>
            <p className="admin-ann-field-hint">Recomendado: 900×1200px ou 1080×1080px · JPG/PNG/WEBP</p>
            {form.imageUrl && (
              <img
                src={resolveImageUrl(form.imageUrl) ?? undefined}
                alt="Preview"
                className="admin-ann-preview"
              />
            )}
            <button
              className="admin-ann-upload-btn"
              onClick={() => imgInputRef.current?.click()}
              disabled={isUploading}
              type="button"
            >
              <Upload size={14} />
              {isUploading ? 'Enviando…' : form.imageUrl ? 'Trocar imagem' : 'Enviar imagem'}
            </button>
            <input
              ref={imgInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handleUploadImage}
            />
          </div>

          {/* Dates */}
          <div className="admin-ann-date-row">
            <div className="admin-ann-field">
              <label>Data de início</label>
              <input
                type="date"
                className="admin-ann-input"
                value={form.startAt}
                onChange={(e) => setForm((p) => ({ ...p, startAt: e.target.value }))}
              />
            </div>
            <div className="admin-ann-field">
              <label>Data de fim</label>
              <input
                type="date"
                className="admin-ann-input"
                value={form.endAt}
                onChange={(e) => setForm((p) => ({ ...p, endAt: e.target.value }))}
              />
            </div>
          </div>

          {/* Active toggle */}
          <div className="admin-ann-toggle-row">
            <span>Ativar imediatamente</span>
            <label className="admin-ann-toggle">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
              />
              <span className="admin-ann-toggle-track" />
            </label>
          </div>

          <button
            className="admin-ann-save-btn"
            onClick={handleSubmit}
            disabled={isSubmitting || isUploading}
            type="button"
          >
            <Check size={15} />
            {isSubmitting ? 'Salvando…' : 'Criar informativo'}
          </button>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <p className="admin-ann-loading">Carregando…</p>
      ) : list.length === 0 ? (
        <div className="admin-ann-empty">
          <p>Nenhum informativo cadastrado.</p>
          <p>Clique em <strong>Novo informativo</strong> para criar o primeiro.</p>
        </div>
      ) : (
        <div className="admin-ann-list">
          {list.map((item) => {
            const img = resolveImageUrl(item.imageUrl);
            return (
              <div key={item.id} className={`admin-ann-item${item.isActive ? ' is-active' : ''}`}>
                {img && (
                  <img src={img} alt="Informativo" className="admin-ann-item-img" />
                )}
                <div className="admin-ann-item-info">
                  <div className="admin-ann-item-dates">
                    <span>{formatDate(item.startAt)}</span>
                    <span className="admin-ann-item-sep">→</span>
                    <span>{formatDate(item.endAt)}</span>
                  </div>
                  <span className={`admin-ann-item-status${item.isActive ? ' active' : ''}`}>
                    {item.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div className="admin-ann-item-actions">
                  <button
                    className={`admin-ann-toggle-status-btn${item.isActive ? ' deactivate' : ' activate'}`}
                    onClick={() => void handleToggleActive(item)}
                    type="button"
                  >
                    {item.isActive ? 'Desativar' : 'Ativar'}
                  </button>
                  <button
                    className="admin-ann-delete-btn"
                    onClick={() => void handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    type="button"
                    aria-label="Excluir"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
