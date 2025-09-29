import { db } from '@/lib/db';

export interface Preference {
  id: string;
  label: string;
  category: 'status' | 'zone' | 'property_type' | 'budget';
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPreference {
  id: string;
  user_id: string;
  preference_id: string;
  preference_weight: number;
  created_at: string;
  updated_at: string;
}

export interface PreferencesByCategory {
  status: Preference[];
  zone: Preference[];
  property_type: Preference[];
  budget: Preference[];
}

export class PreferencesService {
  /**
   * Récupère toutes les préférences disponibles, organisées par catégorie
   */
  static async getAllPreferences(): Promise<PreferencesByCategory> {
    const pool = db.getPool();
    if (!pool) {
      throw new Error('Pool de connexion non initialisé');
    }

    const { rows } = await pool.query(`
      SELECT 
        id,
        label,
        category,
        description,
        is_active,
        created_at,
        updated_at
      FROM preferences 
      WHERE is_active = true 
      ORDER BY category, label
    `);

    // Organiser les données par catégorie
    const preferencesByCategory = rows.reduce((acc: any, preference: any) => {
      const { category, ...prefData } = preference;
      
      if (!acc[category]) {
        acc[category] = [];
      }
      
      acc[category].push(prefData);
      return acc;
    }, {});

    return {
      status: preferencesByCategory.status || [],
      zone: preferencesByCategory.zone || [],
      property_type: preferencesByCategory.property_type || [],
      budget: preferencesByCategory.budget || []
    };
  }

  /**
   * Récupère les préférences d'un utilisateur spécifique
   */
  static async getUserPreferences(userId: string): Promise<UserPreference[]> {
    const pool = db.getPool();
    if (!pool) {
      throw new Error('Pool de connexion non initialisé');
    }

    const { rows } = await pool.query(`
      SELECT 
        up.id,
        up.user_id,
        up.preference_id,
        up.preference_weight,
        up.created_at,
        up.updated_at,
        p.label,
        p.category,
        p.description
      FROM user_preferences up
      JOIN preferences p ON up.preference_id = p.id
      WHERE up.user_id = $1
      ORDER BY p.category, p.label
    `, [userId]);

    return rows;
  }

  /**
   * Sauvegarde les préférences d'un utilisateur
   */
  static async saveUserPreferences(userId: string, preferenceIds: string[]): Promise<void> {
    const pool = db.getPool();
    if (!pool) {
      throw new Error('Pool de connexion non initialisé');
    }

    // Commencer une transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Supprimer les anciennes préférences de l'utilisateur
      await client.query('DELETE FROM user_preferences WHERE user_id = $1', [userId]);

      // Insérer les nouvelles préférences
      for (const preferenceId of preferenceIds) {
        await client.query(`
          INSERT INTO user_preferences (user_id, preference_id, preference_weight)
          VALUES ($1, $2, $3)
        `, [userId, preferenceId, 1]); // poids par défaut = 1
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Met à jour les préférences d'un utilisateur
   */
  static async updateUserPreferences(userId: string, preferenceIds: string[]): Promise<void> {
    return this.saveUserPreferences(userId, preferenceIds);
  }

  /**
   * Supprime toutes les préférences d'un utilisateur
   */
  static async deleteUserPreferences(userId: string): Promise<void> {
    const pool = db.getPool();
    if (!pool) {
      throw new Error('Pool de connexion non initialisé');
    }

    await pool.query('DELETE FROM user_preferences WHERE user_id = $1', [userId]);
  }
}

export const preferencesService = new PreferencesService(); 