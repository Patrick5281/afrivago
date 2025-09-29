import { db } from '@/lib/db';

export interface RentalUnit {
  id: string;
  property_id: string;
  name: string;
  description?: string;
  price_per_month: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  rental_unit_id: string;
  name: string;
  surface?: number;
  description?: string;
  room_type_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Currency {
  code: string;
  name: string;
}

export interface PlatformCommission {
  percentage: number;
  is_active: boolean;
}

export const unitService = {
  /**
   * Vérifie si une propriété existe
   */
  async validateProperty(propertyId: string): Promise<boolean> {
    const pool = db.getPool();
    if (!pool) throw new Error('Pool de connexion non initialisé');
    
    const { rows } = await pool.query(
      'SELECT id FROM properties WHERE id = $1',
      [propertyId]
    );
    
    return rows.length > 0;
  },

  /**
   * Crée une nouvelle unité locative
   */
  async createUnit(unit: {
    property_id: string;
    name: string;
    description?: string;
    price_per_month?: number;
  }): Promise<RentalUnit> {
    const pool = db.getPool();
    if (!pool) throw new Error('Pool de connexion non initialisé');

    const { rows } = await pool.query(
      `INSERT INTO rental_units 
       (property_id, name, description, price_per_month) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [
        unit.property_id,
        unit.name.trim(),
        unit.description?.trim() || null,
        unit.price_per_month || 0
      ]
    );

    return rows[0];
  },

  /**
   * Récupère la commission active de la plateforme
   */
  async getActiveCommission(): Promise<PlatformCommission> {
    const pool = db.getPool();
    if (!pool) throw new Error('Pool de connexion non initialisé');

    const { rows } = await pool.query(
      'SELECT percentage, is_active FROM platform_commission WHERE is_active = true LIMIT 1'
    );

    return rows[0] || { percentage: 0, is_active: true };
  },

  /**
   * Récupère toutes les devises
   */
  async getCurrencies(): Promise<Currency[]> {
    const pool = db.getPool();
    if (!pool) throw new Error('Pool de connexion non initialisé');

    const { rows } = await pool.query('SELECT * FROM currencies ORDER BY code');
    return rows;
  },

  /**
   * Met à jour le prix d'une unité locative
   */
  async updateUnitPricing(unitId: string, data: { price_per_month: number }): Promise<RentalUnit> {
    const pool = db.getPool();
    if (!pool) throw new Error('Pool de connexion non initialisé');

    const { rows } = await pool.query(
      `UPDATE rental_units 
       SET price_per_month = $1
       WHERE id = $2
       RETURNING *`,
      [data.price_per_month, unitId]
    );

    return rows[0];
  },

  /**
   * Met à jour le prix total d'une propriété
   */
  async updatePropertyPricing(propertyId: string, amount: number): Promise<void> {
    const pool = db.getPool();
    if (!pool) throw new Error('Pool de connexion non initialisé');

    await pool.query(
      `INSERT INTO property_pricing (property_id, amount, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (property_id) 
       DO UPDATE SET amount = $2, updated_at = NOW()`,
      [propertyId, amount]
    );
  },

  /**
   * Récupère toutes les unités locatives d'une propriété avec leurs prix
   */
  async getPropertyUnitsWithPricing(propertyId: string): Promise<RentalUnit[]> {
    const pool = db.getPool();
    if (!pool) throw new Error('Pool de connexion non initialisé');

    const { rows } = await pool.query(
      'SELECT * FROM rental_units WHERE property_id = $1',
      [propertyId]
    );

    return rows;
  },

  /**
   * Supprime une unité locative
   */
  async deleteUnit(unitId: string): Promise<void> {
    const pool = db.getPool();
    if (!pool) throw new Error('Pool de connexion non initialisé');
    // Supprimer d'abord les pièces associées à l'unité
    await pool.query('DELETE FROM rooms WHERE rental_unit_id = $1', [unitId]);
    // Supprimer l'unité
    await pool.query('DELETE FROM rental_units WHERE id = $1', [unitId]);
  },

  /**
   * Récupère toutes les pièces d'une unité locative
   */
  async getRoomsByUnit(unitId: string): Promise<Room[]> {
    const pool = db.getPool();
    if (!pool) throw new Error('Pool de connexion non initialisé');
    const { rows } = await pool.query(
      'SELECT * FROM rooms WHERE rental_unit_id = $1 ORDER BY created_at ASC',
      [unitId]
    );
    return rows;
  },

  /**
   * Crée une pièce pour une unité locative
   */
  async createRoomForUnit(data: { rental_unit_id: string, name: string, surface?: number, description?: string, room_type_id?: string }): Promise<Room> {
    const pool = db.getPool();
    if (!pool) throw new Error('Pool de connexion non initialisé');
    const { rental_unit_id, name, surface, description, room_type_id } = data;
    const { rows } = await pool.query(
      `INSERT INTO rooms (rental_unit_id, name, surface, description, room_type_id, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [rental_unit_id, name, surface || null, description || null, room_type_id || null]
    );
    return rows[0];
  }
};
