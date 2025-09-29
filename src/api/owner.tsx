import { db } from '@/lib/db';

// Récupérer les types de pièces disponibles
export async function getTypePieces() {
  const pool = db.getPool();
  if (!pool) throw new Error('Pool de connexion non initialisé');
  const { rows } = await pool.query('SELECT id, labelle FROM typepiece ORDER BY labelle');
  console.log("typePieces", rows);
  return rows;
}

// Uploader un fichier sur le serveur local (à adapter si besoin)
export async function uploadFile(file: any, pathPrefix = "owner-requests") {
  // À implémenter si tu veux gérer l'upload réel côté serveur
  // Pour l'instant, retourne null ou le nom du fichier
  if (!file) return null;
  return file.name || null;
}

// Soumettre la demande propriétaire
export async function submitOwnerRequest({
  user_id,
  nom_complet,
  telephone,
  adresse,
  type_piece_id,
  numero_piece,
  message,
  pieceFile,
  titreFoncierFile,
}: any) {
  console.log("submitOwnerRequest params :", { user_id, nom_complet, telephone, adresse, type_piece_id, numero_piece, message });
  const pool = db.getPool();
  if (!pool) throw new Error('Pool de connexion non initialisé');

  // Vérifier unicité de la demande
  const { rows: existing } = await pool.query(
    'SELECT id FROM demandeowner WHERE user_id = $1',
    [user_id]
  );
  if (existing.length > 0) throw new Error("Vous avez déjà une demande en cours ou traitée.");

  // Upload des fichiers (ici, on stocke juste le nom)
  const fichier_piece_url = await uploadFile(pieceFile);
  const titre_foncier_url = titreFoncierFile ? await uploadFile(titreFoncierFile) : null;

  // 1. Créer la demande
  const { rows: demandeRows } = await pool.query(
    `INSERT INTO demandeowner (user_id, nom_complet, telephone, adresse, message, created_at)
     VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id`,
    [user_id, nom_complet, telephone, adresse, message]
  );
  const demandeId = demandeRows[0].id;

  // 2. Créer la pièce justificative
  await pool.query(
    `INSERT INTO piecesjustificatifs (user_id, type_piece_id, numero_piece, fichier_piece, titre_foncier)
     VALUES ($1, $2, $3, $4, $5)`,
    [user_id, type_piece_id, numero_piece, fichier_piece_url, titre_foncier_url]
  );

  // 3. Statut initial "en cours"
  const { rows: statusRows } = await pool.query(
    `SELECT id FROM status WHERE libelle = 'en cours' LIMIT 1`
  );
  const statusId = statusRows[0]?.id;
  await pool.query(
    `INSERT INTO statutdemandeowner (demande_id, status_id, motif_refus)
     VALUES ($1, $2, NULL)`,
    [demandeId, statusId]
  );

  return true;
}

// Récupérer le statut de la demande propriétaire pour un utilisateur
export async function getOwnerRequestStatus(user_id: string) {
  const pool = db.getPool();
  if (!pool) throw new Error('Pool de connexion non initialisé');
  // Récupérer la demande
  const { rows: demandes } = await pool.query(
    `SELECT id, nom_complet, telephone, adresse, message, created_at FROM demandeowner WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [user_id]
  );
  console.log('Demandes trouvées pour user_id', user_id, ':', demandes);
  if (demandes.length === 0) throw new Error('Aucune demande trouvée');
  const demande = demandes[0];

  // Récupérer le statut
  const { rows: statuts } = await pool.query(
    `SELECT s.libelle as statut, sd.motif_refus, sd.updated_at
     FROM statutdemandeowner sd
     JOIN status s ON sd.status_id = s.id
     WHERE sd.demande_id = $1
     ORDER BY sd.updated_at DESC LIMIT 1`,
    [demande.id]
  );
  console.log('Statuts trouvés pour demande_id', demande.id, ':', statuts);
  const statut = statuts[0] || {};
  return {
    ...demande,
    statut: statut.statut,
    motif_refus: statut.motif_refus,
    updated_at: statut.updated_at,
  };
}

// Récupérer les biens d'un utilisateur (avec image principale et prix)
export async function getUserProperties(user_id: string) {
  const pool = db.getPool();
  if (!pool) throw new Error('Pool de connexion non initialisé');
  // Jointure pour récupérer la première image et le prix
  const { rows } = await pool.query(
    `SELECT p.*, 
      (SELECT url FROM property_images WHERE property_id = p.id ORDER BY created_at ASC LIMIT 1) as image_url,
      (SELECT amount FROM property_pricing WHERE property_id = p.id LIMIT 1) as price,
      (SELECT currency FROM property_pricing WHERE property_id = p.id LIMIT 1) as currency
    FROM properties p
    WHERE p.created_by = $1
    ORDER BY p.created_at DESC`,
    [user_id]
  );
  return rows;
}


