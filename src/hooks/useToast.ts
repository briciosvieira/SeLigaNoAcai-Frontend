import { useUiStore } from '@/store/ui.store';
import type { ToastType } from '@/store/ui.store';

export function useToast() {
  const { showToast, hideToast } = useUiStore();

  function toast(message: string, type: ToastType = 'info') {
    showToast(message, type);
  }

  function success(message: string) {
    showToast(message, 'success');
  }

  function error(message: string) {
    showToast(message, 'error');
  }

  function info(message: string) {
    showToast(message, 'info');
  }

  function warning(message: string) {
    showToast(message, 'warning');
  }

  return { toast, success, error, info, warning, hide: hideToast };
}
