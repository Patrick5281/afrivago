
export interface FedaPayTransaction {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'failed';
  customer: {
    id: string;
    email: string;
    firstname: string;
    lastname: string;
  };
  payment_method: {
    type: string;
    details: any;
  };
}

export const fedapayService = {
  // Initialiser un paiement
  async initializePayment(amount: number, customer: any): Promise<FedaPayTransaction> {
    const response = await fetch('/api/payments/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, customer }),
    });
    if (!response.ok) throw new Error('Erreur lors de l\'initialisation du paiement');
    return response.json();
  },

  // Vérifier le statut d'un paiement
  async checkPaymentStatus(transactionId: string): Promise<FedaPayTransaction> {
    const response = await fetch(`/api/payments/status/${transactionId}`);

    if (!response.ok) {
      throw new Error('Erreur lors de la vérification du statut du paiement');
    }

    return response.json();
  },
}; 