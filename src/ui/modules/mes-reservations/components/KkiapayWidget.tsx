import React, { useCallback, useEffect } from 'react';
import { useKKiaPay } from 'kkiapay-react';

interface KkiapayWidgetProps {
  amount: number;
  email: string;
  phone: string;
  open: boolean;
  onSuccess: (response: any) => void;
  onFailure?: (error: any) => void;
  onClose: () => void;
}

const KkiapayWidget: React.FC<KkiapayWidgetProps> = ({ amount, email, phone, open, onSuccess, onFailure, onClose }) => {
  const { openKkiapayWidget, addKkiapayListener, removeKkiapayListener } = useKKiaPay();

  const handleOpen = useCallback(() => {
    openKkiapayWidget({
      amount,
      api_key: process.env.NEXT_PUBLIC_KKIAPAY_API_KEY!,
      sandbox: true,
      email,
      phone,
    });
  }, [amount, email, phone, openKkiapayWidget]);

  useEffect(() => {
    const successLogger = (response: any) => {
      onSuccess(response);
      onClose();
    };
    const failureLogger = (error: any) => {
      if (onFailure) onFailure(error);
      onClose();
    };
    addKkiapayListener('success', successLogger);
    if (onFailure) addKkiapayListener('failed', failureLogger);
    return () => {
      removeKkiapayListener('success', successLogger);
      if (onFailure) removeKkiapayListener('failed', failureLogger);
    };
  }, [addKkiapayListener, removeKkiapayListener, onSuccess, onFailure, onClose]);

  useEffect(() => {
    if (open) {
      handleOpen();
    }
  }, [open, handleOpen]);

  return null; // Ce composant n'affiche rien, il gère juste le widget Kkiapay
};

export default KkiapayWidget; 