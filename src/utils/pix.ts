export type NormalizedPixPayload = {
  paymentId: string | null;
  copyPasteCode: string;
  qrCodeBase64: string | null;
  qrCode: string | null;
  expiresAt: string | null;
};

export const EMPTY_PIX: NormalizedPixPayload = {
  paymentId: null,
  copyPasteCode: '',
  qrCodeBase64: null,
  qrCode: null,
  expiresAt: null,
};

export function normalizePixPayload(payload: any): NormalizedPixPayload {
  const source =
    payload?.data ??
    payload?.payment ??
    payload?.pix ??
    payload;

  const paymentId =
    source?.paymentId ??
    source?.id ??
    payload?.paymentId ??
    payload?.payment?.id ??
    null;

  const copyPasteCode =
    source?.pixCopyPaste ??
    source?.copyPasteCode ??
    source?.brCode ??
    source?.payload ??
    payload?.pixCopyPaste ??
    payload?.payment?.pixCopyPaste ??
    payload?.pix?.pixCopyPaste ??
    '';

  const qrCodeBase64 =
    source?.pixQrCodeBase64 ??
    source?.qrCodeBase64 ??
    payload?.pixQrCodeBase64 ??
    payload?.payment?.pixQrCodeBase64 ??
    payload?.pix?.pixQrCodeBase64 ??
    null;

  const qrCode =
    source?.pixQrCode ??
    source?.qrCode ??
    payload?.pixQrCode ??
    payload?.payment?.pixQrCode ??
    payload?.pix?.pixQrCode ??
    null;

  const expiresAt =
    source?.expiresAt ??
    source?.pixExpiresAt ??
    payload?.expiresAt ??
    payload?.payment?.expiresAt ??
    payload?.pix?.expiresAt ??
    null;

  return {
    paymentId: paymentId ? String(paymentId) : null,
    copyPasteCode: String(copyPasteCode ?? ''),
    qrCodeBase64: qrCodeBase64 ? String(qrCodeBase64) : null,
    qrCode: qrCode ? String(qrCode) : null,
    expiresAt: expiresAt ? String(expiresAt) : null,
  };
}

export function resolvePixQrImageSrc(pix: NormalizedPixPayload): string | null {
  if (pix.qrCodeBase64) {
    if (pix.qrCodeBase64.startsWith('data:image')) {
      return pix.qrCodeBase64;
    }
    return `data:image/png;base64,${pix.qrCodeBase64}`;
  }
  if (pix.qrCode) {
    return pix.qrCode;
  }
  return null;
}
