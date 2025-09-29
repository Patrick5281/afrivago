import { pool, query } from '../config/database';

async function testDatabaseConnection() {
  try {
    // Test de connexion simple
    const result = await query('SELECT NOW()');
    console.log('✅ Test de connexion réussi !');
    console.log('Heure du serveur:', result.rows[0].now);

    // Test de création d'une table temporaire
    await query(`
      CREATE TABLE IF NOT EXISTS test_connection (
        id SERIAL PRIMARY KEY,
        test_value VARCHAR(50)
      )
    `);
    console.log('✅ Création de table test réussie !');

    // Test d'insertion
    await query(
      'INSERT INTO test_connection (test_value) VALUES ($1)',
      ['Test réussi']
    );
    console.log('✅ Insertion de données réussie !');

    // Test de lecture
    const readResult = await query('SELECT * FROM test_connection');
    console.log('✅ Lecture de données réussie !');
    console.log('Données lues:', readResult.rows);

    // Nettoyage
    await query('DROP TABLE test_connection');
    console.log('✅ Nettoyage réussi !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    // Fermeture du pool de connexions
    await pool.end();
  }
}

// Exécution du test
testDatabaseConnection(); 