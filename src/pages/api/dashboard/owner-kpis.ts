import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const ownerId = user.id;
  console.log('Dashboard API - ownerId:', ownerId); // DEBUG
  const pool = db.getPool();
  if (!pool) return res.status(500).json({ error: 'DB non initialisée' });

  try {
    // 1. Revenus encaissés (total)
    const { rows: revenusRows } = await pool.query(
      `SELECT COALESCE(SUM(p.amount), 0) AS revenus_total
       FROM paiements p
       JOIN reservations r ON p.reservation_id = r.id
       JOIN properties pr ON r.property_id = pr.id
       WHERE p.status = 'completed' AND pr.created_by = $1`,
      [ownerId]
    );
    const revenus_total = Number(revenusRows[0]?.revenus_total || 0);

    // 2. Revenus ce mois
    const { rows: moisRows } = await pool.query(
      `SELECT COALESCE(SUM(p.amount), 0) AS revenus_mois
       FROM paiements p
       JOIN reservations r ON p.reservation_id = r.id
       JOIN properties pr ON r.property_id = pr.id
       WHERE p.status = 'completed' AND pr.created_by = $1
         AND date_trunc('month', p.created_at) = date_trunc('month', CURRENT_DATE)`,
      [ownerId]
    );
    const revenus_mois = Number(moisRows[0]?.revenus_mois || 0);

    // 2b. Revenus mois précédent
    const { rows: moisPrecRows } = await pool.query(
      `SELECT COALESCE(SUM(p.amount), 0) AS revenus_mois_prec
       FROM paiements p
       JOIN reservations r ON p.reservation_id = r.id
       JOIN properties pr ON r.property_id = pr.id
       WHERE p.status = 'completed' AND pr.created_by = $1
         AND date_trunc('month', p.created_at) = date_trunc('month', CURRENT_DATE - INTERVAL '1 month')`,
      [ownerId]
    );
    const revenus_mois_prec = Number(moisPrecRows[0]?.revenus_mois_prec || 0);
    const evolution = revenus_mois_prec === 0 ? null : ((revenus_mois - revenus_mois_prec) / revenus_mois_prec) * 100;

    // 3. Loyers impayés et locataires concernés
    const { rows: impayesRows } = await pool.query(
      `SELECT COALESCE(SUM(p.amount), 0) AS loyers_impayes, COUNT(DISTINCT r.user_id) AS locataires_impayes
       FROM paiements p
       JOIN reservations r ON p.reservation_id = r.id
       JOIN properties pr ON r.property_id = pr.id
       WHERE p.status IN ('pending', 'failed') AND p.type = 'monthly' AND pr.created_by = $1`,
      [ownerId]
    );
    const loyers_impayes = Number(impayesRows[0]?.loyers_impayes || 0);
    const locataires_impayes = Number(impayesRows[0]?.locataires_impayes || 0);

    // 4. Biens occupés et total
    const { rows: occRows } = await pool.query(
      `SELECT COUNT(DISTINCT pr.id) AS biens_occupes
       FROM properties pr
       JOIN reservations r ON r.property_id = pr.id
       WHERE pr.created_by = $1
         AND r.status = 'validated'
         AND CURRENT_DATE BETWEEN r.start_date AND r.end_date`,
      [ownerId]
    );
    const biens_occupes = Number(occRows[0]?.biens_occupes || 0);
    const { rows: totalRows } = await pool.query(
      `SELECT COUNT(*) AS total_biens FROM properties WHERE created_by = $1`,
      [ownerId]
    );
    const total_biens = Number(totalRows[0]?.total_biens || 0);
    const taux_occupation = total_biens === 0 ? 0 : (biens_occupes / total_biens) * 100;

    // 5. Contrats actifs
    const { rows: contratsRows } = await pool.query(
      `SELECT COUNT(*) AS contrats_actifs
       FROM contrats_locatifs c
       JOIN properties pr ON c.logement_id = pr.id
       WHERE pr.created_by = $1 AND c.statut IN ('généré', 'signé')`,
      [ownerId]
    );
    const contrats_actifs = Number(contratsRows[0]?.contrats_actifs || 0);

    // 6. Revenus évolution (mensuelle ou annuelle)
    const { granularity = 'monthly', year } = req.query;
    let revenus_evolution = [];
    if (granularity === 'yearly') {
      // Par année
      const { rows: revenusAnnuelsRows } = await pool.query(
        `SELECT 
          EXTRACT(YEAR FROM p.created_at)::int AS annee,
          COALESCE(SUM(p.amount), 0) AS revenu
        FROM paiements p
        JOIN reservations r ON p.reservation_id = r.id
        JOIN properties pr ON r.property_id = pr.id
        WHERE p.status = 'completed' AND pr.created_by = $1
        GROUP BY annee
        ORDER BY annee`,
        [ownerId]
      );
      revenus_evolution = revenusAnnuelsRows.map(row => ({
        periode: row.annee.toString(),
        revenu: Number(row.revenu)
      }));
    } else {
      // Par mois pour une année donnée (par défaut année courante)
      const currentYear = year ? Number(year) : new Date().getFullYear();
      const currentMonth = (new Date().getFullYear() === currentYear) ? new Date().getMonth() + 1 : 12;
      const { rows: revenusMensuelsRows } = await pool.query(
        `SELECT 
          TO_CHAR(p.created_at, 'YYYY-MM') AS mois,
          COALESCE(SUM(p.amount), 0) AS revenu
        FROM paiements p
        JOIN reservations r ON p.reservation_id = r.id
        JOIN properties pr ON r.property_id = pr.id
        WHERE p.status = 'completed'
          AND pr.created_by = $1
          AND EXTRACT(YEAR FROM p.created_at) = $2
        GROUP BY mois
        ORDER BY mois`,
        [ownerId, currentYear]
      );
      // Générer un tableau pour tous les mois jusqu'au mois courant
      const moisLabels = Array.from({ length: currentMonth }, (_, i) => {
        const month = (i + 1).toString().padStart(2, '0');
        return `${currentYear}-${month}`;
      });
      const revenusMensuelsMap = Object.fromEntries(revenusMensuelsRows.map(row => [row.mois, Number(row.revenu)]));
      revenus_evolution = moisLabels.map(mois => ({
        periode: mois,
        revenu: revenusMensuelsMap[mois] || 0
      }));
    }

    // 7. Loyers par type de bien (corrigé)
    const { rows: loyersParTypeRows } = await pool.query(
      `SELECT pt.name AS type, COALESCE(SUM(p.amount), 0) AS montant
       FROM paiements p
       JOIN reservations r ON p.reservation_id = r.id
       JOIN properties pr ON r.property_id = pr.id
       JOIN property_types pt ON pr.property_type_id = pt.id
       WHERE p.status = 'completed' AND pr.created_by = $1
       GROUP BY pt.name
       ORDER BY montant DESC`,
      [ownerId]
    );
    const loyers_par_type = loyersParTypeRows.map(row => ({
      type: row.type,
      montant: Number(row.montant)
    }));

    // 8. Derniers paiements reçus (5 derniers)
    const { rows: paiementsRecusRows } = await pool.query(
      `SELECT 
          p.id,
          u.name AS locataire_nom,
          u.surname AS locataire_prenom,
          pr.title AS bien,
          p.created_at::date AS date,
          p.amount,
          p.status
        FROM paiements p
        JOIN reservations r ON p.reservation_id = r.id
        JOIN users u ON r.user_id = u.id
        JOIN properties pr ON r.property_id = pr.id
        WHERE p.status = 'completed' AND pr.created_by = $1
        ORDER BY p.created_at DESC
        LIMIT 5`,
      [ownerId]
    );
    console.log('Dashboard API - paiements reçus trouvés:', paiementsRecusRows.length); // DEBUG
    const derniers_paiements = paiementsRecusRows.map(row => ({
      id: row.id,
      locataire: `${row.locataire_prenom} ${row.locataire_nom}`,
      bien: row.bien,
      date: row.date,
      montant: Number(row.amount),
      statut: row.status
    }));

    // 9. Biens à surveiller (loyers impayés + baux expirant bientôt)
    const { rows: biensSurvRows } = await pool.query(
      `SELECT 
          pr.title AS bien,
          u.name AS locataire_nom,
          u.surname AS locataire_prenom,
          CASE 
            WHEN p.status IN ('pending', 'failed') THEN 'Loyer impayé'
            WHEN r.end_date <= CURRENT_DATE + INTERVAL '30 days' AND r.end_date > CURRENT_DATE THEN 'Bail expire bientôt'
            ELSE NULL
          END AS probleme
        FROM paiements p
        JOIN reservations r ON p.reservation_id = r.id
        JOIN users u ON r.user_id = u.id
        JOIN properties pr ON r.property_id = pr.id
        WHERE pr.created_by = $1
          AND (
            (p.status IN ('pending', 'failed') AND p.type = 'monthly')
            OR (r.end_date <= CURRENT_DATE + INTERVAL '30 days' AND r.end_date > CURRENT_DATE)
          )
        ORDER BY p.created_at DESC
        LIMIT 5`,
      [ownerId]
    );
    const biens_a_surveiller = biensSurvRows.map(row => ({
      bien: row.bien,
      locataire: `${row.locataire_prenom} ${row.locataire_nom}`,
      probleme: row.probleme
    }));

    return res.status(200).json({
      revenus_total,
      revenus_mois,
      evolution,
      loyers_impayes,
      locataires_impayes,
      biens_occupes,
      total_biens,
      taux_occupation,
      contrats_actifs,
      revenus_evolution,
      loyers_par_type,
      derniers_paiements,
      biens_a_surveiller
    });
  } catch (error) {
    console.error('Erreur API KPIs propriétaire:', error);
    return res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
} 