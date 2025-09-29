
export interface Payment {
  id: string;
  reservation_id: string;
  type: 'caution' | 'monthly';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  fedapay_transaction_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentDTO {
  reservation_id: string;
  type: Payment['type'];
  amount: number;
}

export const paymentService = {
  // Créer un nouveau paiement
  async createPayment(data: CreatePaymentDTO): Promise<Payment> {
    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        ...data,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return payment;
  },

  // Mettre à jour le statut d'un paiement
  async updatePaymentStatus(
    paymentId: string,
    status: Payment['status'],
    fedapayTransactionId?: string
  ): Promise<Payment> {
    const { data: payment, error } = await supabase
      .from('payments')
      .update({
        status,
        ...(fedapayTransactionId && { fedapay_transaction_id: fedapayTransactionId })
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw error;
    return payment;
  },

  // Obtenir les paiements d'une réservation
  async getReservationPayments(reservationId: string): Promise<Payment[]> {
    const { data: payments, error } = await supabase
      .from('payments')
      .select()
      .eq('reservation_id', reservationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return payments;
  },

  // Vérifier si la caution a été payée pour une réservation
  async hasPaidCaution(reservationId: string): Promise<boolean> {
    const { data: payment, error } = await supabase
      .from('payments')
      .select()
      .eq('reservation_id', reservationId)
      .eq('type', 'caution')
      .eq('status', 'completed')
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!payment;
  },

  // Calculer le montant de la caution (2x le loyer mensuel)
  calculateCautionAmount(monthlyPrice: number): number {
    return monthlyPrice * 2;
  }
}; 