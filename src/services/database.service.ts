import { query } from '@/lib/db';

export interface DatabaseError {
  code: string;
  message: string;
}

// Fonctions pour les utilisateurs
export const createUser = async (email: string, hashedPassword: string) => {
  try {
    const result = await query(
      `INSERT INTO users (email, password)
       VALUES ($1, $2)
       RETURNING id, email, created_at`,
      [email, hashedPassword]
    );
    return { data: result.rows[0] };
  } catch (error: any) {
    return {
      error: {
        code: error.code || 'unknown',
        message: error.message || 'Erreur lors de la création de l\'utilisateur'
      }
    };
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    const result = await query(
      `SELECT u.*, r.name as role_name 
       FROM users u 
       LEFT JOIN user_roles ur ON u.id = ur.user_id 
       LEFT JOIN roles r ON ur.role_id = r.id 
       WHERE u.email = $1`,
      [email]
    );
    return { data: result.rows[0] };
  } catch (error: any) {
    return {
      error: {
        code: error.code || 'unknown',
        message: error.message || 'Erreur lors de la récupération de l\'utilisateur'
      }
    };
  }
};

// Fonctions pour les rôles
export const assignUserRole = async (userId: string, roleId: string) => {
  try {
    await query(
      `INSERT INTO user_roles (user_id, role_id)
       VALUES ($1, $2)`,
      [userId, roleId]
    );
    return { data: true };
  } catch (error: any) {
    return {
      error: {
        code: error.code || 'unknown',
        message: error.message || 'Erreur lors de l\'attribution du rôle'
      }
    };
  }
};

export const getRoles = async () => {
  try {
    const result = await query('SELECT * FROM roles');
    return { data: result.rows };
  } catch (error: any) {
    return {
      error: {
        code: error.code || 'unknown',
        message: error.message || 'Erreur lors de la récupération des rôles'
      }
    };
  }
};

// Fonctions pour les propriétés
export const getProperties = async () => {
  try {
    const result = await query(
      `SELECT p.*, u.email as owner_email
       FROM properties p
       JOIN users u ON p.owner_id = u.id
       WHERE p.status = 'published'`
    );
    return { data: result.rows };
  } catch (error: any) {
    return {
      error: {
        code: error.code || 'unknown',
        message: error.message || 'Erreur lors de la récupération des propriétés'
      }
    };
  }
};

export const createProperty = async (
  ownerId: string,
  title: string,
  description: string,
  address: string,
  city: string,
  postalCode: string,
  country: string,
  propertyType: string
) => {
  try {
    const result = await query(
      `INSERT INTO properties 
       (owner_id, title, description, address, city, postal_code, country, property_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [ownerId, title, description, address, city, postalCode, country, propertyType]
    );
    return { data: result.rows[0] };
  } catch (error: any) {
    return {
      error: {
        code: error.code || 'unknown',
        message: error.message || 'Erreur lors de la création de la propriété'
      }
    };
  }
}; 