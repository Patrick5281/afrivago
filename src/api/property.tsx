import { PropertyType, Country, Property, PropertyFormData } from '@/types/property';
import { db } from '@/lib/db';
import path from 'path';
import fs from 'fs/promises';

export interface PropertyDetails extends Property {
  property_types: { name: string };
  countries: { name: string };
  property_images: { url: string }[];
  property_videos: { url: string }[];
  property_terms: {
    animals_allowed: boolean;
    parties_allowed: boolean;
    smoking_allowed: boolean;
    subletting_allowed: boolean;
  };
  property_pricing: {
    amount: number;
    currency: string;
  };
}

export interface Property {
  id: string;
  title: string;
  property_type_id: string;
  statut: 'draft' | 'publie';
  city: string;
  surface: number;
  created_at: string;
  created_by: string;
}

export const propertyService = {

  async getCountries(): Promise<Country[]> {
    const pool = db.getPool();
    if (!pool) throw new Error('Pool de connexion non initialisé');
    const { rows } = await pool.query('SELECT * FROM countries ORDER BY name');
    return rows;
  },

  async createProperty(formData: PropertyFormData & { created_by?: string }): Promise<Property> {
    const pool = db.getPool();
    if (!pool) throw new Error('Pool de connexion non initialisé');

    const query = `
      INSERT INTO properties (
        title, property_type_id, country_id, city, full_address, postal_code,
        surface, year_built, statut, created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      RETURNING *
    `;
    const values = [
      formData.title, formData.property_type_id, formData.country_id, formData.city,
      formData.full_address, formData.postal_code, formData.surface,
      formData.year_built, 'draft', formData.created_by
    ];
    const { rows } = await pool.query(query, values);
    if (rows.length === 0) {
      throw new Error('Erreur lors de la création de la propriété');
    }
    return rows[0];
  },
  
  async updateProperty(propertyId: string, updates: Partial<Property>): Promise<Property> {
    const pool = db.getPool();
    if (!pool) throw new Error('Pool de connexion non initialisé');

    if (!propertyId) throw new Error('ID de propriété requis');

    const setClauses: string[] = [];
    const values: any[] = [];
    
    const allowedFields: (keyof Property)[] = [
      'title', 'property_type_id', 'statut', 'city', 'surface'
      // Ajoutez d'autres champs de l'interface Property si nécessaire
    ];

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        setClauses.push(`${field} = $${values.length + 2}`);
        values.push(updates[field]);
      }
    });
    
    // Pour les champs qui ne sont pas dans l'interface Property mais dans la DB
    const otherAllowedFields = [
       'country_id', 'district', 'postal_code', 'full_address', 'year_built', 
       'description', 'latitude', 'longitude', 'rental_type', 'terms_accepted', 'terms_accepted_at'
    ];

    otherAllowedFields.forEach(field => {
        if ((updates as any)[field] !== undefined) {
            setClauses.push(`${field} = $${values.length + 2}`);
            values.push((updates as any)[field]);
        }
    });

    if (setClauses.length === 0) {
        const currentProperty = await getPropertyById(propertyId);
        if (!currentProperty) throw new Error("Propriété non trouvée");
        return currentProperty;
    }

    const query = `
      UPDATE properties 
      SET ${setClauses.join(', ')}, updated_at = NOW() 
      WHERE id = $1 
      RETURNING *`;

    const { rows } = await pool.query(query, [propertyId, ...values]);

    if (rows.length === 0) throw new Error('Propriété non trouvée ou échec de la mise à jour');
    
    return rows[0];
  },

  async getPropertyImages(propertyId: string) {
    const pool = db.getPool();
    if (!pool) throw new Error('Pool de connexion non initialisé');
    const { rows } = await pool.query(
      "SELECT * FROM property_images WHERE property_id = $1 ORDER BY created_at DESC",
      [propertyId]
    );
    return rows;
  },

  async addPropertyImage(propertyId: string, file: any) {
    const dir = path.join(process.cwd(), 'public', 'uploads', 'properties', propertyId, 'images', 'global');
    await fs.mkdir(dir, { recursive: true });
    const fileName = `${Date.now()}-${file.originalFilename?.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const filePath = path.join(dir, fileName);
    const buffer = await fs.readFile(file.filepath);
    await fs.writeFile(filePath, buffer);
    const url = `/uploads/properties/${propertyId}/images/global/${fileName}`;
    const pool = db.getPool();
    if (!pool) throw new Error('Pool de connexion non initialisé');
    const { rows } = await pool.query(
      "INSERT INTO property_images (property_id, url, created_at) VALUES ($1, $2, NOW()) RETURNING *",
      [propertyId, url]
    );
    return rows[0];
  },

  async deletePropertyImage(imageId: string) {
    const pool = db.getPool();
    if (!pool) throw new Error('Pool de connexion non initialisé');
    const { rows } = await pool.query("SELECT url FROM property_images WHERE id = $1", [imageId]);
    if (!rows[0]) throw new Error('Image non trouvée');
    const url = rows[0].url;
    const filePath = path.join(process.cwd(), 'public', url);
    await fs.unlink(filePath).catch(() => {});
    await pool.query("DELETE FROM property_images WHERE id = $1", [imageId]);
    return true;
  },

  async getUserProperties(userId: string): Promise<Property[]> {
    const pool = db.getPool();
    if (!pool) throw new Error('Pool de connexion non initialisé');
    const { rows } = await pool.query(
      `SELECT id, title, property_type_id, statut, city, surface, created_at, created_by 
       FROM properties WHERE created_by = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return rows;
  },

  async deleteProperty(propertyId: string): Promise<void> {
    const pool = db.getPool();
    if (!pool) throw new Error('Pool de connexion non initialisé');
    await pool.query('DELETE FROM properties WHERE id = $1', [propertyId]);
  },

  async updatePropertyStatus(propertyId: string, statut: 'draft' | 'publie'): Promise<void> {
    const pool = db.getPool();
    if (!pool) throw new Error('Pool de connexion non initialisé');
    await pool.query('UPDATE properties SET statut = $1 WHERE id = $2', [statut, propertyId]);
  },

  async getPropertyDescription(propertyId: string): Promise<string | null> {
    const pool = db.getPool();
    if (!pool) throw new Error('Pool de connexion non initialisé');
    const { rows } = await pool.query('SELECT description FROM properties WHERE id = $1', [propertyId]);
    return rows[0]?.description || null;
  },

  async updatePropertyDescription(propertyId: string, description: string): Promise<void> {
    const pool = db.getPool();
    if (!pool) throw new Error('Pool de connexion non initialisé');
    await pool.query('UPDATE properties SET description = $1, updated_at = NOW() WHERE id = $2', [description, propertyId]);
  },

  async getTerms(): Promise<any[]> {
    const pool = db.getPool();
    if (!pool) throw new Error('Pool de connexion non initialisé');
    const { rows } = await pool.query('SELECT * FROM terms ORDER BY id');
    return rows;
  },

  async getPropertyTerms(propertyId: string): Promise<any> {
    const pool = db.getPool();
    if (!pool) throw new Error('Pool de connexion non initialisé');
    const { rows } = await pool.query('SELECT * FROM property_terms WHERE property_id = $1', [propertyId]);
    return rows[0] || null;
  },

  async upsertPropertyTerms(propertyId: string, payload: any): Promise<void> {
    const pool = db.getPool();
    if (!pool) throw new Error('Pool de connexion non initialisé');
    const { rows } = await pool.query('SELECT property_id FROM property_terms WHERE property_id = $1', [propertyId]);
    if (rows.length > 0) {
      const updateFields = Object.keys(payload).filter(key => key !== 'property_id').map((key, index) => `${key} = $${index + 2}`).join(', ');
      const values = [propertyId, ...Object.values(payload).filter(value => value !== propertyId)];
      await pool.query(`UPDATE property_terms SET ${updateFields}, updated_at = NOW() WHERE property_id = $1`, values);
    } else {
      delete payload.updated_at;
      const fields = Object.keys(payload).join(', ');
      const values = Object.values(payload);
      const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
      await pool.query(`INSERT INTO property_terms (${fields}, updated_at) VALUES (${placeholders}, NOW())`, values);
    }
  },

  async cleanupPropertyData(propertyId: string): Promise<void> {
    const pool = db.getPool();
    if (!pool) throw new Error('Pool de connexion non initialisé');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const propertyRes = await client.query('SELECT rental_type FROM properties WHERE id = $1', [propertyId]);
      if (propertyRes.rows.length === 0) throw new Error('Propriété non trouvée pour le nettoyage');
      const rentalType = propertyRes.rows[0].rental_type;
      if (rentalType === 'entire') {
        await client.query(`DELETE FROM rooms WHERE rental_unit_id IN (SELECT id FROM rental_units WHERE property_id = $1)`, [propertyId]);
        await client.query(`DELETE FROM rental_units WHERE property_id = $1`, [propertyId]);
      } else if (rentalType === 'unit') {
        await client.query(`DELETE FROM rooms WHERE property_id = $1 AND rental_unit_id IS NULL`, [propertyId]);
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error('Erreur lors du nettoyage des données de la propriété');
    } finally {
      client.release();
    }
  },

  async savePropertyDraft(formData: Partial<PropertyFormData>): Promise<void> {
    localStorage.setItem('propertyDraft', JSON.stringify(formData));
  },

  getPropertyDraft(): Partial<PropertyFormData> | null {
    const draft = localStorage.getItem('propertyDraft');
    return draft ? JSON.parse(draft) : null;
  },

  clearPropertyDraft(): void {
    localStorage.removeItem('propertyDraft');
  },

  async getEquipmentTypesMap(): Promise<EquipmentMap> {
    // const { data, error } = await supabase
    //   .from('type_equipment')
    //   .select('*');

    // if (error) throw new Error(`Erreur lors de la récupération des types d'équipements: ${error.message}`);
    // if (!data) return {};

    // Regrouper par room_type
    // const map: EquipmentMap = {};
    // data.forEach((eq: TypeEquipment) => {
    //   if (!map[eq.room_type]) map[eq.room_type] = [];
    //   map[eq.room_type].push(eq);
    // });
    // return map;
  },

  /**
   * Met à jour le type de propriété
   */
    async updatePropertyType(propertyId: string, propertyTypeId: string): Promise<void> {
  const pool = db.getPool();
  if (!pool) throw new Error('Pool de connexion non initialisé');

  try {
    console.log('[DEBUG] Mise à jour du type de propriété:', { propertyId, propertyTypeId });
    
    const result = await pool.query(
      'UPDATE properties SET property_type_id = $1, updated_at = NOW() WHERE id = $2',
      [propertyTypeId, propertyId]
    );
    
    if (result.rowCount === 0) {
      throw new Error('Propriété non trouvée ou aucune mise à jour effectuée');
    }
    
    console.log('[DEBUG] Type de propriété mis à jour avec succès');
  } catch (error) {
    console.error('[ERROR] Erreur lors de la mise à jour du type de propriété:', error);
    
    // Propager l'erreur avec plus de détails
    if (error instanceof Error) {
      throw new Error(`Erreur lors de la mise à jour du type de propriété: ${error.message}`);
    }
    throw new Error('Erreur inconnue lors de la mise à jour du type de propriété');
  }
}
};

