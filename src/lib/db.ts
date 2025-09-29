import { Pool } from 'pg';

// Classe singleton pour la gestion de la connexion à la base de données
class Database {
  private static instance: Database;
  private pool: Pool | null = null;

  private constructor() {
    if (typeof window === 'undefined') { // Vérification côté serveur
      this.pool = new Pool({
        user: process.env.POSTGRES_USER || 'postgres',
        host: process.env.POSTGRES_HOST || 'localhost',
        database: process.env.POSTGRES_DB || 'app_db',
        password: process.env.POSTGRES_PASSWORD || 'P@tr2004',
        port: parseInt(process.env.POSTGRES_PORT || '5432'),
      });

      // Test de la connexion
      this.pool.connect((err, client, release) => {
        if (err) {
          console.error('Erreur de connexion à la base de données:', err.stack);
          return;
        }
        console.log('Connexion à la base de données établie avec succès!');
        release();
      });
    }
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async query(text: string, params?: any[]) {
    if (typeof window !== 'undefined') {
      throw new Error('Les requêtes à la base de données ne peuvent être exécutées que côté serveur');
    }

    if (!this.pool) {
      throw new Error('Pool de connexion non initialisé');
    }

    try {
      const start = Date.now();
      const res = await this.pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Requête exécutée:', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error('Erreur lors de l\'exécution de la requête:', error);
      throw error;
    }
  }

  public getPool(): Pool | null {
    return this.pool;
  }
}

// Exporter une instance unique
export const db = Database.getInstance();
export const query = (text: string, params?: any[]) => db.query(text, params); 