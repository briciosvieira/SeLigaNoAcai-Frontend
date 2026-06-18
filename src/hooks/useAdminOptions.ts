import { useState } from 'react';
import {
  getOptionGroupsRequest,
  getOptionGroupByIdRequest,
  createOptionGroupRequest,
  updateOptionGroupRequest,
  deleteOptionGroupRequest,
  createProductOptionRequest,
  updateProductOptionRequest,
  deleteProductOptionRequest,
} from '@/services/options.service';
import { getErrorMessage } from '@/utils/format.util';
import type {
  OptionGroup,
  CreateOptionGroupPayload,
  UpdateOptionGroupPayload,
  CreateProductOptionPayload,
  UpdateProductOptionPayload,
} from '@/types/product.types';

export function useAdminOptions() {
  const [groups, setGroups] = useState<OptionGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<OptionGroup | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadGroups() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getOptionGroupsRequest();
      setGroups(data ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function openGroupDetail(id: string) {
    setIsDetailLoading(true);
    try {
      const group = await getOptionGroupByIdRequest(id);
      setSelectedGroup(group);
    } catch {
      setSelectedGroup(null);
    } finally {
      setIsDetailLoading(false);
    }
  }

  function closeGroupDetail() {
    setSelectedGroup(null);
  }

  // ── Groups ────────────────────────────────────────────────────────────────────

  async function createGroup(payload: CreateOptionGroupPayload): Promise<void> {
    setIsSaving(true);
    try {
      await createOptionGroupRequest(payload);
      await loadGroups();
    } finally {
      setIsSaving(false);
    }
  }

  async function updateGroup(id: string, payload: UpdateOptionGroupPayload): Promise<void> {
    setIsSaving(true);
    try {
      await updateOptionGroupRequest(id, payload);
      await loadGroups();
      if (selectedGroup?.id === id) {
        const updated = await getOptionGroupByIdRequest(id);
        setSelectedGroup(updated);
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteGroup(id: string): Promise<void> {
    setIsSaving(true);
    try {
      await deleteOptionGroupRequest(id);
      if (selectedGroup?.id === id) setSelectedGroup(null);
      await loadGroups();
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleGroupStatus(id: string, isActive: boolean): Promise<void> {
    await updateOptionGroupRequest(id, { isActive });
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, isActive } : g)));
    if (selectedGroup?.id === id) {
      setSelectedGroup((prev) => (prev ? { ...prev, isActive } : null));
    }
  }

  // ── Options ───────────────────────────────────────────────────────────────────

  async function createOption(payload: CreateProductOptionPayload): Promise<void> {
    setIsSaving(true);
    try {
      await createProductOptionRequest(payload);
      // Reload full list so the new option appears immediately
      await loadGroups();
    } finally {
      setIsSaving(false);
    }
  }

  async function updateOption(
    optionId: string,
    groupId: string,
    payload: UpdateProductOptionPayload,
  ): Promise<void> {
    setIsSaving(true);
    try {
      await updateProductOptionRequest(optionId, payload);
      await loadGroups();
      if (selectedGroup?.id === groupId) {
        const updated = await getOptionGroupByIdRequest(groupId);
        setSelectedGroup(updated);
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteOption(optionId: string, groupId: string): Promise<void> {
    // Optimistic removal from both lists
    setGroups((prev) =>
      prev.map((g) =>
        g.id !== groupId
          ? g
          : { ...g, options: (g.options ?? []).filter((o) => o.id !== optionId) },
      ),
    );
    if (selectedGroup?.id === groupId) {
      setSelectedGroup((prev) =>
        prev
          ? { ...prev, options: (prev.options ?? []).filter((o) => o.id !== optionId) }
          : null,
      );
    }

    setIsSaving(true);
    try {
      await deleteProductOptionRequest(optionId);
      // Background sync — don't await so the UI stays responsive
      loadGroups();
    } catch (err) {
      // Rollback: reload so the removed option reappears
      await loadGroups();
      throw err;
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleOptionStatus(
    optionId: string,
    groupId: string,
    isActive: boolean,
  ): Promise<void> {
    await updateProductOptionRequest(optionId, { isActive });
    setGroups((prev) =>
      prev.map((g) =>
        g.id !== groupId
          ? g
          : {
              ...g,
              options: (g.options ?? []).map((o) =>
                o.id === optionId ? { ...o, isActive } : o,
              ),
            },
      ),
    );
    if (selectedGroup?.id === groupId) {
      setSelectedGroup((prev) =>
        prev
          ? {
              ...prev,
              options: (prev.options ?? []).map((o) =>
                o.id === optionId ? { ...o, isActive } : o,
              ),
            }
          : null,
      );
    }
  }

  return {
    groups,
    selectedGroup,
    isLoading,
    isDetailLoading,
    isSaving,
    error,
    loadGroups,
    openGroupDetail,
    closeGroupDetail,
    createGroup,
    updateGroup,
    deleteGroup,
    toggleGroupStatus,
    createOption,
    updateOption,
    deleteOption,
    toggleOptionStatus,
  };
}