export const getCountries = propertyService.getCountries;
export const getPropertyDescription = propertyService.getPropertyDescription;
export const updatePropertyDescription = propertyService.updatePropertyDescription;
export const getTerms = propertyService.getTerms;
export const getPropertyTerms = propertyService.getPropertyTerms;
export const upsertPropertyTerms = propertyService.upsertPropertyTerms;
export const updatePropertyType = propertyService.updatePropertyType;

/**
 * Récupère les types de pièces non habitables
 */
export async function getNonHabitableRoomTypes() {
  const pool = db.getPool();
  if (!pool) throw new Error('Pool de connexion non initialisé');
  const { rows } = await pool.query(
    "SELECT id, name FROM non_habitable_room_types ORDER BY name"
  );
  return rows;
}

/**
 * Récupère les pièces non habitables d'une propriété
 */
export async function getPropertyNonHabitableRooms(propertyId: string) {
  const pool = db.getPool();
  if (!pool) throw new Error('Pool de connexion non initialisé');
  const { rows } = await pool.query(
    "SELECT room_type_id, quantity, surface FROM property_non_habitable_rooms WHERE property_id = $1",
    [propertyId]
  );
  return rows;
}

/**
 * Remplace toutes les pièces non habitables d'une propriété
 */
export async function replacePropertyNonHabitableRooms(propertyId: string, inserts: any[]) {
  const pool = db.getPool();
  if (!pool) throw new Error('Pool de connexion non initialisé');
  await pool.query("DELETE FROM property_non_habitable_rooms WHERE property_id = $1", [propertyId]);
  for (const insert of inserts) {
    await pool.query(
      "INSERT INTO property_non_habitable_rooms (property_id, room_type_id, quantity, surface) VALUES ($1, $2, $3, $4)",
      [propertyId, insert.room_type_id, insert.quantity, insert.surface]
    );
  }
}

