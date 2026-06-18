import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getCustomerMeRequest,
  getMyDefaultAddressRequest,
  updateMeRequest,
  updateMyPasswordRequest,
  upsertMyDefaultAddressRequest,
} from '@/services/profile.service';
import { getDeliveryZonesRequest } from '@/services/delivery-zones.service';
import type {
  CustomerDefaultAddress,
  CustomerMe,
  ProfileFormData,
  UpdateMyPasswordPayload,
} from '@/types/profile.types';
import type { DeliveryZone } from '@/types/delivery-zone.types';

function getApiError(error: unknown): string {
  const e = error as { response?: { data?: { message?: unknown; error?: string } } };
  const data = e?.response?.data;
  if (Array.isArray(data?.message)) return (data.message as string[]).join(', ');
  if (typeof data?.message === 'string') return data.message;
  if (typeof data?.error === 'string') return data.error;
  return 'Não foi possível concluir a operação. Tente novamente.';
}

const emptyForm: ProfileFormData = {
  fullName: '',
  phone: '',
  deliveryZoneId: '',
  street: '',
  number: '',
  complement: '',
  referencePoint: '',
};

export function useCustomerProfile() {
  const [me, setMe] = useState<CustomerMe | null>(null);
  const [address, setAddress] = useState<CustomerDefaultAddress | null>(null);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [form, setForm] = useState<ProfileFormData>(emptyForm);

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const availableDeliveryZones = useMemo(
    () =>
      deliveryZones
        .filter((z) => z.isAvailable)
        .sort((a, b) =>
          a.neighborhood.localeCompare(b.neighborhood, 'pt-BR', { sensitivity: 'base' }),
        ),
    [deliveryZones],
  );

  const selectedDeliveryZone = useMemo(
    () => availableDeliveryZones.find((z) => z.id === form.deliveryZoneId),
    [availableDeliveryZones, form.deliveryZoneId],
  );

  const hydrateForm = useCallback(
    (currentMe: CustomerMe | null, currentAddress: CustomerDefaultAddress | null) => {
      setForm({
        fullName: currentMe?.name ?? '',
        phone: currentMe?.phone ?? '',
        deliveryZoneId: currentAddress?.deliveryZoneId ?? '',
        street: currentAddress?.street ?? '',
        number: currentAddress?.number ?? '',
        complement: currentAddress?.complement ?? '',
        referencePoint: currentAddress?.referencePoint ?? '',
      });
    },
    [],
  );

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [meResult, addressResult, zonesResult] = await Promise.allSettled([
        getCustomerMeRequest(),
        getMyDefaultAddressRequest(),
        getDeliveryZonesRequest(),
      ]);

      const meData = meResult.status === 'fulfilled' ? meResult.value : null;
      const addrData = addressResult.status === 'fulfilled' ? addressResult.value : null;
      const zonesData = zonesResult.status === 'fulfilled' ? zonesResult.value : [];

      setMe(meData);
      setAddress(addrData);
      setDeliveryZones(zonesData);
      hydrateForm(meData, addrData);
    } catch (error) {
      setErrorMessage(getApiError(error));
    } finally {
      setIsLoading(false);
    }
  }, [hydrateForm]);

  const updateFormField = useCallback(
    <K extends keyof ProfileFormData>(field: K, value: ProfileFormData[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      // Clear messages when user starts editing
      setErrorMessage(null);
      setSuccessMessage(null);
    },
    [],
  );

  const savePersonalData = useCallback(async () => {
    setIsSavingProfile(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const updated = await updateMeRequest({
        name: form.fullName.trim(),
        phone: form.phone.trim(),
      });
      setMe(updated);
      setSuccessMessage('Dados pessoais atualizados com sucesso.');
    } catch (error) {
      setErrorMessage(getApiError(error));
    } finally {
      setIsSavingProfile(false);
    }
  }, [form.fullName, form.phone]);

  const saveAddress = useCallback(async () => {
    setIsSavingAddress(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      if (!form.deliveryZoneId) {
        setErrorMessage('Selecione o bairro de entrega.');
        return;
      }
      if (!form.street.trim()) {
        setErrorMessage('Informe a rua ou avenida.');
        return;
      }
      if (!form.number.trim()) {
        setErrorMessage('Informe o número.');
        return;
      }
      const updated = await upsertMyDefaultAddressRequest({
        deliveryZoneId: form.deliveryZoneId,
        street: form.street.trim(),
        number: form.number.trim(),
        complement: form.complement.trim() || null,
        referencePoint: form.referencePoint.trim() || null,
      });
      setAddress(updated);
      setSuccessMessage('Endereço atualizado com sucesso.');
    } catch (error) {
      setErrorMessage(getApiError(error));
    } finally {
      setIsSavingAddress(false);
    }
  }, [form]);

  const changePassword = useCallback(async (payload: UpdateMyPasswordPayload) => {
    setIsChangingPassword(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await updateMyPasswordRequest(payload);
      setSuccessMessage('Senha alterada com sucesso.');
    } catch (error) {
      setErrorMessage(getApiError(error));
    } finally {
      setIsChangingPassword(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  return {
    me,
    address,
    availableDeliveryZones,
    selectedDeliveryZone,
    form,
    updateFormField,

    isLoading,
    isSavingProfile,
    isSavingAddress,
    isChangingPassword,

    errorMessage,
    successMessage,

    loadProfile,
    savePersonalData,
    saveAddress,
    changePassword,
  };
}
