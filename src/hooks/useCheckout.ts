import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PICKUP_DELIVERY_ZONE_ID } from '@/constants/pickup.constants';

// Re-exportado para o modal — agora é o UUID real da zona de retirada
export const PICKUP_ZONE_ID = PICKUP_DELIVERY_ZONE_ID;
import { getDeliveryZonesRequest } from '@/services/delivery-zones.service';
import { getCurrentStoreRequest } from '@/services/store.service';
import { createOrderRequest } from '@/services/orders.service';
import {
  createPixPaymentRequest,
  getPaymentByOrderIdRequest,
} from '@/services/payments.service';
import {
  getMyDefaultAddressRequest,
  updateMeRequest,
  upsertMyDefaultAddressRequest,
} from '@/services/profile.service';
import { useLocationStore } from '@/store/location.store';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { normalizePixPayload, EMPTY_PIX } from '@/utils/pix';
import type { NormalizedPixPayload } from '@/utils/pix';
import type { DeliveryZone } from '@/types/delivery-zone.types';
import type { Store } from '@/types/store.types';
import type {
  Order,
  PaymentMethod,
  CreateOrderItem,
  CreateOrderPayload,
} from '@/types/order.types';

const MAX_PIX_ATTEMPTS = 10;
const PIX_RETRY_INTERVAL_MS = 1500;

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

  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [store, setStore] = useState<Store | null>(null);
  const [isLoadingZones, setIsLoadingZones] = useState(false);
  const [zoneError, setZoneError] = useState<string | null>(null);
  const [pendingZoneId, setPendingZoneId] = useState<string>(
    selectedDeliveryZone?.id ?? '',
  );

  const [isPickup, setIsPickup] = useState(false);

  const [profileSnapshot, setProfileSnapshot] = useState<ProfileSnapshot | null>(null);

  const [customerFullName, setCustomerFullName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [addressComplement, setAddressComplement] = useState('');
  const [addressReference, setAddressReference] = useState('');
  const [deliveryInfoErrors, setDeliveryInfoErrors] = useState<Record<string, string>>({});

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [needsChange, setNeedsChange] = useState<boolean | null>(null);
  const [changeForAmount, setChangeForAmount] = useState<string>('');
  const [changeError, setChangeError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // PIX — uses normalized payload
  const [pixData, setPixData] = useState<NormalizedPixPayload>(EMPTY_PIX);
  const [isLoadingPix, setIsLoadingPix] = useState(false);
  const [pixError, setPixError] = useState<string | null>(null);

  const [isSavingToProfile, setIsSavingToProfile] = useState(false);

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // PIX polling: runs when we have an order ID, no code yet, and we're on the PIX step
  useEffect(() => {
    const orderId = createdOrder?.id;
    if (!orderId || pixData.copyPasteCode || step !== 'PIX_PENDING') return;

    let cancelled = false;
    let attempts = 0;
    let timeoutId: number | undefined;

    async function poll() {
      if (cancelled) return;
      attempts += 1;

      try {
        const payment = await getPaymentByOrderIdRequest(orderId as string);
        const normalized = normalizePixPayload(payment);
        if (normalized.copyPasteCode) {
          if (!cancelled) {
            setPixData(normalized);
            setIsLoadingPix(false);
          }
          return;
        }
      } catch {
        // ignora erros transientes, tenta novamente
      }

      if (cancelled) return;

      if (attempts < MAX_PIX_ATTEMPTS) {
        timeoutId = window.setTimeout(poll, PIX_RETRY_INTERVAL_MS);
      } else {
        setIsLoadingPix(false);
        setPixError('Não conseguimos carregar o PIX automaticamente.');
      }
    }

    void poll();

    return () => {
      cancelled = true;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [createdOrder?.id, step, pixData.copyPasteCode]);

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
        zones = zonesResult.value
          .filter((z) => z.isAvailable)
          .filter((z) => z.id !== PICKUP_DELIVERY_ZONE_ID);
        setDeliveryZones(zones);
      } else {
        setZoneError('Erro ao carregar bairros. Tente novamente.');
      }

      if (storeResult.status === 'fulfilled') {
        setStore(storeResult.value);
      }

      const name = user?.fullName ?? '';
      const phone = user?.phone ?? '';
      setCustomerFullName(name);
      setCustomerPhone(phone);

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

        setProfileSnapshot({ name, phone, deliveryZoneId: zoneId, street, number, complement, referencePoint });

        if (!selectedDeliveryZone && zoneId) {
          const zone = zones.find((z) => z.id === zoneId);
          if (zone) {
            setDeliveryZone(zone);
            setPendingZoneId(zone.id);
            setStep('CONFIRM_LOCATION');
          }
        }
      } else {
        setProfileSnapshot({ name, phone, deliveryZoneId: '', street: '', number: '', complement: '', referencePoint: '' });
      }
    } finally {
      setIsLoadingZones(false);
    }
  }

  function computeHasCompleteAddress(zoneId: string): boolean {
    return Boolean(
      customerFullName.trim() &&
      customerPhone.trim() &&
      zoneId &&
      addressStreet.trim() &&
      addressNumber.trim(),
    );
  }

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
    // Retirada na loja: trata como pickup sem zona real
    if (pendingZoneId === PICKUP_ZONE_ID) {
      selectPickup();
      return;
    }
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
    setDeliveryInfoErrors({});
    // Se nome ou telefone não estiverem preenchidos, coleta antes de ir ao pagamento
    if (!customerFullName.trim() || !customerPhone.trim()) {
      setStep('DELIVERY_INFO');
    } else {
      setStep('PAYMENT_METHOD');
    }
  }

  function confirmDeliveryAddress() {
    setOrderError(null);
    setStep('PAYMENT_METHOD');
  }

  function goToEditDeliveryInfo() {
    setDeliveryInfoErrors({});
    setStep('DELIVERY_INFO');
  }

  function goBackFromDeliveryInfo() {
    setDeliveryInfoErrors({});
    // Garante que pendingZoneId está sincronizado com o store ao sair do form
    setPendingZoneId(selectedDeliveryZone?.id ?? '');
    if (isPickup) {
      // Voltando da coleta de dados de retirada → desfaz pickup e retorna à origem
      setIsPickup(false);
      if (selectedDeliveryZone) {
        setStep('CONFIRM_LOCATION');
      } else {
        setStep('LOCATION_REQUIRED');
      }
      return;
    }
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

    if (!isPickup) {
      // Bairro é obrigatório para entrega — pode ter sido selecionado neste form
      const effectiveZoneId = pendingZoneId || selectedDeliveryZone?.id || '';
      if (!effectiveZoneId) errors.deliveryZoneId = 'Selecione seu bairro.';
      if (!addressStreet.trim()) errors.street = 'Rua / Avenida é obrigatória.';
      if (!addressNumber.trim()) errors.number = 'Número é obrigatório.';
    }

    setDeliveryInfoErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setOrderError(null);

    if (isPickup) {
      setStep('PAYMENT_METHOD');
      return;
    }

    // Persiste bairro se o cliente o alterou neste form
    const effectiveZoneId = pendingZoneId || selectedDeliveryZone?.id || '';
    if (effectiveZoneId && effectiveZoneId !== selectedDeliveryZone?.id) {
      const zone = deliveryZones.find((z) => z.id === effectiveZoneId);
      if (zone) setDeliveryZone(zone);
    }

    const finalZoneId = effectiveZoneId;
    if (isAuthenticated && computeProfileDataChanged(finalZoneId)) {
      setStep('SAVE_TO_PROFILE');
    } else {
      setStep('PAYMENT_METHOD');
    }
  }

  async function saveToProfileAndContinue() {
    setIsSavingToProfile(true);
    try {
      await Promise.allSettled([
        updateMeRequest({ fullName: customerFullName.trim(), phone: customerPhone.trim() }),
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
      // Non-critical
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
        ? { deliveryZoneId: PICKUP_DELIVERY_ZONE_ID }
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
      clearCart(); // Limpa o carrinho ao criar o pedido com sucesso

      if (method === 'PIX') {
        const initialPix = normalizePixPayload(order);

        if (initialPix.copyPasteCode) {
          setPixData(initialPix);
          setIsLoadingPix(false);
          setPixError(null);
          setStep('PIX_PENDING');
          return;
        }

        // Reset PIX state and enter loading mode
        setPixData(EMPTY_PIX);
        setPixError(null);
        setIsLoadingPix(true);
        setStep('PIX_PENDING');

        // Try POST first — if it returns a code immediately, use it
        try {
          const pix = await createPixPaymentRequest(order.id);
          const normalized = normalizePixPayload(pix);
          if (normalized.copyPasteCode) {
            setPixData(normalized);
            setIsLoadingPix(false);
          }
          // If no code, polling effect will kick in (triggered by createdOrder.id + step change)
        } catch {
          // POST falhou — polling vai tentar via GET
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

  function retryPix() {
    setPixError(null);
    setPixData(EMPTY_PIX);
    setIsLoadingPix(true);
    // Resetting pixData.copyPasteCode to '' causes the polling effect to re-run
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

    isSavingToProfile,

    // PIX
    pixData,
    isLoadingPix,
    pixError,
    retryPix,

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
