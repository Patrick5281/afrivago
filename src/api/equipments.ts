import { db } from '@/lib/db';

// Enregistrer les équipements d'une pièce (avec quantité et équipements personnalisés)
export async function saveRoomEquipments(roomId: string, equipments: {equipment_type_id?: string, quantity: number, custom_name?: string}[]) {
  const pool = db.getPool();
  if (!pool) throw new Error('Pool de connexion non initialisé');
  // On supprime d'abord les anciens équipements
  await pool.query('DELETE FROM room_equipments WHERE room_id = $1', [roomId]);
  // Puis on insère les nouveaux
  for (const eq of equipments) {
    await pool.query(
      'INSERT INTO room_equipments (room_id, equipment_type_id, quantity, custom_name) VALUES ($1, $2, $3, $4)',
      [roomId, eq.equipment_type_id || null, eq.quantity, eq.custom_name || null]
    );
  }
}

export async function getRoomTypes() {
  const pool = db.getPool();
  if (!pool) throw new Error('Pool de connexion non initialisé');
  const { rows } = await pool.query('SELECT id, name FROM room_types ORDER BY name');
  return rows;
}

export async function getPossibleEquipmentsForRoomType(roomTypeId: string) {
  const pool = db.getPool();
  if (!pool) throw new Error('Pool de connexion non initialisé');
  const { rows } = await pool.query(
    `SELECT rte.equipment_type_id, et.name as equipment_name
     FROM room_type_equipments rte
     JOIN equipment_types et ON rte.equipment_type_id = et.id
     WHERE rte.room_type_id = $1`,
    [roomTypeId]
  );
  return rows;
}