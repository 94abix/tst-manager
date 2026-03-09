/**
 * Script de migration de la base de données
 * Database Migration Script
 *
 * @module database/migrate
 * @author Renault Group - Service 00596
 */

const { getDatabase } = require('../src/config/database');

/**
 * Exécute les migrations de la base de données
 * Run database migrations
 */
function runMigrations() {
  const db = getDatabase();

  console.log('[Migration] Création des tables...');

  // ============================================
  // TABLE: users
  // ============================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      matricule TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      nom TEXT NOT NULL,
      prenom TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      last_login TEXT
    )
  `);
  console.log('[Migration] Table users créée');

  // ============================================
  // TABLE: interveners
  // ============================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS interveners (
      id TEXT PRIMARY KEY,
      matricule TEXT UNIQUE NOT NULL,
      nom TEXT NOT NULL,
      prenom TEXT NOT NULL,
      entreprise TEXT NOT NULL,
      fonction TEXT NOT NULL,
      type_habilitation TEXT NOT NULL,
      date_validite_hab TEXT NOT NULL,
      actif INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      created_by TEXT
    )
  `);
  console.log('[Migration] Table interveners créée');

  // ============================================
  // TABLE: tst_forms
  // ============================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS tst_forms (
      id TEXT PRIMARY KEY,
      reference_tst TEXT UNIQUE NOT NULL,
      statut TEXT NOT NULL DEFAULT 'brouillon',

      date_ordre TEXT,
      type_batterie TEXT,
      identification_bin TEXT,
      lieu_intervention TEXT,
      nature_travaux TEXT,
      indications_complementaires TEXT,
      autorisation_debut TEXT,
      autorisation_fin TEXT,
      delai_fin_travail TEXT,
      impossibilite_technique TEXT,

      responsable_exploitation_id TEXT,
      charge_travaux_ordre_id TEXT,
      charge_travaux_debut_id TEXT,
      executant_id TEXT,
      surveillant_securite_id TEXT,
      charge_travaux_fin_id TEXT,
      responsable_fin_id TEXT,

      signature_resp_ordre TEXT,
      signature_charge_ordre TEXT,
      signature_charge_debut TEXT,
      signature_executant TEXT,
      signature_surveillant TEXT,
      signature_charge_fin TEXT,
      signature_resp_fin TEXT,

      date_debut_travail TEXT,
      date_fin_travail TEXT,
      etat_batterie_fin TEXT,

      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      validated_at TEXT,
      archived_at TEXT,
      created_by TEXT,
      validated_by TEXT
    )
  `);
  console.log('[Migration] Table tst_forms créée');

  // ============================================
  // TABLE: audit_logs
  // ============================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      tst_form_id TEXT,
      user_id TEXT,
      action TEXT NOT NULL,
      champs_modifies TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL
    )
  `);
  console.log('[Migration] Table audit_logs créée');

  // ============================================
  // INDEX
  // ============================================
  db.exec(`CREATE INDEX IF NOT EXISTS idx_users_matricule ON users(matricule)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_interveners_matricule ON interveners(matricule)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_interveners_habilitation ON interveners(type_habilitation)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_tst_forms_reference ON tst_forms(reference_tst)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_tst_forms_statut ON tst_forms(statut)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_audit_logs_form ON audit_logs(tst_form_id)`);

  console.log('[Migration] Index créés');
  console.log('[Migration] Migrations terminées avec succès');
}

module.exports = { runMigrations };
