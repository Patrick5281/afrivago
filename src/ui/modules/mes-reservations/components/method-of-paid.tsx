import React from "react";
import { Typography } from "@/ui/design-system/typography/typography";
import { Button } from "@/ui/design-system/button/button";
import { useKkiapayPayment } from "./useKkiapayPayment";

interface MethodOfPaidProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  email: string;
  phone: string;
  onSuccess: (response: any) => void;
  onFailure?: (error: any) => void;
}

export const MethodOfPaidModal: React.FC<MethodOfPaidProps> = ({
  open,
  onClose,
  amount,
  email,
  phone,
  onSuccess,
  onFailure,
}) => {
  const { open: openKkiapay } = useKkiapayPayment({ amount, email, phone, onSuccess, onFailure });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-gray-300 rounded shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray hover:text-gray-600"
          onClick={onClose}
          aria-label="Fermer"
        >
          ×
        </button>
        <Typography variant="lead" className="mb-4 text-center">
          Choisissez votre méthode de paiement
        </Typography>
        <div className="flex flex-col gap-4">
          <Button
          variant="secondary"
            action={openKkiapay}
          >
            Payer avec Kkiapay
          </Button>
          <Button
            size="small"
            action={onClose}
            variant="danger"
            
          >
            Annuler
          </Button>
        </div>
      </div>
    </div>
  );
};
