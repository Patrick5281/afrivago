import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

function formatDate(date: Date) {
  return date.toISOString().split('T')[0];
}

interface Logement {
  contratId: string;
  logementId: string;
  titre: string;
  adresse: string;
  type: string;
  photo: string;
  periodeDebut: string;
  periodeFin: string;
  loyers: any[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('[API Loyers-Caution] Début de la requête');
  console.log('[API Loyers-Caution] Method:', req.method);
  console.log('[API Loyers-Caution] URL:', req.url);
  
  const session = await getSession(req);
  
  // 🔍 LOGS DE DIAGNOSTIC COMPLETS
  console.log('==================== DIAGNOSTIC SESSION ====================');
  console.log('[DIAGNOSTIC] Session complète:', JSON.stringify(session, null, 2));
  console.log('[DIAGNOSTIC] session existe:', !!session);
  console.log('[DIAGNOSTIC] session.user:', session?.user);
  console.log('[DIAGNOSTIC] session.user.id:', session?.user?.id);
  console.log('[DIAGNOSTIC] Type de session.user.id:', typeof session?.user?.id);
  console.log('[DIAGNOSTIC] session.user.email:', session?.user?.email);
  console.log('===========================================================');
  
  if (!session || !session.user?.id) {
    console.log('[API Loyers-Caution] ❌ Utilisateur non authentifié');
    return res.status(401).json({ error: 'Non authentifié' });
  }
  
  const userId = session.user.id;
  console.log('[DIAGNOSTIC] ✅ UserId final utilisé:', userId, 'Type:', typeof userId);

  try {
    // 🔍 DIAGNOSTIC 1 - Vérifiez si l'utilisateur existe
    console.log('==================== DIAGNOSTIC UTILISATEUR ====================');
    const userCheckResult = await db.query(
      'SELECT id, email, created_at FROM users WHERE id = $1',
      [userId]
    );
    console.log('[DIAGNOSTIC] Utilisateur trouvé:', userCheckResult.rows);
    console.log('[DIAGNOSTIC] Nombre d\'utilisateurs trouvés:', userCheckResult.rowCount);
    
    if (userCheckResult.rowCount === 0) {
      console.log('[DIAGNOSTIC] ❌ PROBLÈME: Utilisateur non trouvé en base avec ID:', userId);
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    console.log('================================================================');

    // 🔍 DIAGNOSTIC 2 - Vérifiez TOUS les contrats pour cet utilisateur
    console.log('==================== DIAGNOSTIC TOUS CONTRATS ====================');
    const allContratsResult = await db.query(
      `SELECT c.id AS contrat_id, c.locataire_id, c.statut, c.logement_nom, c.date_generation,
              LENGTH(c.statut) as longueur_statut
       FROM contrats_locatifs c
       WHERE c.locataire_id = $1
       ORDER BY c.date_generation DESC`,
      [userId]
    );
    console.log('[DIAGNOSTIC] TOUS les contrats pour cet utilisateur:');
    console.log('[DIAGNOSTIC] Nombre total de contrats:', allContratsResult.rowCount);
    allContratsResult.rows.forEach((contrat, index) => {
      console.log(`[DIAGNOSTIC] Contrat ${index + 1}:`, {
        id: contrat.contrat_id,
        locataire_id: contrat.locataire_id,
        statut: `"${contrat.statut}"`,
        longueur_statut: contrat.longueur_statut,
        logement_nom: contrat.logement_nom,
        date_generation: contrat.date_generation
      });
    });
    console.log('==================================================================');

    // 🔍 DIAGNOSTIC 3 - Vérifiez les statuts possibles
    console.log('==================== DIAGNOSTIC STATUTS ====================');
    const statutsResult = await db.query(
      `SELECT DISTINCT statut, COUNT(*) as count
       FROM contrats_locatifs 
       GROUP BY statut
       ORDER BY count DESC`
    );
    console.log('[DIAGNOSTIC] Tous les statuts dans la base:');
    statutsResult.rows.forEach(row => {
      console.log(`[DIAGNOSTIC] Statut: "${row.statut}" (${row.count} contrats)`);
    });
    console.log('=============================================================');

    // 🔍 DIAGNOSTIC 4 - Test avec différentes variantes du statut "actif"
    console.log('==================== DIAGNOSTIC VARIANTES STATUT ====================');
    const variantesActif = ['actif', 'Actif', 'ACTIF', 'active', 'Active', 'ACTIVE'];
    
    for (const variante of variantesActif) {
      const testResult = await db.query(
        `SELECT COUNT(*) as count
         FROM contrats_locatifs c
         WHERE c.locataire_id = $1 AND c.statut = $2`,
        [userId, variante]
      );
      console.log(`[DIAGNOSTIC] Contrats avec statut "${variante}":`, testResult.rows[0].count);
    }
    
    // Test avec TRIM et LOWER
    const testTrimResult = await db.query(
      `SELECT COUNT(*) as count
       FROM contrats_locatifs c
       WHERE c.locataire_id = $1 AND TRIM(LOWER(c.statut)) = 'actif'`,
      [userId]
    );
    console.log('[DIAGNOSTIC] Contrats avec TRIM(LOWER(statut)) = "actif":', testTrimResult.rows[0].count);
    console.log('=====================================================================');

    // 🔍 DIAGNOSTIC 5 - Vérifiez les types des colonnes
    console.log('==================== DIAGNOSTIC TYPES COLONNES ====================');
    const columnsResult = await db.query(
      `SELECT column_name, data_type, is_nullable
       FROM information_schema.columns 
       WHERE table_name = 'contrats_locatifs' 
       AND column_name IN ('id', 'locataire_id', 'statut')
       ORDER BY column_name`
    );
    console.log('[DIAGNOSTIC] Types des colonnes contrats_locatifs:');
    columnsResult.rows.forEach(col => {
      console.log(`[DIAGNOSTIC] ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    console.log('====================================================================');

    // 1. Récupérer tous les contrats locatifs actifs du locataire
    console.log('[API Loyers-Caution] 🔍 Récupération des contrats ACTIFS pour userId:', userId);
    const contratsResult = await db.query(
      `SELECT c.id AS contrat_id, c.reservation_id, c.logement_id, c.logement_nom AS titre, c.logement_adresse AS adresse, 
             c.logement_type AS type, c.date_arrivee, c.date_depart, c.loyer_mensuel,
             (SELECT url FROM property_images WHERE property_id = c.logement_id LIMIT 1) AS photo
      FROM contrats_locatifs c
      WHERE c.locataire_id = $1 AND c.statut = 'actif'
      ORDER BY c.date_arrivee ASC`,
      [userId]
    );
    const contrats = contratsResult.rows;

    console.log('==================== RÉSULTAT REQUÊTE PRINCIPALE ====================');
    console.log('[API Loyers-Caution] Contrats ACTIFS trouvés:', contrats.length);
    contrats.forEach((contrat, index) => {
      console.log(`[API Loyers-Caution] Contrat actif ${index + 1}:`, {
        contrat_id: contrat.contrat_id,
        titre: contrat.titre,
        adresse: contrat.adresse,
        date_arrivee: contrat.date_arrivee,
        date_depart: contrat.date_depart
      });
    });
    console.log('====================================================================');

    // Si aucun contrat actif trouvé, testons une requête alternative
    if (contrats.length === 0) {
      console.log('==================== REQUÊTE ALTERNATIVE ====================');
      console.log('[DIAGNOSTIC] ❌ Aucun contrat actif trouvé, test avec requête alternative...');
      
      const contratsAlternativeResult = await db.query(
        `SELECT c.id AS contrat_id, c.reservation_id, c.logement_id, c.logement_nom AS titre, c.logement_adresse AS adresse, 
               c.logement_type AS type, c.date_arrivee, c.date_depart, c.loyer_mensuel, c.statut,
               (SELECT url FROM property_images WHERE property_id = c.logement_id LIMIT 1) AS photo
        FROM contrats_locatifs c
        WHERE c.locataire_id = $1 AND TRIM(LOWER(c.statut)) IN ('actif', 'active')
        ORDER BY c.date_arrivee ASC`,
        [userId]
      );
      
      console.log('[DIAGNOSTIC] Contrats trouvés avec requête alternative:', contratsAlternativeResult.rows.length);
      contratsAlternativeResult.rows.forEach((contrat, index) => {
        console.log(`[DIAGNOSTIC] Contrat alternatif ${index + 1}:`, {
          contrat_id: contrat.contrat_id,
          titre: contrat.titre,
          statut: `"${contrat.statut}"`
        });
      });
      console.log('============================================================');
    }

    const logements: Logement[] = [];
    for (const contrat of contrats) {
      console.log('[API Loyers-Caution] 🔍 Traitement du contrat:', contrat.contrat_id);
      
      // 2. Récupérer tous les loyers liés à ce contrat
      const loyersResult = await db.query(
        `SELECT l.id, l.mois_numero, l.date_debut, l.date_fin, l.date_limite_paiement, l.montant, l.statut, 
                l.date_paiement, l.facture_url
         FROM loyers l
         WHERE l.contrat_locatif_id = $1
         ORDER BY l.mois_numero ASC`,
        [contrat.contrat_id]
      );
      const loyers = loyersResult.rows;
      console.log('[API Loyers-Caution] 📋 Loyers trouvés pour contrat', contrat.contrat_id, ':', loyers.length);
      
      // 3. Construire la structure pour le front
      const periodes = [];
      let tousPrecedentsPayes = true;
      for (let i = 0; i < loyers.length; i++) {
        const loyer = loyers[i];
        let statut: 'payé' | 'en_attente' | 'en_retard' = 'en_attente';
        let datePayee = undefined;
        let facturePdfUrl = loyer.facture_url || undefined;
        // Statut
        if (loyer.statut === 'payé' || loyer.statut === 'A jour') {
            statut = 'payé';
          datePayee = loyer.date_paiement ? formatDate(new Date(loyer.date_paiement)) : undefined;
        } else if (loyer.statut === 'en_retard' || loyer.statut === 'En retard') {
            statut = 'en_retard';
        } else {
          // Si la date limite est dépassée, statut en_retard
          if (new Date() > new Date(loyer.date_limite_paiement)) {
            statut = 'en_retard';
          }
        }
        // Action possible
        let action: 'payer' | 'voir_recu' | null = null;
        if (statut === 'payé') {
          action = 'voir_recu';
        } else if (statut !== 'payé' && tousPrecedentsPayes) {
          action = 'payer';
        }
        if (statut !== 'payé') {
          tousPrecedentsPayes = false;
        }
        // Récupérer infos paiement si payé
        let methodePaiement = '-';
        let reference = '-';
        let note = '-';
        if (statut === 'payé') {
          const paiementRes = await db.query(
            `SELECT p.payment_method_id, p.kkiapay_transaction_id, pm.label AS payment_method_label
             FROM paiements p
             LEFT JOIN payment_methods pm ON p.payment_method_id = pm.id
             WHERE p.period = $1 AND p.reservation_id = $2 AND p.type = 'monthly' AND p.status = 'completed'
             ORDER BY p.created_at DESC LIMIT 1`,
            [loyer.date_debut, contrat.reservation_id]
          );
          const paiement = paiementRes.rows[0];
          console.log('[DIAGNOSTIC] PAIEMENT DEBUG pour loyer', loyer.id, ':', paiement);
          if (paiement) {
            methodePaiement = paiement.payment_method_label || (paiement.payment_method_id ? paiement.payment_method_id.toString() : '-');
            reference = paiement.kkiapay_transaction_id || '-';
          }
        }
        // Log pour debug
        console.log(`[LOYERS-API] 📊 Loyer #${loyer.mois_numero} action:`, action, 'statut:', statut);
        periodes.push({
          id: loyer.id,
          index: loyer.mois_numero,
          periode: { debut: formatDate(new Date(loyer.date_debut)), fin: formatDate(new Date(loyer.date_fin)) },
          montant: loyer.montant,
          dateLimite: formatDate(new Date(loyer.date_limite_paiement)),
          datePayee,
          statut,
          facturePdfUrl,
          action,
          methodePaiement,
          reference,
          note,
        });
      }
      logements.push({
        contratId: contrat.contrat_id,
        logementId: contrat.logement_id,
        titre: contrat.titre,
        adresse: contrat.adresse,
        type: contrat.type,
        photo: contrat.photo,
        periodeDebut: formatDate(new Date(contrat.date_arrivee)),
        periodeFin: formatDate(new Date(contrat.date_depart)),
        loyers: periodes,
      });
    }

    // Construction du tableau des prochains loyers pour chaque contrat
    const prochainsLoyers = contrats.map(contrat => {
      const loyers = logements.find((l: Logement) => l.contratId === contrat.contrat_id)?.loyers || [];
      // On cherche le prochain loyer à payer (en_attente ou en_retard, le plus proche)
      const prochain = loyers.find(l => l.statut !== 'payé');
      if (!prochain) return null;
      return {
        contratId: contrat.contrat_id,
        logement: { titre: contrat.titre, adresse: contrat.adresse },
        prochainLoyer: {
          montant: prochain.montant,
          dateLimite: prochain.dateLimite,
          statut: prochain.statut,
          paiementId: prochain.id,
        }
      };
    }).filter(Boolean);

    const responseData = { logements, prochainsLoyers };
    
    console.log('==================== RÉPONSE FINALE ====================');
    console.log('[API Loyers-Caution] 📊 Réponse finale:', {
      logementsCount: logements.length,
      prochainsLoyersCount: prochainsLoyers.length,
      logements: logements.map(l => ({
        contratId: l.contratId,
        titre: l.titre,
        loyersCount: l.loyers.length
      })),
      prochainsLoyers: prochainsLoyers.map(p => ({
        contratId: p.contratId,
        montant: p.prochainLoyer.montant,
        statut: p.prochainLoyer.statut
      }))
    });
    console.log('========================================================');

    res.status(200).json(responseData);
  } catch (error) {
    console.error('==================== ERREUR ====================');
    console.error('[API Loyers-Caution] ❌ Erreur:', error);
    console.error('[API Loyers-Caution] Stack:', error.stack);
    console.error('===============================================');
    res.status(500).json({ error: 'Erreur lors de la récupération des loyers & cautions' });
  }
} 