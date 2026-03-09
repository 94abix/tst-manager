/**
 * Script de seed - Données initiales
 * Seed Script - Initial Data
 *
 * @module database/seed
 * @author Renault Group - Service 00596
 */

require('dotenv').config();

const { initDatabase, getDatabase, saveDatabase } = require('../src/config/database');
const { runMigrations } = require('./migrate');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/**
 * Exécute le seed de la base de données
 * Run database seeding
 * @param {boolean} standalone - Si true, initialise la DB (appel direct). Si false, utilise la DB existante.
 */
async function runSeed(standalone = false) {
  console.log('[Seed] Initialisation...');

  // Initialiser la base de données seulement si appelé directement
  if (standalone) {
    await initDatabase();
    runMigrations();
  }

  const db = getDatabase();

  // Vérifier si des données existent déjà
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (existingUsers && existingUsers.count > 0) {
    console.log('[Seed] Des données existent déjà, seed ignoré');
    console.log('[Seed] Pour réinitialiser, supprimez le fichier de base de données');
    return;
  }

  console.log('[Seed] Création des données initiales...');

  const now = new Date().toISOString();

  // ============================================
  // UTILISATEURS
  // ============================================
  console.log('[Seed] Création des utilisateurs...');

  // Admin principal
  const adminId = uuidv4();
  db.prepare(`
    INSERT INTO users (id, matricule, email, password_hash, nom, prenom, role, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    adminId,
    'ADMIN001',
    'admin@renault.com',
    bcrypt.hashSync('Admin@123!', 10),
    'Administrateur',
    'Système',
    'admin',
    now,
    now
  );
  console.log('[Seed] Admin créé: ADMIN001');

  // Utilisateur standard
  const userId = uuidv4();
  db.prepare(`
    INSERT INTO users (id, matricule, email, password_hash, nom, prenom, role, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    userId,
    'USER001',
    'utilisateur@renault.com',
    bcrypt.hashSync('User@123!', 10),
    'Dupont',
    'Jean',
    'user',
    now,
    now
  );
  console.log('[Seed] Utilisateur créé: USER001');

  // Utilisateur lecture seule
  const readonlyId = uuidv4();
  db.prepare(`
    INSERT INTO users (id, matricule, email, password_hash, nom, prenom, role, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    readonlyId,
    'VIEW001',
    'consultation@renault.com',
    bcrypt.hashSync('View@123!', 10),
    'Martin',
    'Marie',
    'readonly',
    now,
    now
  );
  console.log('[Seed] Utilisateur lecture seule créé: VIEW001');

  // ============================================
  // INTERVENANTS
  // ============================================
  console.log('[Seed] Création des intervenants...');

  // Date de validité dans 1 an
  const dateValidite = new Date();
  dateValidite.setFullYear(dateValidite.getFullYear() + 1);
  const dateValiditeStr = dateValidite.toISOString().split('T')[0];

  // Intervenants avec profils aléatoires
  const intervenants = [
    { matricule: 'INT001', nom: 'LEFEBVRE', prenom: 'Thomas', entreprise: 'RENAULT SAS', fonction: 'CdP R° Batt. T°', type_habilitation: 'B2TL' },
    { matricule: 'INT002', nom: 'MOREAU', prenom: 'Sophie', entreprise: 'AMPERE', fonction: 'CMR Batt. T°', type_habilitation: 'B2TL' },
    { matricule: 'INT003', nom: 'GIRARD', prenom: 'Nicolas', entreprise: 'HORSE', fonction: 'SMR Batt. T°', type_habilitation: 'B2TL' },
    { matricule: 'INT004', nom: 'ROUSSEAU', prenom: 'Camille', entreprise: 'DACIA', fonction: 'Technicien', type_habilitation: 'B1TL' },
    { matricule: 'INT005', nom: 'FOURNIER', prenom: 'Lucas', entreprise: 'SEGULA', fonction: 'Technicien', type_habilitation: 'B1TL' },
    { matricule: 'INT006', nom: 'LAMBERT', prenom: 'Emma', entreprise: 'RENAULT SAS', fonction: 'Responsable exploitation', type_habilitation: 'B2TL' },
    { matricule: 'INT007', nom: 'BONNET', prenom: 'Alexandre', entreprise: 'RENAULT SAS', fonction: 'Surveillant sécurité', type_habilitation: 'B1TL' },
    { matricule: 'INT008', nom: 'MERCIER', prenom: 'Julie', entreprise: 'AMPERE', fonction: 'Exécutant', type_habilitation: 'B1TL' }
  ];

  const stmtIntervener = db.prepare(`
    INSERT INTO interveners (id, matricule, nom, prenom, entreprise, fonction, type_habilitation, date_validite_hab, actif, created_at, updated_at, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const intervenant of intervenants) {
    stmtIntervener.run(
      uuidv4(),
      intervenant.matricule,
      intervenant.nom,
      intervenant.prenom,
      intervenant.entreprise,
      intervenant.fonction,
      intervenant.type_habilitation,
      dateValiditeStr,
      1,
      now,
      now,
      adminId
    );
    console.log(`[Seed] Intervenant créé: ${intervenant.nom} ${intervenant.prenom} (${intervenant.type_habilitation})`);
  }

  // Sauvegarder la base
  saveDatabase();

  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                    SEED TERMINÉ                          ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log('║                                                          ║');
  console.log('║  Comptes créés:                                          ║');
  console.log('║                                                          ║');
  console.log('║  ADMIN:                                                  ║');
  console.log('║    Matricule: ADMIN001                                   ║');
  console.log('║    Mot de passe: Admin@123!                              ║');
  console.log('║                                                          ║');
  console.log('║  UTILISATEUR:                                            ║');
  console.log('║    Matricule: USER001                                    ║');
  console.log('║    Mot de passe: User@123!                               ║');
  console.log('║                                                          ║');
  console.log('║  LECTURE SEULE:                                          ║');
  console.log('║    Matricule: VIEW001                                    ║');
  console.log('║    Mot de passe: View@123!                               ║');
  console.log('║                                                          ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
}

// Exécuter le seed si appelé directement
if (require.main === module) {
  runSeed(true).catch(console.error);
}

module.exports = { runSeed };
