import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDeliveryZonesRequest } from '@/services/delivery-zones.service';
import { getCurrentStoreRequest } from '@/services/store.service';
import { createOrderRequest } from '@/services/orders.service';
import { createPixPaymentRequest } from '@/services/payments.service';
import {
  getMyDefaultAddressRequest,
  updateMeRequest,
  upsertMyDefaultAddressRequest,
} from '@/services/profile.service';
import { useLocationStore } from '@/store/location.store';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import type { DeliveryZone } from '@/types/delivery-zone.types';
import type { Store } from '@/types/store.types';
import type {
  Order,
  PaymentMethod,
  CreateOrderItem,
  CreateOrderPayload,
  PixPaymentData,
} from '@/types/order.types';

export type CheckoutStep =
  | 'CONFIRM_LOCATION'
  | 'LOCATION_REQUIRED'
  | 'LOCATION_NOT_SERVED'
  | 'CONFIRM_DELIVERY'
  | 'DELIVERY_INFO'
  | 'SAVE_TO_PROFILE'
  | 'PAYMENT_METHOD'
  | 'CHANGE_FOR'
  | 'PIX_PENDING'
  | 'ORDER_SUCCESS';

function getApiErrorMessage(err: unknown): string {
  const e = err as { response?: { data?: { message?: string | string[]; error?: string } } };
  const data = e?.response?.data;
  if (Array.isArray(data?.message)) return data.message.join('; ');
  if (typeof data?.message === 'string') return data.message;
  if (typeof data?.error === 'string') return data.error;
  return 'Não foi possível processar o pedido. Verifique os dados e tente novamente.';
}

// Shape of the profile data loaded at checkout open (for change detection)
type ProfileSnapshot = {
  name: string;
  phone: string;
  deliveryZoneId: string;
  street: string;
  number: string;
  complement: string;
  referencePoint: string;
};

