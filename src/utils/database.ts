import { query } from '@/config/database';

// Types génériques pour les opérations CRUD
export type DatabaseRecord = {
  id: string | number;
  [key: string]: any;
};

// Fonctions CRUD génériques
export const dbOperations = {
  // Créer un enregistrement
  async create<T extends DatabaseRecord>(
    table: string,
    data: Omit<T, 'id'>
  ): Promise<T> {
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    const result = await query(
      `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    return result.rows[0];
  },

  // Lire un enregistrement par ID
  async findById<T extends DatabaseRecord>(
    table: string,
    id: string | number
  ): Promise<T | null> {
    const result = await query(
      `SELECT * FROM ${table} WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  // Mettre à jour un enregistrement
  async update<T extends DatabaseRecord>(
    table: string,
    id: string | number,
    data: Partial<T>
  ): Promise<T> {
    const entries = Object.entries(data);
    const setClause = entries
      .map((_, i) => `${entries[i][0]} = $${i + 2}`)
      .join(', ');
    const values = [id, ...Object.values(data)];

    const result = await query(
      `UPDATE ${table} SET ${setClause} WHERE id = $1 RETURNING *`,
      values
    );
    return result.rows[0];
  },

  // Supprimer un enregistrement
  async delete(table: string, id: string | number): Promise<void> {
    await query(`DELETE FROM ${table} WHERE id = $1`, [id]);
  },

  // Lister tous les enregistrements
  async findAll<T extends DatabaseRecord>(
    table: string,
    conditions?: Record<string, any>
  ): Promise<T[]> {
    let sql = `SELECT * FROM ${table}`;
    const values: any[] = [];

    if (conditions) {
      const entries = Object.entries(conditions);
      if (entries.length > 0) {
        const whereClause = entries
          .map((_, i) => `${entries[i][0]} = $${i + 1}`)
          .join(' AND ');
        sql += ` WHERE ${whereClause}`;
        values.push(...Object.values(conditions));
      }
    }

    const result = await query(sql, values);
    return result.rows;
  }
}; 