import { useState, useMemo } from 'react';
import {
  getDeliveryZonesRequest,
  createDeliveryZoneRequest,
  updateDeliveryZoneRequest,
  deleteDeliveryZoneRequest,
} from '@/services/delivery-zones.service';
import { getCurrentStoreRequest } from '@/services/store.service';
import { getErrorMessage } from '@/utils/format.util';
import type { DeliveryZone, CreateDeliveryZonePayload, UpdateDeliveryZonePayload } from '@/types/delivery-zone.types';
import type { Store } from '@/types/store.types';

export type ZoneStatusFilter = 'all' | 'available' | 'unavailable';

function normalizeText(value?: string | null): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function sortZonesAlphabetically(zones: DeliveryZone[]): DeliveryZone[] {
  return [...zones].sort((a, b) => {
    const neighborhoodCompare = normalizeText(a.neighborhood).localeCompare(
      normalizeText(b.neighborhood),
      'pt-BR',
    );
    if (neighborhoodCompare !== 0) return neighborhoodCompare;

    const cityCompare = normalizeText(a.city).localeCompare(normalizeText(b.city), 'pt-BR');
    if (cityCompare !== 0) return cityCompare;

    return normalizeText(a.state).localeCompare(normalizeText(b.state), 'pt-BR');
  });
}

export function useAdminDeliveryZones() {
  const [allZones, setAllZones] = useState<DeliveryZone[]>([]);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ZoneStatusFilter>('all');

  async function loadZones() {
    setIsLoading(true);
    setError(null);
    try {
      const [zones, store] = await Promise.all([
        getDeliveryZonesRequest(),
        getCurrentStoreRequest(),
      ]);
      setAllZones(sortZonesAlphabetically(zones ?? []));
      setCurrentStore(store);
    } catch (err) {
      setError(getErrorMessage(err));
      setAllZones([]);
    } finally {
      setIsLoading(false);
    }
  }

  const zones = useMemo(() => {
    let result = [...allZones];

    if (statusFilter === 'available') result = result.filter((z) => z.isAvailable);
    if (statusFilter === 'unavailable') result = result.filter((z) => !z.isAvailable);

    if (searchTerm.trim()) {
      const search = normalizeText(searchTerm);
      result = result.filter(
        (z) =>
          normalizeText(z.neighborhood).includes(search) ||
          normalizeText(z.city).includes(search) ||
          normalizeText(z.state).includes(search)
      );
    }

    return sortZonesAlphabetically(result);
  }, [allZones, searchTerm, statusFilter]);

  async function createZone(payload: CreateDeliveryZonePayload): Promise<void> {
    setIsSaving(true);
    try {
      await createDeliveryZoneRequest(payload);
      await loadZones();
    } finally {
      setIsSaving(false);
    }
  }

  async function updateZone(id: string, payload: UpdateDeliveryZonePayload): Promise<void> {
    setIsSaving(true);
    try {
      await updateDeliveryZoneRequest(id, payload);
      await loadZones();
    } finally {
      setIsSaving(false);
    }
  }

  async function updateZoneStatus(id: string, isAvailable: boolean): Promise<void> {
    // Optimistic update
    setAllZones((prev) =>
      prev.map((z) => (z.id === id ? { ...z, isAvailable } : z)),
    );
    try {
      await updateDeliveryZoneRequest(id, { isAvailable });
      await loadZones();
    } catch {
      // Rollback
      await loadZones();
      throw new Error('Erro ao atualizar disponibilidade.');
    }
  }

  async function deleteZone(id: string): Promise<void> {
    setIsSaving(true);
    try {
      await deleteDeliveryZoneRequest(id);
      setAllZones((prev) => sortZonesAlphabetically(prev.filter((z) => z.id !== id)));
      await loadZones();
    } finally {
      setIsSaving(false);
    }
  }

  return {
    zones,
    allZones,
    currentStore,
    isLoading,
    isSaving,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    loadZones,
    createZone,
    updateZone,
    updateZoneStatus,
    deleteZone,
  };
}
