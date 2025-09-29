import { query } from '@/lib/db';

/**
 * Envoie une notification à un utilisateur (en base et temps réel si Socket.io dispo)
 * @param userId uuid du destinataire
 * @param type type de notification (paiement, reservation, alerte, etc.)
 * @param title titre court
 * @param message texte détaillé
 * @param data objet contextuel (optionnel)
 */
export async function sendNotification(userId: string, type: string, title: string, message: string, data: any = null, io?: any) {
  const result = await query(
    `INSERT INTO notifications (user_id, type, title, message, data) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [userId, type, title, message, data]
  );
  const notification = result.rows[0];
  // Émission temps réel si Socket.io est fourni
  if (io) {
    io.to(`user:${userId}`).emit('notification', notification);
  }
  return notification;
} 