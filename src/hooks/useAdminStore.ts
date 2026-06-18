import { useState, useCallback } from 'react';
import {
  getStoreCurrentRequest,
  createStoreRequest,
  updateStoreRequest,
  deleteStoreRequest,
} from '@/services/store.service';
import { uploadStoreLogoRequest } from '@/services/uploads.service';
import { getErrorMessage } from '@/utils/format.util';
import type {
  Store,
  CreateStorePayload,
  UpdateStorePayload,
} from '@/types/store.types';

export function useAdminStore() {
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStore = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const currentStore = await getStoreCurrentRequest();
      console.log('Admin store loaded:', currentStore);
      setStore(currentStore);
    } catch (err) {
      console.error('Error loading current store:', err);
      setError(getErrorMessage(err));
      setStore(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  async function createStore(payload: CreateStorePayload): Promise<void> {
    setIsSaving(true);
    try {
      const newStore = await createStoreRequest(payload);
      setStore(newStore);
    } finally {
      setIsSaving(false);
    }
  }

  async function updateStore(payload: UpdateStorePayload): Promise<void> {
    setIsSaving(true);
    try {
      const updatedStore = await updateStoreRequest(payload);
      setStore(updatedStore);
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteStore(id: string): Promise<void> {
    setIsSaving(true);
    try {
      await deleteStoreRequest(id);
      setStore(null);
    } finally {
      setIsSaving(false);
    }
  }

  async function uploadLogo(file: File): Promise<string> {
    setIsUploading(true);
    try {
      const result = await uploadStoreLogoRequest(file);
      return result.url;
    } finally {
      setIsUploading(false);
    }
  }

  return {
    store,
    setStore,
    stores: store ? [store] : [],
    currentStore: store,
    isLoading,
    isSaving,
    isUploading,
    error,
    loadStore,
    loadStores: loadStore,
    createStore,
    updateStore,
    deleteStore,
    uploadLogo,
  };
}
