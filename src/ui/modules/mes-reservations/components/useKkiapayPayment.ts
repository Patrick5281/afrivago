"use client";
import { useKKiaPay } from "kkiapay-react";
import { useCallback, useEffect } from "react";

interface UseKkiapayPaymentProps {
  amount: number;
  email: string;
  phone: string;
  onSuccess: (response: any) => void;
  onFailure?: (error: any) => void;
}

export function useKkiapayPayment({ amount, email, phone, onSuccess, onFailure }: UseKkiapayPaymentProps) {
  const { openKkiapayWidget, addKkiapayListener, removeKkiapayListener } = useKKiaPay();

  const open = useCallback(() => {
    console.log('[KKIAPAY] Tentative d\'ouverture du widget', {
      amount,
      api_key: process.env.NEXT_PUBLIC_KKIAPAY_API_KEY,
      email,
      phone,
    });
    try {
      openKkiapayWidget({
        amount,
        api_key: process.env.NEXT_PUBLIC_KKIAPAY_API_KEY!,
        sandbox: true,
        email,
        phone,
      });
      console.log('[KKIAPAY] Widget ouvert (si aucune erreur JS)');
    } catch (e) {
      console.error('[KKIAPAY] Erreur lors de l\'ouverture du widget', e);
    }
  }, [amount, email, phone, openKkiapayWidget]);

  useEffect(() => {
    const successLogger = (response: any) => {
      console.log('[KKIAPAY] Paiement succès', response);
      onSuccess(response);
    };
    const failureLogger = (error: any) => {
      console.log('[KKIAPAY] Paiement échec', error);
      if (onFailure) onFailure(error);
    };
    addKkiapayListener("success", successLogger);
    if (onFailure) addKkiapayListener("failed", failureLogger);
    return () => {
      removeKkiapayListener("success", successLogger);
      if (onFailure) removeKkiapayListener("failed", failureLogger);
    };
  }, [addKkiapayListener, removeKkiapayListener, onSuccess, onFailure]);

  return { open };
} 