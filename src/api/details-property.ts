import { db } from '@/lib/db';

/**
 * Récupère les détails complets d'une unité locative, y compris ses pièces et leurs photos.
 * @param unitId - L'ID de l'unité locative.
 * @returns Un objet représentant l'unité locative avec ses pièces imbriquées.
 */
export async function getUnitDetails(unitId: string) {
  const pool = db.getPool();
  if (!pool) throw new Error('Pool de connexion non initialisé');

  const query = `
    SELECT
      ru.*,
      (
        SELECT COALESCE(json_agg(rooms_agg), '[]'::json)
        FROM (
          SELECT
            r.*,
            (
              SELECT COALESCE(json_agg(rp), '[]'::json)
              FROM room_photos rp
              WHERE rp.room_id = r.id
            ) as room_photos
          FROM rooms r
          WHERE r.rental_unit_id = ru.id
        ) as rooms_agg
      ) as rooms
    FROM rental_units ru
    WHERE ru.id = $1;
  `;

  const { rows } = await pool.query(query, [unitId]);
  if (rows.length === 0) {
    return null;
  }
  return rows[0];
}

/**
 * Récupère les détails complets d'une pièce, y compris ses équipements, photos et type de pièce.
 * @param roomId - L'ID de la pièce.
 * @returns Un objet représentant la pièce avec ses équipements, photos et type.
 */
export async function getRoomDetails(roomId: string) {
  const pool = db.getPool();
  if (!pool) throw new Error('Pool de connexion non initialisé');

  const query = `
    SELECT
      r.*,
      rt.id as room_type_id,
      rt.name as room_type_name,
      (
        SELECT COALESCE(json_agg(rp), '[]'::json)
        FROM room_photos rp
        WHERE rp.room_id = r.id
      ) as photos,
      (
        SELECT COALESCE(json_agg(re_agg), '[]'::json)
        FROM (
          SELECT
            re.id,
            COALESCE(et.name, re.custom_name) as name,
            re.quantity
          FROM room_equipments re
          LEFT JOIN equipment_types et ON re.equipment_type_id = et.id
          WHERE re.room_id = r.id
        ) as re_agg
      ) as room_equipments
    FROM rooms r
    LEFT JOIN room_types rt ON r.room_type_id = rt.id
    WHERE r.id = $1;
  `;

  const { rows } = await pool.query(query, [roomId]);
  if (rows.length === 0) {
    return null;
  }

  // Restructurer les données pour correspondre à l'interface attendue
  const room = rows[0];
  return {
    id: room.id,
    name: room.name,
    surface: room.surface,
    description: room.description,
    room_type: {
      id: room.room_type_id,
      name: room.room_type_name
    },
    photos: room.photos || [],
    room_equipments: room.room_equipments || []
  };
}

// Créer une réservation
export async function createReservation({
  userId,
  propertyId,
  rentalUnitId,
  startDate,
  endDate,
  guests
}: {
  userId: string;
  propertyId?: string | null;
  rentalUnitId?: string | null;
  startDate: string;
  endDate: string;
  guests?: number | null;
}) {
  const pool = db.getPool();
  if (!pool) throw new Error('Pool de connexion non initialisé');

  let finalPropertyId = propertyId || null;
  // Si on réserve une unité et pas de propertyId, récupérer le property_id parent
  if (!propertyId && rentalUnitId) {
    const unitRes = await pool.query('SELECT property_id FROM rental_units WHERE id = $1', [rentalUnitId]);
    finalPropertyId = unitRes.rows[0]?.property_id || null;
  }

  const query = `
    INSERT INTO reservations (user_id, property_id, rental_unit_id, start_date, end_date, status, caution_paid, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, 'pending', false, now(), now())
    RETURNING *;
  `;
  const values = [
    userId,
    finalPropertyId,
    rentalUnitId || null,
    startDate,
    endDate
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
}

// Récupérer les réservations d'un utilisateur
export async function getUserReservations(userId: string) {
  const pool = db.getPool();
  if (!pool) throw new Error('Pool de connexion non initialisé');

  const query = `
    SELECT 
      r.*, 
      p.title AS property_title,
      p_pricing.amount AS property_monthly_price,
      u.name AS unit_name,
      u.price_per_month AS unit_price_per_month
    FROM reservations r
    LEFT JOIN properties p ON r.property_id = p.id
    LEFT JOIN property_pricing p_pricing ON p.id = p_pricing.property_id
    LEFT JOIN rental_units u ON r.rental_unit_id = u.id
    WHERE r.user_id = $1
    ORDER BY r.created_at DESC;
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows;
}