interface PropertyVideo {
  id: string;
  property_id: string;
  url: string;
  created_at: string;
}

/**
 * Récupère la vidéo d'une propriété
 */
export async function getPropertyVideo(propertyId: string): Promise<PropertyVideo | null> {
  const pool = db.getPool();
  if (!pool) throw new Error('Pool de connexion non initialisé');
  const { rows } = await pool.query("SELECT * FROM property_videos WHERE property_id = $1 ORDER BY created_at DESC LIMIT 1", [propertyId]);
  return rows[0] || null;
}

/**
 * Ajoute une vidéo à une propriété
 */
export async function insertPropertyVideo(propertyId: string, file: any): Promise<PropertyVideo> {
  const pool = db.getPool();
  if (!pool) throw new Error('Pool de connexion non initialisé');
  const videoDir = path.join(process.cwd(), 'public', 'uploads', 'properties', propertyId, 'videos');
  await fs.mkdir(videoDir, { recursive: true });
  const fileName = `${Date.now()}-${path.basename(file.originalFilename).replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const destinationPath = path.join(videoDir, fileName);
  const buffer = await fs.readFile(file.filepath);
  await fs.writeFile(destinationPath, buffer);
  await fs.unlink(file.filepath);
  const publicUrl = `/uploads/properties/${propertyId}/videos/${fileName}`;
  const { rows } = await pool.query(`INSERT INTO property_videos (property_id, url, created_at) VALUES ($1, $2, NOW()) RETURNING *`, [propertyId, publicUrl]);
  if (rows.length === 0) throw new Error("Erreur lors de l'enregistrement en base de données");
  return rows[0];
}

/**
 * Supprime une vidéo d'une propriété
 */
export async function deletePropertyVideo(videoId: string): Promise<boolean> {
  const pool = db.getPool();
  if (!pool) throw new Error('Pool de connexion non initialisé');
  const { rows } = await pool.query("SELECT url FROM property_videos WHERE id = $1", [videoId]);
  if (rows.length === 0) throw new Error('Vidéo non trouvée');
  const videoUrl = rows[0].url;
  const filePath = path.join(process.cwd(), 'public', videoUrl);
  try { await fs.unlink(filePath); } catch (fileError) { console.warn('[WARN] Impossible de supprimer le fichier physique:', fileError); }
  await pool.query("DELETE FROM property_videos WHERE id = $1", [videoId]);
  return true;
}

/**
 * Récupère toutes les vidéos d'une propriété
 */
export async function getPropertyVideos(propertyId: string): Promise<PropertyVideo[]> {
  const pool = db.getPool();
  if (!pool) throw new Error('Pool de connexion non initialisé');
  const { rows } = await pool.query("SELECT * FROM property_videos WHERE property_id = $1 ORDER BY created_at DESC", [propertyId]);
  return rows;
}

// --- PRICING (LOYER, COMMISSION, DEVISES) ---

/**
 * Récupère toutes les devises disponibles
 */
export async function getCurrencies() {
  const pool = db.getPool();
  if (!pool) throw new Error('Pool de connexion non initialisé');
  const { rows } = await pool.query('SELECT code, name FROM public.currencies ORDER BY code ASC');
  return rows;
}

/**
 * Récupère la commission active de la plateforme
 */
export async function getActiveCommission() {
  const pool = db.getPool();
  if (!pool) throw new Error('Pool de connexion non initialisé');
  const { rows } = await pool.query('SELECT id, percentage, is_active FROM public.platform_commission WHERE is_active = true ORDER BY created_at DESC LIMIT 1');
  return rows[0] || null;
}

/**
 * Récupère le prix d'un bien
 */
export async function getPropertyPricing(propertyId: string) {
  const pool = db.getPool();
  if (!pool) throw new Error('Pool de connexion non initialisé');
  const { rows } = await pool.query('SELECT amount, currency FROM public.property_pricing WHERE property_id = $1 LIMIT 1', [propertyId]);
  return rows[0] || null;
}

/**
 * Insère ou met à jour le prix d'un bien
 */
export async function upsertPropertyPricing(propertyId: string, amount: number, currency: string) {
  const pool = db.getPool();
  if (!pool) throw new Error('Pool de connexion non initialisé');
  await pool.query(
    `INSERT INTO public.property_pricing (property_id, amount, currency, updated_at)
     VALUES ($1, $2, $3, NOW()) ON CONFLICT (property_id) DO UPDATE SET amount = $2, currency = $3, updated_at = NOW()`,
    [propertyId, amount, currency]
  );
}

/**
 * Récupère une propriété par son ID
 */
export async function getPropertyById(id: string): Promise<Property | null> {
  const pool = db.getPool();
  if (!pool) throw new Error('Pool de connexion non initialisé');
  const { rows } = await pool.query(`SELECT * FROM properties WHERE id = $1`, [id]);
  return rows[0] || null;
}

