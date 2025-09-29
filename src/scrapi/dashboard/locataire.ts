import { db } from "@/lib/db";

export interface ProchainLoyerData {
  montant: number;
  dateLimite: string;
  statut: 'payé' | 'en_attente' | 'en_retard';
  paiementId?: string;
  logement?: {
    titre?: string;
    adresse?: string;
  };
}

export interface LogementReserve {
  id: string;
  photo: string;
  titre: string;
  adresse: string;
  proprietaire: string;
  statutBail: string;
  type?: string;
  prix?: number;
  ville?: string;
  description?: string;
}

export interface DashboardLocataireData {
  prochainLoyer?: ProchainLoyerData;
  reservations?: any[];
  logements?: LogementReserve[];
}

export async function getDashboardLocataireData(userId: string): Promise<DashboardLocataireData> {
  try {
    console.log('USER ID DASHBOARD:', userId); // LOG USER ID
    // 1. Récupérer les réservations validées actives ou à venir pour ce locataire (sans filtre sur la date de fin)
    const reservationsResult = await db.query(
      `SELECT r.*, c.loyer_mensuel, c.date_arrivee, c.date_depart, c.logement_id, p.title AS logement_titre, p.full_address AS logement_adresse
       FROM reservations r
       JOIN contrats_locatifs c ON c.reservation_id = r.id
       JOIN properties p ON p.id = c.logement_id
       WHERE r.user_id = $1
         AND r.status = 'validated'
         AND c.statut = 'actif'
       ORDER BY c.date_arrivee ASC`,
      [userId]
    );
    const reservations = reservationsResult.rows;
    console.log('RESERVATIONS TROUVÉES:', reservations); // LOG RESERVATIONS

    // 2. Récupérer dynamiquement les logements réservés par l'utilisateur
    const logementsResult = await db.query(
      `SELECT DISTINCT p.id, 
        (SELECT url FROM property_images WHERE property_id = p.id LIMIT 1) AS photo,
        p.title AS titre,
        p.full_address AS adresse,
        p.city AS ville,
        p.description,
        pt.name AS type,
        pr.amount AS prix,
        u.name AS proprietaire,
        c.statut AS statutBail,
        c.date_arrivee
      FROM reservations r
      JOIN contrats_locatifs c ON c.reservation_id = r.id
      JOIN properties p ON p.id = c.logement_id
      LEFT JOIN property_types pt ON pt.id = p.property_type_id
      LEFT JOIN property_pricing pr ON pr.property_id = p.id
      LEFT JOIN users u ON u.id = p.created_by
      WHERE r.user_id = $1
        AND r.status = 'validated'
        AND c.statut = 'actif'
      ORDER BY c.date_arrivee ASC`,
      [userId]
    );
    const logements: LogementReserve[] = logementsResult.rows.map((row: any) => ({
      id: row.id,
      photo: row.photo || 'https://via.placeholder.com/400x300?text=Photo',
      titre: row.titre,
      adresse: row.adresse,
      proprietaire: row.proprietaire || '',
      statutBail: row.statutbail,
      type: row.type,
      prix: row.prix ? Number(row.prix) : undefined,
      ville: row.ville,
      description: row.description,
    }));
    console.log('LOGEMENTS TROUVÉS:', logements); // LOG LOGEMENTS

    // 3. Calculer le prochain loyer dû (inchangé)
    let prochainLoyer: ProchainLoyerData | undefined;
    if (reservations && reservations.length > 0) {
      const reservation = reservations[0];
      const now = new Date();
      const dateArrivee = new Date(reservation.date_arrivee);
      let period: Date;
      if (now < dateArrivee) {
        period = new Date(dateArrivee.getFullYear(), dateArrivee.getMonth(), 1);
      } else {
        period = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      // 3. Chercher le paiement du mois concerné
      const paiementsResult = await db.query(
        `SELECT * FROM paiements
         WHERE reservation_id = $1
           AND type = 'monthly'
           AND period = $2
         LIMIT 1`,
        [reservation.id, period]
      );
      const paiement = paiementsResult.rows[0];
      // 4. Déterminer le statut
      let statut: 'payé' | 'en_attente' | 'en_retard' = 'en_attente';
      if (paiement) {
        if (paiement.status === 'completed') {
          statut = 'payé';
        } else if (paiement.status === 'pending' && now > new Date(period.getFullYear(), period.getMonth(), dateArrivee.getDate() + 10)) {
          statut = 'en_retard';
        }
      } else {
        if (now > new Date(period.getFullYear(), period.getMonth(), dateArrivee.getDate() + 10)) {
          statut = 'en_retard';
        }
      }
      // 5. Calcul de la date limite de paiement
      const dateLimite = new Date(period.getFullYear(), period.getMonth(), dateArrivee.getDate());
      prochainLoyer = {
        montant: reservation.loyer_mensuel || 0,
        dateLimite: dateLimite.toISOString().split('T')[0],
        statut,
        paiementId: paiement ? paiement.id : undefined,
        logement: {
          titre: reservation.logement_titre,
          adresse: reservation.logement_adresse,
        },
      };
    }

    return {
      prochainLoyer,
      reservations: reservations || [],
      logements,
    };
  } catch (error) {
    console.error('Erreur dans getDashboardLocataireData:', error);
    return {
      reservations: [],
      logements: [],
    };
  }
}
 