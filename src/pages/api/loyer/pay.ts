import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

const KKIAPAY_API_URL = 'https://api.kkiapay.me/api/v1/transactions/status';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('[LOYER/PAY] Route appelée, méthode:', req.method, 'body:', req.body);
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { loyerId, transactionId, amount, payment_method_id, payer_phone, payer_email, status, sandbox } = req.body;
  console.log('[LOYER/PAY] Params reçus:', { loyerId, transactionId, amount, payment_method_id, payer_phone, payer_email, status, sandbox });
  if (!loyerId || !transactionId || !amount || !payment_method_id) {
    return res.status(400).json({ message: 'Paramètres manquants', loyerId, transactionId, amount, payment_method_id });
  }

  // 1. Récupérer contrat_locatif_id et date_debut depuis loyers
  console.log('[LOYER/PAY] SELECT contrat_locatif_id, date_debut FROM loyers WHERE id = $1', loyerId);
  const loyerRes = await query('SELECT contrat_locatif_id, date_debut FROM loyers WHERE id = $1', [loyerId]);
  console.log('[LOYER/PAY] Résultat loyers:', loyerRes.rows);
  const loyer = loyerRes.rows[0];
  if (!loyer) {
    return res.status(400).json({ message: 'Loyer introuvable', loyerId });
  }
  const { contrat_locatif_id, date_debut } = loyer;

  // 2. Récupérer reservation_id depuis contrats_locatifs
  console.log('[LOYER/PAY] SELECT reservation_id FROM contrats_locatifs WHERE id = $1', contrat_locatif_id);
  const contratRes = await query('SELECT reservation_id FROM contrats_locatifs WHERE id = $1', [contrat_locatif_id]);
  console.log('[LOYER/PAY] Résultat contrats_locatifs:', contratRes.rows);
  const contrat = contratRes.rows[0];
  if (!contrat) {
    return res.status(400).json({ message: 'Contrat locatif introuvable', contrat_locatif_id });
  }
  const { reservation_id } = contrat;

  // 3. Paiement (sandbox ou prod)
  if (sandbox || process.env.NODE_ENV !== 'production') {
    const paiementStatus = status || 'completed';
    try {
      console.log('[LOYER/PAY] INSERT INTO paiements (reservation_id, type, amount, status, kkiapay_transaction_id, payment_method_id, period, payer_phone, payer_email) ...', { reservation_id, amount, paiementStatus, transactionId, payment_method_id, date_debut, payer_phone, payer_email });
      const paiementResult = await query(
        `INSERT INTO paiements (reservation_id, type, amount, status, kkiapay_transaction_id, payment_method_id, period, payer_phone, payer_email)
         VALUES ($1, 'monthly', $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [reservation_id, amount, paiementStatus, transactionId, payment_method_id || null, date_debut, payer_phone || null, payer_email || null]
      );
      if (!paiementResult.rows[0]?.id) {
        return res.status(500).json({ message: 'Erreur lors de l\'insertion du paiement' });
      }
      // Mise à jour du loyer
      console.log('[LOYER/PAY] UPDATE loyers statut payé pour id:', loyerId);
      const updateResult = await query(
        `UPDATE loyers SET statut = 'payé', date_paiement = NOW() WHERE id = $1 RETURNING *`,
        [loyerId]
      );
      if (updateResult.rowCount === 0) {
        return res.status(500).json({ message: 'Aucune ligne loyer mise à jour', loyerId });
      }
      return res.status(200).json({ message: 'Loyer payé (sandbox)', paiementId: paiementResult.rows[0].id, loyer: updateResult.rows[0] });
    } catch (error: any) {
      console.error('[LOYER/PAY][SANDBOX] Erreur:', error);
      return res.status(500).json({ message: 'Erreur serveur', error: error?.message || error });
    }
  }

  // MODE PRODUCTION : vérification réelle Kkiapay
  try {
    console.log('[LOYERS-FRONT] loyerAPayer juste avant fetch:', loyerAPayer);
    const kkiapayRes = await fetch(KKIAPAY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_key': process.env.KKIAPAY_SECRET_KEY || '',
      },
      body: JSON.stringify({ transactionId }),
    });
    const rawKkiapay = await kkiapayRes.text();
    let kkiapayData;
    try {
      kkiapayData = JSON.parse(rawKkiapay);
    } catch (jsonErr) {
      return res.status(500).json({ message: 'Réponse Kkiapay invalide', raw: rawKkiapay });
    }
    if (!kkiapayRes.ok || kkiapayData.status !== 'SUCCESS') {
      return res.status(400).json({ message: "Le paiement n'a pas été validé par Kkiapay." });
    }

    console.log('[LOYER/PAY] INSERT INTO paiements (reservation_id, type, amount, status, kkiapay_transaction_id, payment_method_id, period, payer_phone, payer_email) ...', { reservation_id, amount, transactionId, payment_method_id, date_debut, payer_phone, payer_email });
    const paiementResult = await query(
      `INSERT INTO paiements (reservation_id, type, amount, status, kkiapay_transaction_id, payment_method_id, period, payer_phone, payer_email)
       VALUES ($1, 'monthly', $2, 'completed', $3, $4, $5, $6, $7)
       RETURNING id`,
      [reservation_id, amount, transactionId, payment_method_id || null, date_debut, payer_phone || null, payer_email || null]
    );
    if (!paiementResult.rows[0]?.id) {
      return res.status(500).json({ message: 'Erreur lors de l\'insertion du paiement' });
    }
    // Mise à jour du loyer
    console.log('[LOYER/PAY] UPDATE loyers statut payé pour id:', loyerId);
    const updateResult = await query(
      `UPDATE loyers SET statut = 'payé', date_paiement = NOW() WHERE id = $1 RETURNING *`,
      [loyerId]
    );
    if (updateResult.rowCount === 0) {
      return res.status(500).json({ message: 'Aucune ligne loyer mise à jour', loyerId });
    }
    return res.status(200).json({ message: 'Loyer payé', paiementId: paiementResult.rows[0].id, loyer: updateResult.rows[0] });
  } catch (error: any) {
    console.error('[LOYER/PAY][PROD] Erreur:', error);
    return res.status(500).json({ message: 'Erreur serveur', error: error?.message || error });
  }
} 