export function useCheckout(onClose: () => void, promotionalTotal: number) {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const selectedDeliveryZone = useLocationStore((s) => s.selectedDeliveryZone);
  const setDeliveryZone = useLocationStore((s) => s.setDeliveryZone);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [step, setStep] = useState<CheckoutStep>(() =>
    selectedDeliveryZone ? 'CONFIRM_LOCATION' : 'LOCATION_REQUIRED',
  );

  // Delivery zones & store
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [store, setStore] = useState<Store | null>(null);
  const [isLoadingZones, setIsLoadingZones] = useState(false);
  const [zoneError, setZoneError] = useState<string | null>(null);
  const [pendingZoneId, setPendingZoneId] = useState<string>(
    selectedDeliveryZone?.id ?? '',
  );

  // Pickup flag
  const [isPickup, setIsPickup] = useState(false);

  // Profile snapshot loaded on mount (for "did user change anything?" check)
  const [profileSnapshot, setProfileSnapshot] = useState<ProfileSnapshot | null>(null);

  // Delivery info form
  const [customerFullName, setCustomerFullName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [addressComplement, setAddressComplement] = useState('');
  const [addressReference, setAddressReference] = useState('');
  const [deliveryInfoErrors, setDeliveryInfoErrors] = useState<Record<string, string>>({});

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [needsChange, setNeedsChange] = useState<boolean | null>(null);
  const [changeForAmount, setChangeForAmount] = useState<string>('');
  const [changeError, setChangeError] = useState<string | null>(null);

  // Order
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // PIX
  const [pixPayment, setPixPayment] = useState<PixPaymentData | null>(null);
  const [isLoadingPix, setIsLoadingPix] = useState(false);

  // Save-to-profile state
  const [isSavingToProfile, setIsSavingToProfile] = useState(false);

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    setIsLoadingZones(true);
    setZoneError(null);
    try {
      const [zonesResult, storeResult, addressResult] = await Promise.allSettled([
        getDeliveryZonesRequest(),
        getCurrentStoreRequest(),
        isAuthenticated ? getMyDefaultAddressRequest() : Promise.resolve(null),
      ]);

      let zones: DeliveryZone[] = [];
      if (zonesResult.status === 'fulfilled') {
        zones = zonesResult.value.filter((z) => z.isAvailable);
        setDeliveryZones(zones);
      } else {
        setZoneError('Erro ao carregar bairros. Tente novamente.');
      }

      if (storeResult.status === 'fulfilled') {
        setStore(storeResult.value);
      }

      // Pre-fill from auth user
      const name = user?.name ?? '';
      const phone = user?.phone ?? '';
      setCustomerFullName(name);
      setCustomerPhone(phone);

      // Pre-fill from saved profile address
      if (addressResult.status === 'fulfilled' && addressResult.value) {
        const addr = addressResult.value;
        const street = addr.street ?? '';
        const number = addr.number ?? '';
        const complement = addr.complement ?? '';
        const referencePoint = addr.referencePoint ?? '';
        const zoneId = addr.deliveryZoneId ?? '';

        setAddressStreet(street);
        setAddressNumber(number);
        setAddressComplement(complement);
        setAddressReference(referencePoint);

        // Save snapshot for change detection
        setProfileSnapshot({ name, phone, deliveryZoneId: zoneId, street, number, complement, referencePoint });

        // Pre-fill zone if location store has none
        if (!selectedDeliveryZone && zoneId) {
          const zone = zones.find((z) => z.id === zoneId);
          if (zone) {
            setDeliveryZone(zone);
            setPendingZoneId(zone.id);
            // Upgrade step to CONFIRM_LOCATION since we now have a zone
            setStep('CONFIRM_LOCATION');
          }
        }
      } else {
        // No saved address — just snapshot the user fields
        setProfileSnapshot({ name, phone, deliveryZoneId: '', street: '', number: '', complement: '', referencePoint: '' });
      }
    } finally {
      setIsLoadingZones(false);
    }
  }

  // True when ALL required delivery fields are already filled (profile data loaded)
  function computeHasCompleteAddress(zoneId: string): boolean {
    return Boolean(
      customerFullName.trim() &&
      customerPhone.trim() &&
      zoneId &&
      addressStreet.trim() &&
      addressNumber.trim(),
    );
  }

  // Determine if the user changed anything compared to what was in the profile
  function computeProfileDataChanged(confirmedZoneId: string): boolean {
    if (!isAuthenticated || !profileSnapshot) return false;
    return (
      customerFullName.trim() !== profileSnapshot.name ||
      customerPhone.trim() !== profileSnapshot.phone ||
      confirmedZoneId !== profileSnapshot.deliveryZoneId ||
      addressStreet.trim() !== profileSnapshot.street ||
      addressNumber.trim() !== profileSnapshot.number ||
      addressComplement.trim() !== profileSnapshot.complement ||
      addressReference.trim() !== profileSnapshot.referencePoint
    );
  }

  function goToPayment() {
    // Called from CONFIRM_LOCATION "Continuar"
    setOrderError(null);
    setDeliveryInfoErrors({});
    const zoneId = selectedDeliveryZone?.id ?? '';
    if (computeHasCompleteAddress(zoneId)) {
      setStep('CONFIRM_DELIVERY');
    } else {
      setStep('DELIVERY_INFO');
    }
  }

  function goToZoneSelection() {
    setPendingZoneId(selectedDeliveryZone?.id ?? '');
    setStep('LOCATION_REQUIRED');
  }

  function handleNotServed() {
    setStep('LOCATION_NOT_SERVED');
  }

  function confirmZone() {
    const zone = deliveryZones.find((z) => z.id === pendingZoneId);
    if (!zone) return;
    setDeliveryZone(zone);
    setOrderError(null);
    setDeliveryInfoErrors({});
    if (computeHasCompleteAddress(zone.id)) {
      setStep('CONFIRM_DELIVERY');
    } else {
      setStep('DELIVERY_INFO');
    }
  }

  function selectPickup() {
    setIsPickup(true);
    setOrderError(null);
    setStep('PAYMENT_METHOD');
  }

  // From CONFIRM_DELIVERY → "Confirmar e continuar" (no changes made)
  function confirmDeliveryAddress() {
    setOrderError(null);
    setStep('PAYMENT_METHOD');
  }

  // From CONFIRM_DELIVERY → "Alterar dados"
  function goToEditDeliveryInfo() {
    setDeliveryInfoErrors({});
    setStep('DELIVERY_INFO');
  }

  function goBackFromDeliveryInfo() {
    setDeliveryInfoErrors({});
    if (selectedDeliveryZone) {
      if (computeHasCompleteAddress(selectedDeliveryZone.id) && profileSnapshot) {
        setStep('CONFIRM_DELIVERY');
      } else {
        setStep('CONFIRM_LOCATION');
      }
    } else {
      setStep('LOCATION_REQUIRED');
    }
  }

  function confirmDeliveryInfo() {
    const errors: Record<string, string> = {};
    if (!customerFullName.trim()) errors.fullName = 'Nome é obrigatório.';
    if (!customerPhone.trim()) errors.phone = 'Telefone é obrigatório.';
    if (!addressStreet.trim()) errors.street = 'Rua / Avenida é obrigatória.';
    if (!addressNumber.trim()) errors.number = 'Número é obrigatório.';
    setDeliveryInfoErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setOrderError(null);

    const zoneId = selectedDeliveryZone?.id ?? pendingZoneId;
    // Prompt to save only when authenticated and data differs from profile
    if (isAuthenticated && computeProfileDataChanged(zoneId)) {
      setStep('SAVE_TO_PROFILE');
    } else {
      setStep('PAYMENT_METHOD');
    }
  }

  async function saveToProfileAndContinue() {
    setIsSavingToProfile(true);
    try {
      await Promise.allSettled([
        updateMeRequest({ name: customerFullName.trim(), phone: customerPhone.trim() }),
        selectedDeliveryZone
          ? upsertMyDefaultAddressRequest({
              deliveryZoneId: selectedDeliveryZone.id,
              street: addressStreet.trim(),
              number: addressNumber.trim(),
              complement: addressComplement.trim() || null,
              referencePoint: addressReference.trim() || null,
            })
          : Promise.resolve(),
      ]);
    } catch {
      // Non-critical — don't block the order if save fails
    } finally {
      setIsSavingToProfile(false);
      setStep('PAYMENT_METHOD');
    }
  }

  function skipSaveToProfile() {
    setStep('PAYMENT_METHOD');
  }

  function getFinalTotal(): number {
    if (isPickup) return Number(promotionalTotal) || 0;
    const fee = Number(selectedDeliveryZone?.deliveryFee ?? 0);
    return (Number(promotionalTotal) || 0) + fee;
  }

  async function handlePaymentSelect(method: PaymentMethod) {
    setPaymentMethod(method);
    if (method === 'CASH_ON_DELIVERY') {
      setNeedsChange(null);
      setChangeForAmount('');
      setChangeError(null);
      setStep('CHANGE_FOR');
    } else {
      await submitOrder(method, null);
    }
  }

  async function handleChangeSubmit() {
    setChangeError(null);

    if (needsChange === null) {
      setChangeError('Selecione uma opção de troco.');
      return;
    }

    let changeVal: number | null = null;
    if (needsChange) {
      const raw = parseFloat(String(changeForAmount).replace(',', '.'));
      if (!changeForAmount || isNaN(raw) || raw <= 0) {
        setChangeError('Informe um valor válido para o troco.');
        return;
      }
      const total = getFinalTotal();
      if (raw <= total) {
        setChangeError(
          `O valor deve ser maior que o total do pedido (R$ ${total.toFixed(2).replace('.', ',')}).`,
        );
        return;
      }
      changeVal = raw;
    }

    await submitOrder('CASH_ON_DELIVERY', changeVal);
  }

  async function submitOrder(method: PaymentMethod, change: number | null) {
    if (items.length === 0) return;

    if (isPickup) {
      if (!customerFullName.trim() || !customerPhone.trim()) {
        setOrderError('Nome e telefone são obrigatórios para retirada na loja.');
        return;
      }
    } else {
      const zone = selectedDeliveryZone;
      if (!zone) {
        setOrderError('Selecione seu bairro para continuar.');
        return;
      }
      if (
        !customerFullName.trim() ||
        !customerPhone.trim() ||
        !addressStreet.trim() ||
        !addressNumber.trim()
      ) {
        setOrderError('Preencha todos os dados de entrega antes de continuar.');
        setStep('DELIVERY_INFO');
        return;
      }
    }

    setIsSubmitting(true);
    setOrderError(null);

    const orderItems: CreateOrderItem[] = items.map((item) => ({
      productId: item.productId,
      ...(item.variantId ? { variantId: item.variantId } : {}),
      quantity: item.quantity,
      ...(item.selectedOptions?.length
        ? { optionIds: item.selectedOptions.map((o) => o.optionId) }
        : {}),
      ...(item.notes ? { notes: item.notes } : {}),
    }));

    const payload: CreateOrderPayload = {
      customer: {
        fullName: customerFullName.trim(),
        phone: customerPhone.trim(),
        ...(isAuthenticated && user?.email ? { email: user.email } : {}),
      },
      items: orderItems,
      paymentMethod: method,
      ...(change !== null ? { changeForAmount: change } : {}),
      ...(isPickup
        ? { deliveryZoneId: null }
        : {
            address: {
              street: addressStreet.trim(),
              number: addressNumber.trim(),
              ...(addressComplement.trim() ? { complement: addressComplement.trim() } : {}),
              ...(addressReference.trim() ? { referencePoint: addressReference.trim() } : {}),
            },
            deliveryZoneId: selectedDeliveryZone!.id,
          }),
    };

    try {
      const order = await createOrderRequest(payload);
      setCreatedOrder(order);

      if (method === 'PIX') {
        setStep('PIX_PENDING');
        setIsLoadingPix(true);
        try {
          const pix = await createPixPaymentRequest(order.id);
          setPixPayment(pix);
        } catch {
          setPixPayment(null);
        } finally {
          setIsLoadingPix(false);
        }
      } else {
        setStep('ORDER_SUCCESS');
      }
    } catch (err: unknown) {
      setOrderError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSuccessClose() {
    clearCart();
    onClose();
    navigate('/orders');
  }

  return {
    step,
    setStep,
    deliveryZones,
    store,
    isLoadingZones,
    isSubmitting,
    zoneError,
    orderError,
    pendingZoneId,
    setPendingZoneId,
    paymentMethod,
    needsChange,
    setNeedsChange,
    changeForAmount,
    setChangeForAmount,
    changeError,
    createdOrder,
    isPickup,

    // Delivery info
    customerFullName,
    setCustomerFullName,
    customerPhone,
    setCustomerPhone,
    addressStreet,
    setAddressStreet,
    addressNumber,
    setAddressNumber,
    addressComplement,
    setAddressComplement,
    addressReference,
    setAddressReference,
    deliveryInfoErrors,
    isAuthenticated,

    // Save-to-profile
    isSavingToProfile,

    // PIX
    pixPayment,
    isLoadingPix,

    // Actions
    loadData,
    goToPayment,
    goToZoneSelection,
    handleNotServed,
    confirmZone,
    selectPickup,
    confirmDeliveryAddress,
    goToEditDeliveryInfo,
    goBackFromDeliveryInfo,
    confirmDeliveryInfo,
    saveToProfileAndContinue,
    skipSaveToProfile,
    handlePaymentSelect,
    handleChangeSubmit,
    handleSuccessClose,
    getFinalTotal,
  };
}
