import { db } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function createRoom(data: any) {
  const pool = db.getPool();
  if (!pool) throw new Error('Pool de connexion non initialisé');
  const { name, room_type_id, surface, description, property_id } = data;
  const { rows } = await pool.query(
    `INSERT INTO rooms (name, room_type_id, surface, description, property_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, room_type_id, surface, description, property_id]
  );
  return rows[0];
}

export async function updateRoom(roomId: string, updates: any) {
  const pool = db.getPool();
  if (!pool) throw new Error('Pool de connexion non initialisé');
  const { id, photos, ...fields } = updates;
  Object.keys(fields).forEach(key => {
    if (fields[key] === "") fields[key] = null;
  });
  // Construction dynamique de la requête SQL
  const setClauses = [];
  const values = [];
  let idx = 1;
  for (const key in fields) {
    setClauses.push(`${key} = $${idx}`);
    values.push(fields[key]);
    idx++;
  }
  if (setClauses.length === 0) throw new Error('Aucune donnée à mettre à jour');
  values.push(roomId);
  const query = `UPDATE rooms SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`;
  const { rows } = await pool.query(query, values);
  if (rows.length === 0) throw new Error('Pièce non trouvée');
  return rows[0];
}

export async function getRoomsWithPhotos(propertyId: string) {
  const pool = db.getPool();
  if (!pool) throw new Error('Pool de connexion non initialisé');
  const { rows } = await pool.query(`
    SELECT r.*, 
      COALESCE(json_agg(rp.url) FILTER (WHERE rp.id IS NOT NULL), '[]') AS photos
    FROM rooms r
    LEFT JOIN room_photos rp ON rp.room_id = r.id
    WHERE r.property_id = $1
    GROUP BY r.id
    ORDER BY r.name
  `, [propertyId]);
  return rows;
}

export async function deleteRoomPhoto(photoId: string) {
  const pool = db.getPool();
  if (!pool) throw new Error('Pool de connexion non initialisé');
  // Récupérer l'URL du fichier
  const { rows } = await pool.query('SELECT url FROM room_photos WHERE id = $1', [photoId]);
  if (rows.length === 0) throw new Error('Photo non trouvée');
  const url = rows[0].url;
  // Supprimer le fichier sur le disque
  const filePath = path.join(process.cwd(), 'public', url);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  // Supprimer la ligne en base
  await pool.query('DELETE FROM room_photos WHERE id = $1', [photoId]);
}

export async function deleteRoom(roomId: string) {
  const pool = db.getPool();
  if (!pool) throw new Error('Pool de connexion non initialisé');
  
  // Supprimer d'abord les équipements de la pièce
  await pool.query('DELETE FROM room_equipments WHERE room_id = $1', [roomId]);
  
  // Récupérer toutes les photos
  const { rows } = await pool.query('SELECT id FROM room_photos WHERE room_id = $1', [roomId]);
  for (const row of rows) {
    await deleteRoomPhoto(row.id);
  }
  
  // Supprimer la pièce
  await pool.query('DELETE FROM rooms WHERE id = $1', [roomId]);
} 