import { useCallback, useEffect, useState } from 'react';
import {
  getAdminLoyaltySettingsRequest,
  updateAdminLoyaltySettingsRequest,
  searchLoyaltyCustomersRequest,
  getAdminCustomerLoyaltyRequest,
  addCustomerLoyaltyStampRequest,
  removeCustomerLoyaltyStampRequest,
  uploadLoyaltyCardImageRequest,
} from '@/services/loyalty.service';
import { getApiErrorMessage } from '@/utils/api-error.util';
import type {
  LoyaltySettings,
  AdminLoyaltyCustomer,
  AdminLoyaltyCustomerListItem,
} from '@/types/loyalty.types';

export function useAdminLoyalty() {
  const [settings, setSettings] = useState<LoyaltySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AdminLoyaltyCustomerListItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<AdminLoyaltyCustomer | null>(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);
  const [isStampAction, setIsStampAction] = useState(false);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAdminLoyaltySettingsRequest();
      setSettings(result);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveSettings = useCallback(async (payload: Partial<LoyaltySettings>) => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const updated = await updateAdminLoyaltySettingsRequest(payload);
      setSettings(updated);
      setSuccessMessage('Configurações salvas com sucesso.');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }, []);

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    setIsUploading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const { url } = await uploadLoyaltyCardImageRequest(file);
      const updated = await updateAdminLoyaltySettingsRequest({ cardImageUrl: url });
      setSettings(updated);
      setSuccessMessage('Imagem do cartão atualizada.');
      return url;
    } catch (err) {
      setError(getApiErrorMessage(err));
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const searchCustomers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchLoyaltyCustomersRequest(query);
      setSearchResults(Array.isArray(results) ? results : []);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const openCustomer = useCallback(async (customerId: string) => {
    setIsLoadingCustomer(true);
    setSelectedCustomer(null);
    setError(null);
    try {
      const customer = await getAdminCustomerLoyaltyRequest(customerId);
      setSelectedCustomer(customer);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoadingCustomer(false);
    }
  }, []);

  const addStamp = useCallback(
    async (customerId: string, quantity: number, reason: string) => {
      setIsStampAction(true);
      setError(null);
      setSuccessMessage(null);
      try {
        const updated = await addCustomerLoyaltyStampRequest(customerId, {
          quantity,
          reason: reason.trim() || undefined,
        });
        setSelectedCustomer(updated);
        setSuccessMessage(`+${quantity} selo${quantity !== 1 ? 's' : ''} adicionado${quantity !== 1 ? 's' : ''}.`);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsStampAction(false);
      }
    },
    [],
  );

  const removeStamp = useCallback(
    async (customerId: string, quantity: number, reason: string) => {
      setIsStampAction(true);
      setError(null);
      setSuccessMessage(null);
      try {
        const updated = await removeCustomerLoyaltyStampRequest(customerId, {
          quantity,
          reason: reason.trim() || undefined,
        });
        setSelectedCustomer(updated);
        setSuccessMessage(`-${quantity} selo${quantity !== 1 ? 's' : ''} removido${quantity !== 1 ? 's' : ''}.`);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsStampAction(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  return {
    settings,
    isLoading,
    isSaving,
    isUploading,
    error,
    successMessage,
    setError,
    setSuccessMessage,
    saveSettings,
    uploadImage,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    searchCustomers,
    selectedCustomer,
    setSelectedCustomer,
    isLoadingCustomer,
    isStampAction,
    openCustomer,
    addStamp,
    removeStamp,
  };
}
