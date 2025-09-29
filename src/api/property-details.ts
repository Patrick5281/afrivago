import { db } from '@/lib/db';

export async function getPropertyDetails(propertyId: string) {
  const pool = db.getPool();
  if (!pool) throw new Error('Erreur de connexion à la base de données');

  try {
    // 1. Détails de la propriété
    const propertyQuery = `
      SELECT 
        p.*,
        pt.id as property_type_id,
        pt.name as property_type_name,
        pt.description as property_type_description,
        c.name as country_name,
        pp.amount,
        pp.currency,
        pt2.animals_allowed,
        pt2.parties_allowed,
        pt2.smoking_allowed,
        pt2.subletting_allowed
      FROM properties p
      LEFT JOIN property_types pt ON p.property_type_id = pt.id
      LEFT JOIN countries c ON p.country_id = c.id
      LEFT JOIN property_pricing pp ON p.id = pp.property_id
      LEFT JOIN property_terms pt2 ON p.id = pt2.property_id
      WHERE p.id = $1
    `;
    const { rows: [property] } = await pool.query(propertyQuery, [propertyId]);

    if (!property) {
      throw new Error('Propriété non trouvée');
    }

    // Formater la réponse
    const formattedProperty = {
      ...property,
      property_type: {
        id: property.property_type_id,
        name: property.property_type_name,
        description: property.property_type_description
      },
      country: property.country_name,
      property_pricing: {
        amount: property.amount,
        currency: property.currency
      },
      property_terms: {
        animals_allowed: property.animals_allowed,
        parties_allowed: property.parties_allowed,
        smoking_allowed: property.smoking_allowed,
        subletting_allowed: property.subletting_allowed
      }
    };

    // Supprimer les propriétés redondantes
    delete formattedProperty.property_type_id;
    delete formattedProperty.property_type_name;
    delete formattedProperty.property_type_description;
    delete formattedProperty.country_name;
    delete formattedProperty.amount;
    delete formattedProperty.currency;
    delete formattedProperty.animals_allowed;
    delete formattedProperty.parties_allowed;
    delete formattedProperty.smoking_allowed;
    delete formattedProperty.subletting_allowed;

    // 2. Images
    const imagesQuery = `
      SELECT url
      FROM property_images
      WHERE property_id = $1
      ORDER BY created_at DESC
    `;
    const { rows: images } = await pool.query(imagesQuery, [propertyId]);
    formattedProperty.property_images = images;

    // 3. Vidéo principale
    const videoQuery = `
      SELECT url
      FROM property_videos
      WHERE property_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const { rows: [video] } = await pool.query(videoQuery, [propertyId]);
    if (video) {
      formattedProperty.video = video;
    }

    // 4. Équipements généraux
    const generalEquipmentsQuery = `
      SELECT e.id, e.name
      FROM property_general_equipments pge
      JOIN general_equipments e ON pge.equipment_id = e.id
      WHERE pge.property_id = $1
    `;
    const { rows: generalEquipments } = await pool.query(generalEquipmentsQuery, [propertyId]);
    formattedProperty.equipments = generalEquipments;

    // 5. Pièces habitables (rooms) avec photos
    const roomsQuery = `
      SELECT 
        r.id,
        r.name,
        r.surface,
        r.description,
        rt.id as room_type_id,
        rt.name as room_type_name
      FROM rooms r
      LEFT JOIN room_types rt ON r.room_type_id = rt.id
      WHERE r.property_id = $1
    `;
    const { rows: rooms } = await pool.query(roomsQuery, [propertyId]);

    // Pour chaque pièce, récupérer les photos et les équipements
    const roomsWithDetails = await Promise.all(
      rooms.map(async (room) => {
        // Photos de la pièce
        const roomPhotosQuery = `
          SELECT url
          FROM room_photos
          WHERE room_id = $1
          ORDER BY created_at DESC
        `;
        const { rows: photos } = await pool.query(roomPhotosQuery, [room.id]);

        // Équipements de la pièce
        const roomEquipmentsQuery = `
          SELECT 
            re.id,
            re.quantity,
            re.custom_name,
            et.id as equipment_type_id,
            et.name as equipment_type_name
          FROM room_equipments re
          LEFT JOIN equipment_types et ON re.equipment_type_id = et.id
          WHERE re.room_id = $1
        `;
        const { rows: equipments } = await pool.query(roomEquipmentsQuery, [room.id]);

        return {
          ...room,
          room_type: {
            id: room.room_type_id,
            name: room.room_type_name
          },
          photos: photos.map(p => p.url),
          room_equipments: equipments.map(e => ({
            id: e.id,
            name: e.custom_name || e.equipment_type_name,
            quantity: e.quantity
          }))
        };
      })
    );
    formattedProperty.rooms = roomsWithDetails;

    // 6. Pièces non habitables
    const nonHabitableRoomsQuery = `
      SELECT 
        pnr.id,
        pnr.surface,
        pnr.quantity,
        nrt.id as room_type_id,
        nrt.name as room_type_name
      FROM property_non_habitable_rooms pnr
      JOIN non_habitable_room_types nrt ON pnr.room_type_id = nrt.id
      WHERE pnr.property_id = $1
    `;
    const { rows: nonHabitableRooms } = await pool.query(nonHabitableRoomsQuery, [propertyId]);
    formattedProperty.nonHabitableRooms = nonHabitableRooms.map(room => ({
      ...room,
      room_type: {
        id: room.room_type_id,
        name: room.room_type_name
      }
    }));

    // 7. Unités locatives
    const rentalUnitsQuery = `
      SELECT 
        ru.id,
        ru.name,
        ru.description,
        ru.price_per_month
      FROM rental_units ru
      WHERE ru.property_id = $1
    `;
    const { rows: rentalUnits } = await pool.query(rentalUnitsQuery, [propertyId]);

    // Pour chaque unité, récupérer les pièces associées
    const rentalUnitsWithRooms = await Promise.all(
      rentalUnits.map(async (unit) => {
        const unitRoomsQuery = `
          SELECT 
            r.id,
            r.name,
            r.surface,
            r.description,
            rt.id as room_type_id,
            rt.name as room_type_name
          FROM rooms r
          LEFT JOIN room_types rt ON r.room_type_id = rt.id
          WHERE r.rental_unit_id = $1
        `;
        const { rows: rooms } = await pool.query(unitRoomsQuery, [unit.id]);

        // Pour chaque pièce de l'unité, récupérer les photos et les équipements
        const roomsWithDetails = await Promise.all(
          rooms.map(async (room) => {
            const roomPhotosQuery = `
              SELECT url
              FROM room_photos
              WHERE room_id = $1
              ORDER BY created_at DESC
            `;
            const { rows: photos } = await pool.query(roomPhotosQuery, [room.id]);

            const roomEquipmentsQuery = `
              SELECT 
                re.id,
                re.quantity,
                re.custom_name,
                et.id as equipment_type_id,
                et.name as equipment_type_name
              FROM room_equipments re
              LEFT JOIN equipment_types et ON re.equipment_type_id = et.id
              WHERE re.room_id = $1
            `;
            const { rows: equipments } = await pool.query(roomEquipmentsQuery, [room.id]);

            return {
              ...room,
              room_type: {
                id: room.room_type_id,
                name: room.room_type_name
              },
              room_photos: photos.map(p => ({ url: p.url })),
              room_equipments: equipments.map(e => ({
                id: e.id,
                name: e.custom_name || e.equipment_type_name,
                quantity: e.quantity
              }))
            };
          })
        );

        return {
          ...unit,
          rooms: roomsWithDetails
        };
      })
    );
    formattedProperty.rentalUnits = rentalUnitsWithRooms;

    return formattedProperty;
  } catch (error: any) {
    console.error('[ERROR] Erreur dans getPropertyDetails:', error);
    throw new Error(error.message || 'Erreur lors de la récupération des détails de la propriété');
  }
} 