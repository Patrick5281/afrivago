import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';

const KKIAPAY_API_URL = 'https://api.kkiapay.me/api/v1/transactions/status';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('[API][validate] Reçu:', req.method, req.body);
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { reservationId, transactionId, payment_method_id, payer_phone, payer_email, payer_name, payer_surname, status, sandbox } = req.body;
  console.log('[API][validate] Champs reçus:', { payer_name, payer_surname });
  if (!reservationId || !transactionId || !payment_method_id) {
    console.log('[API][validate] Paramètres manquants:', { reservationId, transactionId, payment_method_id });
    return res.status(400).json({ message: 'Paramètres manquants' });
  }

  // MODE SANDBOX : on ne vérifie pas Kkiapay, on enregistre directement
  if (sandbox || process.env.NODE_ENV !== 'production') {
    await ensurePaymentMethodExists(payment_method_id);
    const paiementStatus = status || 'completed';
    const amount = req.body.amount || 0;
    console.log('[API][validate][SANDBOX] Insertion paiement directe:', { reservationId, transactionId, paiementStatus, amount, payment_method_id, payer_phone, payer_email });
    await savePayment({ reservationId, transactionId, status: paiementStatus, amount, payment_method_id, payer_phone, payer_email });
    // Mettre à jour la réservation
    console.log('[API][validate][SANDBOX] Mise à jour de la réservation:', reservationId);
    const updated = await query(
      `UPDATE reservations SET status = 'validated' WHERE id = $1 RETURNING *`,
      [reservationId]
    );
    const updatedReservation = updated.rows[0];
    console.log('[API][validate][SANDBOX] Réservation mise à jour:', updatedReservation);

    // Annuler les autres réservations en conflit (même propriété, même période, status != 'validated')
    if (updatedReservation) {
      const { property_id, start_date, end_date } = updatedReservation;
      const cancelResult = await query(
        `UPDATE reservations
         SET status = 'cancelled'
         WHERE id != $1
           AND property_id = $2
           AND status != 'validated'
           AND (
             (start_date, end_date) OVERLAPS ($3::date, $4::date)
           )
         RETURNING id` ,
        [reservationId, property_id, start_date, end_date]
      );
      console.log('[API][validate][SANDBOX] Réservations annulées:', cancelResult.rows.map(r => r.id));
    }

    // Après la validation et l'annulation des autres réservations, insérer le contrat locatif
    if (updatedReservation) {
      // Récupérer le dernier paiement 'completed' lié à la réservation
      const paiementRes = await query(
        `SELECT id FROM paiements WHERE reservation_id = $1 AND status = 'completed' ORDER BY created_at DESC LIMIT 1`,
        [reservationId]
      );
      const paiement_id = paiementRes.rows[0]?.id;
      console.log('[API][validate] Paiement trouvé:', paiementRes.rows);
      console.log('[API][validate] paiement_id utilisé:', paiement_id);
      if (!paiement_id) {
        console.error('[API][validate] Aucun paiement validé trouvé pour la réservation:', reservationId);
      } else {
        console.log('[API][validate] Tentative de génération du contrat locatif pour:', { reservationId, paiement_id });
        // Récupérer toutes les infos nécessaires
        console.log('[API][validate] Avant SELECT contratData pour reservationId:', reservationId, 'paiement_id:', paiement_id);
        const contratData = await query(`
          SELECT
            r.id as reservation_id,
            p.id as paiement_id,
            u.id as locataire_id,
            u.name as locataire_nom,
            u.surname as locataire_prenom,
            u.email as locataire_email,
            pr.id as logement_id,
            pr.title as logement_nom,
            pr.full_address as logement_adresse,
            pr.property_type_id as logement_type,
            pr.surface as superficie,
            r.start_date as date_arrivee,
            r.end_date as date_depart,
            p.amount as caution_payee,
            pr.description as clauses,
            pr.city, pr.district, pr.postal_code,
            pr.description, pr.year_built,
            pr.latitude, pr.longitude,
            pr.rental_type,
            pr.statut,
            pr.terms_accepted,
            pr.terms_accepted_at,
            pr.created_at as logement_created_at,
            pr.updated_at as logement_updated_at,
            p.amount as caution,
            p.amount as loyer_mensuel,
            p.id as paiement_id
          FROM reservations r
          JOIN paiements p ON p.reservation_id = r.id
          JOIN users u ON u.id = r.user_id
          JOIN properties pr ON pr.id = r.property_id
          WHERE r.id = $1 AND p.id = $2
        `, [reservationId, paiement_id]);
        console.log('[API][validate] Après SELECT contratData, résultat:', contratData.rows);
        const c = contratData.rows[0];
        if (c) {
          try {
            console.log('[API][validate] Avant INSERT contrat_locatif avec données:', c);
            await query(`
              INSERT INTO contrats_locatifs (
                reservation_id, paiement_id, locataire_id, locataire_nom, locataire_prenom, locataire_email,
                logement_id, logement_nom, logement_adresse, logement_type, superficie, equipements, clauses,
                date_arrivee, date_depart, caution, caution_payee, loyer_mensuel, statut, pdf_url
              ) VALUES (
                $1, $2, $3, $4, $5, $6,
                $7, $8, $9, $10, $11, $12, $13,
                $14, $15, $16, $17, $18, 'actif', NULL
              ) RETURNING id
            `, [
              c.reservation_id, c.paiement_id, c.locataire_id, c.locataire_nom, c.locataire_prenom, c.locataire_email,
              c.logement_id, c.logement_nom, c.logement_adresse, c.logement_type, c.superficie, null, c.clauses,
              c.date_arrivee, c.date_depart, c.caution, c.caution_payee, c.loyer_mensuel
            ]).then(async (result) => {
              const contratId = result.rows[0]?.id;
              console.log('[API][validate] Après INSERT contrat_locatif, id inséré:', contratId);
              if (contratId) {
                // Génération automatique du PDF
                try {
                  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/contrat/generate/${contratId}`, { method: 'POST' });
                  console.log('[API][validate] PDF généré automatiquement pour le contrat', contratId);
                } catch (err) {
                  console.error('[API][validate] Erreur lors de la génération automatique du PDF:', err);
                }
                // Juste avant l'appel à la génération des loyers
                console.log('[LOYERS] Appel de genererLoyersPourContrat', {
                  contratId, dateArrivee: c.date_arrivee, dateDepart: c.date_depart, loyerMensuel: c.loyer_mensuel
                });
                await genererLoyersPourContrat(
                  contratId,
                  c.date_arrivee,
                  c.date_depart,
                  c.loyer_mensuel
                );
              }
            });
          } catch (err) {
            console.error('[API][validate] Erreur SQL lors de l\'insertion du contrat locatif:', err);
          }
        } else {
          console.error('[API][validate] Impossible de générer le contrat locatif, données manquantes:', contratData.rows);
        }
      }
    }
    return res.status(200).json(updatedReservation);
  }

  try {
    // Vérifier la transaction Kkiapay
    console.log('[API][validate] Vérification Kkiapay:', transactionId);
    const kkiapayRes = await fetch(KKIAPAY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_key': process.env.KKIAPAY_SECRET_KEY || '',
      },
      body: JSON.stringify({ transactionId }),
    });
    console.log('[API][validate] Status HTTP Kkiapay:', kkiapayRes.status, kkiapayRes.statusText);
    const rawKkiapay = await kkiapayRes.text();
    console.log('[API][validate] Réponse Kkiapay BRUTE:', rawKkiapay);
    let kkiapayData;
    try {
      kkiapayData = JSON.parse(rawKkiapay);
    } catch (jsonErr) {
      console.error('[API][validate] Erreur de parsing JSON Kkiapay:', jsonErr, 'Contenu reçu:', rawKkiapay);
      return res.status(500).json({ message: 'Erreur serveur', error: 'Réponse Kkiapay invalide', raw: rawKkiapay });
    }
    console.log('[API][validate] Réponse Kkiapay PARSÉE:', kkiapayData);
    if (!kkiapayRes.ok || kkiapayData.status !== 'SUCCESS') {
      // Enregistrer le paiement échoué
      console.log('[API][validate] Paiement échoué, insertion en base...');
      const failedAmount = req.body.amount || kkiapayData.amount || 0;
      console.log('[API][validate] Montant échec utilisé:', { frontendAmount: req.body.amount, kkiapayAmount: kkiapayData.amount, finalAmount: failedAmount });
      await savePayment({ reservationId, transactionId, status: 'failed', amount: failedAmount, payment_method_id, payer_phone, payer_email });
      return res.status(400).json({ message: "Le paiement n'a pas été validé par Kkiapay." });
    }

    // Paiement validé, enregistrer le paiement
    // Utiliser le montant envoyé par le frontend (caution calculée) plutôt que celui de Kkiapay
    const amount = req.body.amount || kkiapayData.amount;
    console.log('[API][validate] Paiement validé, insertion en base...');
    console.log('[API][validate] Montant utilisé:', { frontendAmount: req.body.amount, kkiapayAmount: kkiapayData.amount, finalAmount: amount });
    await savePayment({ reservationId, transactionId, status: 'completed', amount, payment_method_id, payer_phone, payer_email });

    // Mettre à jour la réservation
    console.log('[API][validate] Mise à jour de la réservation:', reservationId);
    const updated = await query(
      `UPDATE reservations SET status = 'validated' WHERE id = $1 RETURNING *`,
      [reservationId]
    );
    const updatedReservation = updated.rows[0];
    console.log('[API][validate] Réservation mise à jour:', updatedReservation);

    // Annuler les autres réservations en conflit (même propriété, même période, status != 'validated')
    if (updatedReservation) {
      const { property_id, start_date, end_date } = updatedReservation;
      const cancelResult = await query(
        `UPDATE reservations
         SET status = 'cancelled'
         WHERE id != $1
           AND property_id = $2
           AND status != 'validated'
           AND (
             (start_date, end_date) OVERLAPS ($3::date, $4::date)
           )
         RETURNING id` ,
        [reservationId, property_id, start_date, end_date]
      );
      console.log('[API][validate][SANDBOX] Réservations annulées:', cancelResult.rows.map(r => r.id));
    }

    // Après la validation et l'annulation des autres réservations, insérer le contrat locatif
    if (updatedReservation) {
      // Récupérer le dernier paiement 'completed' lié à la réservation
      const paiementRes = await query(
        `SELECT id FROM paiements WHERE reservation_id = $1 AND status = 'completed' ORDER BY created_at DESC LIMIT 1`,
        [reservationId]
      );
      const paiement_id = paiementRes.rows[0]?.id;
      console.log('[API][validate] Paiement trouvé:', paiementRes.rows);
      console.log('[API][validate] paiement_id utilisé:', paiement_id);
      if (!paiement_id) {
        console.error('[API][validate] Aucun paiement validé trouvé pour la réservation:', reservationId);
      } else {
        console.log('[API][validate] Tentative de génération du contrat locatif pour:', { reservationId, paiement_id });
        // Récupérer toutes les infos nécessaires
        console.log('[API][validate] Avant SELECT contratData pour reservationId:', reservationId, 'paiement_id:', paiement_id);
        const contratData = await query(`
          SELECT
            r.id as reservation_id,
            p.id as paiement_id,
            u.id as locataire_id,
            u.name as locataire_nom,
            u.surname as locataire_prenom,
            u.email as locataire_email,
            pr.id as logement_id,
            pr.title as logement_nom,
            pr.full_address as logement_adresse,
            pr.property_type_id as logement_type,
            pr.surface as superficie,
            r.start_date as date_arrivee,
            r.end_date as date_depart,
            p.amount as caution_payee,
            pr.description as clauses,
            pr.city, pr.district, pr.postal_code,
            pr.description, pr.year_built,
            pr.latitude, pr.longitude,
            pr.rental_type,
            pr.statut,
            pr.terms_accepted,
            pr.terms_accepted_at,
            pr.created_at as logement_created_at,
            pr.updated_at as logement_updated_at,
            p.amount as caution,
            p.amount as loyer_mensuel,
            p.id as paiement_id
          FROM reservations r
          JOIN paiements p ON p.reservation_id = r.id
          JOIN users u ON u.id = r.user_id
          JOIN properties pr ON pr.id = r.property_id
          WHERE r.id = $1 AND p.id = $2
        `, [reservationId, paiement_id]);
        console.log('[API][validate] Après SELECT contratData, résultat:', contratData.rows);
        const c = contratData.rows[0];
        if (c) {
          try {
            console.log('[API][validate] Avant INSERT contrat_locatif avec données:', c);
            await query(`
              INSERT INTO contrats_locatifs (
                reservation_id, paiement_id, locataire_id, locataire_nom, locataire_prenom, locataire_email,
                logement_id, logement_nom, logement_adresse, logement_type, superficie, equipements, clauses,
                date_arrivee, date_depart, caution, caution_payee, loyer_mensuel, statut, pdf_url
              ) VALUES (
                $1, $2, $3, $4, $5, $6,
                $7, $8, $9, $10, $11, $12, $13,
                $14, $15, $16, $17, $18, 'actif', NULL
              ) RETURNING id
            `, [
              c.reservation_id, c.paiement_id, c.locataire_id, c.locataire_nom, c.locataire_prenom, c.locataire_email,
              c.logement_id, c.logement_nom, c.logement_adresse, c.logement_type, c.superficie, null, c.clauses,
              c.date_arrivee, c.date_depart, c.caution, c.caution_payee, c.loyer_mensuel
            ]).then(async (result) => {
              const contratId = result.rows[0]?.id;
              console.log('[API][validate] Après INSERT contrat_locatif, id inséré:', contratId);
              if (contratId) {
                // Génération automatique du PDF
                try {
                  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/contrat/generate/${contratId}`, { method: 'POST' });
                  console.log('[API][validate] PDF généré automatiquement pour le contrat', contratId);
                } catch (err) {
                  console.error('[API][validate] Erreur lors de la génération automatique du PDF:', err);
                }
                // Juste avant l'appel à la génération des loyers
                console.log('[LOYERS] Appel de genererLoyersPourContrat', {
                  contratId, dateArrivee: c.date_arrivee, dateDepart: c.date_depart, loyerMensuel: c.loyer_mensuel
                });
                await genererLoyersPourContrat(
                  contratId,
                  c.date_arrivee,
                  c.date_depart,
                  c.loyer_mensuel
                );
              }
            });
          } catch (err) {
            console.error('[API][validate] Erreur SQL lors de l\'insertion du contrat locatif:', err);
          }
        } else {
          console.error('[API][validate] Impossible de générer le contrat locatif, données manquantes:', contratData.rows);
        }
      }
    }
    return res.status(200).json(updatedReservation);
  } catch (error) {
    console.error('[API][validate] Erreur serveur:', error);
    return res.status(500).json({ message: 'Erreur serveur', error: error?.message || error });
  }
}

