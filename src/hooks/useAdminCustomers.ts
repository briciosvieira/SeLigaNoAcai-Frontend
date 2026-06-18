import { useState } from 'react';
import {
  getAdminCustomersRequest,
  getAdminCustomerByIdRequest,
  updateAdminCustomerRequest,
  updateAdminCustomerStatusRequest,
  updateAdminCustomerPasswordRequest,
} from '@/services/admin-customers.service';
import type {
  AdminCustomer,
  AdminCustomerFilters,
  UpdateAdminCustomerPayload,
  UpdateAdminCustomerPasswordPayload,
} from '@/types/customer.types';

export function useAdminCustomers() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AdminCustomerFilters>({});

  async function loadCustomers(params?: AdminCustomerFilters) {
    setIsLoading(true);
    setError(null);
    const active = params ?? filters;
    try {
      const data = await getAdminCustomersRequest(active);
      setCustomers(data ?? []);
    } catch {
      setError('Erro ao carregar clientes');
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function searchCustomers(search: string) {
    const next = { ...filters, search: search || undefined };
    setFilters(next);
    await loadCustomers(next);
  }

  async function filterByStatus(isActive?: boolean) {
    const next = { ...filters, isActive };
    setFilters(next);
    await loadCustomers(next);
  }

  async function openCustomerDetail(id: string) {
    setIsDetailLoading(true);
    try {
      const data = await getAdminCustomerByIdRequest(id);
      setSelectedCustomer(data);
    } catch {
      setSelectedCustomer(null);
    } finally {
      setIsDetailLoading(false);
    }
  }

  function closeCustomerDetail() {
    setSelectedCustomer(null);
  }

  async function refreshSelectedCustomer() {
    if (!selectedCustomer) return;
    setIsDetailLoading(true);
    try {
      const data = await getAdminCustomerByIdRequest(selectedCustomer.id);
      setSelectedCustomer(data);
    } finally {
      setIsDetailLoading(false);
    }
  }

  async function updateCustomer(id: string, payload: UpdateAdminCustomerPayload) {
    await updateAdminCustomerRequest(id, payload);
    await loadCustomers();
    if (selectedCustomer?.id === id) await refreshSelectedCustomer();
  }

  async function updateCustomerStatus(id: string, isActive: boolean) {
    await updateAdminCustomerStatusRequest(id, { isActive });
    await loadCustomers();
    if (selectedCustomer?.id === id) await refreshSelectedCustomer();
  }

  async function updateCustomerPassword(id: string, payload: UpdateAdminCustomerPasswordPayload) {
    await updateAdminCustomerPasswordRequest(id, payload);
  }

  return {
    customers,
    selectedCustomer,
    filters,
    isLoading,
    isDetailLoading,
    error,
    loadCustomers,
    searchCustomers,
    filterByStatus,
    openCustomerDetail,
    closeCustomerDetail,
    updateCustomer,
    updateCustomerStatus,
    updateCustomerPassword,
  };
}
