/**
 * Configuration de la base de données SQLite (sql.js)
 * Database configuration for SQLite using sql.js
 *
 * @module config/database
 * @author Renault Group - Service 00596
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

// Chemin de la base de données / Database path
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../database/tst_manager.db');

// Instance de la base de données / Database instance
let db = null;
let SQL = null;

/**
 * Initialise la connexion à la base de données
 * Initialize database connection
 *
 * @returns {Promise<Object>} Instance de la base de données
 */
async function initDatabase() {
  if (db) return db;

  try {
    // Initialiser SQL.js
    SQL = await initSqlJs();

    // Charger la base existante ou en créer une nouvelle
    let data = null;
    if (fs.existsSync(dbPath)) {
      data = fs.readFileSync(dbPath);
    }

    db = new SQL.Database(data ? new Uint8Array(data) : undefined);

    // Activer les clés étrangères / Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');

    console.log(`[DB] Connexion établie: ${dbPath}`);
    return db;
  } catch (error) {
    console.error('[DB] Erreur de connexion:', error.message);
    throw error;
  }
}

/**
 * Récupère l'instance de la base de données (synchrone après init)
 * Get database instance (synchronous after init)
 *
 * @returns {Object} Instance de la base de données
 */
function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Sauvegarde la base de données sur le disque
 * Save database to disk
 */
function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);

    // Créer le dossier si nécessaire
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(dbPath, buffer);
  }
}

/**
 * Ferme la connexion à la base de données
 * Close database connection
 */
function closeDatabase() {
  if (db) {
    saveDatabase();
    db.close();
    db = null;
    console.log('[DB] Connexion fermée');
  }
}

/**
 * Wrapper pour les méthodes de base de données compatibles avec better-sqlite3
 * Wrapper for database methods compatible with better-sqlite3 API
 */
class DatabaseWrapper {
  constructor(sqlDb) {
    this._db = sqlDb;
  }

  exec(sql) {
    this._db.run(sql);
    saveDatabase();
  }

  prepare(sql) {
    return new StatementWrapper(this._db, sql);
  }

  pragma(pragma) {
    this._db.run(`PRAGMA ${pragma}`);
  }
}

class StatementWrapper {
  constructor(db, sql) {
    this._db = db;
    this._sql = sql;
  }

  run(...params) {
    this._db.run(this._sql, params);
    saveDatabase();
    return { changes: this._db.getRowsModified() };
  }

  get(...params) {
    const stmt = this._db.prepare(this._sql);
    stmt.bind(params);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return undefined;
  }

  all(...params) {
    const results = [];
    const stmt = this._db.prepare(this._sql);
    stmt.bind(params);
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }
}

// Exporter une version wrappée de getDatabase
function getWrappedDatabase() {
  return new DatabaseWrapper(getDatabase());
}

module.exports = {
  initDatabase,
  getDatabase: getWrappedDatabase,
  closeDatabase,
  saveDatabase
};