// Fonction utilitaire pour enregistrer un paiement
async function savePayment({ reservationId, transactionId, status, amount, payment_method_id, payer_phone, payer_email }: { reservationId: string, transactionId: string, status: string, amount: number, payment_method_id: number, payer_phone?: string, payer_email?: string }) {
  console.log('[API][savePayment] Paramètres reçus:', { reservationId, transactionId, status, amount, payment_method_id, payer_phone, payer_email });
  try {
    console.log('[API][savePayment] Tentative d\'insertion paiement...');
    const result = await query(
      `INSERT INTO paiements (reservation_id, type, amount, status, kkiapay_transaction_id, payment_method_id, payer_phone, payer_email) VALUES ($1, 'caution', $2, $3, $4, $5, $6, $7) RETURNING *`,
      [reservationId, amount, status, transactionId, payment_method_id, payer_phone, payer_email]
    );
    console.log('[API][savePayment] Paiement inséré, résultat:', result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error('[API][savePayment] Erreur SQL:', error, '\nRequête:', `INSERT INTO paiements ...`, '\nParams:', [reservationId, amount, status, transactionId, payment_method_id, payer_phone, payer_email]);
    throw error;
  }
}

// Fonction utilitaire pour s'assurer que le payment_method_id existe (sandbox)
async function ensurePaymentMethodExists(payment_method_id: number, label: string = 'Test/Sandbox') {
  const check = await query('SELECT id FROM payment_methods WHERE id = $1', [payment_method_id]);
  if (check.rowCount === 0) {
    console.log(`[API][validate][SANDBOX] Méthode de paiement absente, insertion automatique id=${payment_method_id}`);
    await query('INSERT INTO payment_methods (id, label, is_active) VALUES ($1, $2, true) ON CONFLICT DO NOTHING', [payment_method_id, label]);
  }
}

// Génère les loyers mensuels pour un contrat locatif donné
async function genererLoyersPourContrat(contratId: string, dateDebut: string, dateFin: string, montant: number) {
  let currentStart = new Date(dateDebut);
  const end = new Date(dateFin);
  let mois = 1;

  while (currentStart < end) {
    const currentEnd = new Date(currentStart);
    currentEnd.setMonth(currentEnd.getMonth() + 1);
    const dateLimite = new Date(currentStart);
    dateLimite.setDate(dateLimite.getDate() - 1);

    try {
      console.log('[LOYERS] Insertion loyer', {
        contratId, mois, currentStart, currentEnd, dateLimite, montant
      });
      await query(
        `INSERT INTO loyers (
          contrat_locatif_id, mois_numero, date_debut, date_fin, date_limite_paiement, montant, statut
        ) VALUES ($1, $2, $3, $4, $5, $6, 'En attente')`,
        [
          contratId,
          mois,
          currentStart.toISOString().slice(0, 10),
          currentEnd.toISOString().slice(0, 10),
          dateLimite.toISOString().slice(0, 10),
          montant
        ]
      );
    } catch (err) {
      console.error('[LOYERS] Erreur lors de l\'insertion du loyer', err);
    }

    currentStart = currentEnd;
    mois++;
  }
} 