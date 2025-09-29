import { db } from '@/lib/db';

export interface PublicProperty {
  id: string;
  title: string;
  city: string;
  surface: number;
  statut: string;
  property_type_id: string;
  description: string;
  created_at: string;
  property_types?: {
    name: string;
  };
  property_images?: {
    url: string;
  }[];
  pricing?: {
    amount: number;
    currency: string;
  };
  caracteristiques: {
    chambre: number;
    salon: number;
    bureau: number;
  };
}

/**
 * Récupère toutes les propriétés publiées avec leurs détails
 */
export async function getPublicProperties(): Promise<PublicProperty[]> {
  const pool = db.getPool();
  if (!pool) throw new Error('Erreur de connexion à la base de données');

  try {
    // 1. Récupérer les propriétés de base avec leur type
    const propertiesResult = await pool.query(`
      SELECT 
        p.id,
        p.title,
        p.city,
        p.surface,
        p.statut,
        p.property_type_id,
        p.description,
        p.created_at,
        pt.name as property_type_name
      FROM properties p
      LEFT JOIN property_types pt ON p.property_type_id = pt.id
      WHERE p.statut = 'publie'
      ORDER BY p.created_at DESC
    `);

    if (propertiesResult.rows.length === 0) {
      return [];
    }

    const properties = propertiesResult.rows;
    const propertyIds = properties.map(p => p.id);

    // 2. Récupérer les images
    const imagesResult = await pool.query(`
      SELECT property_id, url
      FROM property_images
      WHERE property_id = ANY($1)
    `, [propertyIds]);

    // 3. Récupérer les prix
    const pricingResult = await pool.query(`
      SELECT property_id, amount, currency
      FROM property_pricing
      WHERE property_id = ANY($1)
    `, [propertyIds]);

    // 4. Récupérer les pièces et leurs types
    const roomsResult = await pool.query(`
      SELECT 
        r.property_id,
        rt.name as room_type
      FROM rooms r
      JOIN room_types rt ON r.room_type_id = rt.id
      WHERE r.property_id = ANY($1)
    `, [propertyIds]);

    // Organiser les images par propriété
    const imagesByProperty = imagesResult.rows.reduce((acc, img) => {
      if (!acc[img.property_id]) acc[img.property_id] = [];
      acc[img.property_id].push({ url: img.url });
      return acc;
    }, {});

    // Organiser les prix par propriété
    const pricingByProperty = pricingResult.rows.reduce((acc, price) => {
      acc[price.property_id] = {
        amount: price.amount,
        currency: price.currency
      };
      return acc;
    }, {});

    // Compter les pièces par type pour chaque propriété
    const roomsByProperty = roomsResult.rows.reduce((acc, room) => {
      if (!acc[room.property_id]) {
        acc[room.property_id] = { chambre: 0, salon: 0, bureau: 0 };
      }
      if (room.room_type === 'chambre') acc[room.property_id].chambre += 1;
      if (room.room_type === 'salon') acc[room.property_id].salon += 1;
      if (room.room_type === 'bureau') acc[room.property_id].bureau += 1;
      return acc;
    }, {});

    // Assembler toutes les données
    return properties.map(property => ({
      id: property.id,
      title: property.title,
      city: property.city,
      surface: property.surface,
      statut: property.statut,
      property_type_id: property.property_type_id,
      description: property.description,
      created_at: property.created_at,
      property_types: {
        name: property.property_type_name
      },
      property_images: imagesByProperty[property.id] || [],
      pricing: pricingByProperty[property.id],
      caracteristiques: roomsByProperty[property.id] || { chambre: 0, salon: 0, bureau: 0 }
    }));

  } catch (error) {
    console.error('[ERROR] Erreur lors de la récupération des propriétés publiques:', error);
    throw new Error('Erreur lors de la récupération des propriétés');
  }
} 