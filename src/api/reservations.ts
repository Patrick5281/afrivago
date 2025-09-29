export interface Reservation {
  id: string;
  user_id: string;
  property_id?: string;
  rental_unit_id?: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'validated' | 'cancelled' | 'expired';
  caution_paid: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateReservationDTO {
  property_id?: string;
  rental_unit_id?: string;
  start_date: string;
  end_date: string;
}

export interface ReservationWithDetails extends Reservation {
  property?: {
    title: string;
    monthly_price: number;
  };
  rental_unit?: {
    name: string;
    price_per_month: number;
  };
}

export const reservationService = {
  // Créer une nouvelle réservation
  async createReservation(data: CreateReservationDTO): Promise<Reservation> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Utilisateur non authentifié');

    const { data: reservation, error } = await supabase
      .from('reservations')
      .insert({
        user_id: user.user.id,
        ...data,
        status: 'pending',
        caution_paid: false
      })
      .select()
      .single();

    if (error) throw error;
    return reservation;
  },

  // Obtenir les réservations d'un utilisateur via l'API locale
  async getUserReservations(userId: string): Promise<ReservationWithDetails[]> {
    const response = await fetch(`/api/reservation?userId=${userId}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erreur lors de la récupération des réservations");
    }
    const data = await response.json();
    return data.reservations || [];
  },

  // Vérifier la disponibilité d'une période
  async checkAvailability(
    propertyId: string | undefined,
    rentalUnitId: string | undefined,
    startDate: string,
    endDate: string
  ): Promise<boolean> {
    const { data, error } = await supabase
      .rpc('check_availability', {
        p_property_id: propertyId,
        p_rental_unit_id: rentalUnitId,
        p_start_date: startDate,
        p_end_date: endDate
      });

    if (error) throw error;
    return data;
  },

  // Mettre à jour le statut d'une réservation
  async updateReservationStatus(
    reservationId: string,
    status: Reservation['status']
  ): Promise<Reservation> {
    const { data: reservation, error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', reservationId)
      .select()
      .single();

    if (error) throw error;
    return reservation;
  },

  // Obtenir les réservations en attente pour une propriété/unité
  async getPendingReservations(
    propertyId: string | undefined,
    rentalUnitId: string | undefined
  ): Promise<Reservation[]> {
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select()
      .eq('status', 'pending')
      .eq(propertyId ? 'property_id' : 'rental_unit_id', propertyId || rentalUnitId);

    if (error) throw error;
    return reservations;
  },

  /**
   * Valide une réservation et annule les autres en attente pour la même période/logement
   */
  async validateAndCancelOthers(reservationId: string): Promise<void> {
    // 1. Récupérer la réservation à valider
    const { data: reservation, error: fetchError } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', reservationId)
      .single();
    if (fetchError || !reservation) throw fetchError || new Error('Réservation non trouvée');

    // 2. Valider cette réservation
    await supabase
      .from('reservations')
      .update({ status: 'validated', caution_paid: true })
      .eq('id', reservationId);

    // 3. Annuler toutes les autres réservations "pending" pour le même logement/période
    const { property_id, rental_unit_id, start_date, end_date } = reservation;
    let query = supabase
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('status', 'pending')
      .neq('id', reservationId);
    if (property_id) {
      query = query.eq('property_id', property_id);
    } else if (rental_unit_id) {
      query = query.eq('rental_unit_id', rental_unit_id);
    }
    // Annuler celles qui se chevauchent
    query = query.or(`and(start_date,lt,${end_date}),and(end_date,gt,${start_date})`);
    await query;
  }
}; 