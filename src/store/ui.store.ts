import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export type ToastData = {
  message: string;
  type: ToastType;
  id: number;
};

type UiState = {
  toast: ToastData | null;
  isLoading: boolean;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
  setLoading: (loading: boolean) => void;
};

export const useUiStore = create<UiState>()((set) => ({
  toast: null,
  isLoading: false,

  showToast: (message, type = 'info') =>
    set({ toast: { message, type, id: Date.now() } }),

  hideToast: () => set({ toast: null }),

  setLoading: (loading) => set({ isLoading: loading }),
}));
