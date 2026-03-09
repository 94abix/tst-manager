/**
 * Modèle Intervenant
 * Intervener Model - Annuaire des intervenants habilités TST
 *
 * @module models/Intervener
 * @author Renault Group - Service 00596
 */

const { getDatabase } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Types d'habilitation électrique / Electrical authorization types
const HABILITATION_TYPES = {
  B0: 'B0',       // Exécutant non électricien
  B1: 'B1',       // Exécutant électricien
  B1V: 'B1V',     // Exécutant électricien - Voisinage
  B1TL: 'B1TL',   // Exécutant électricien - Travaux sous tension (Li-ion)
  B2: 'B2',       // Chargé de travaux
  B2V: 'B2V',     // Chargé de travaux - Voisinage
  B2TL: 'B2TL',   // Chargé de travaux - Travaux sous tension (Li-ion)
  BR: 'BR',       // Chargé d'intervention générale
  BC: 'BC',       // Chargé de consignation
  BE: 'BE',       // Chargé d'opérations spécifiques
  H0: 'H0',       // Exécutant non électricien HT
  H1: 'H1',       // Exécutant électricien HT
  H2: 'H2'        // Chargé de travaux HT
};

/**
 * Classe Intervener - Gestion des intervenants
 */
class Intervener {
  /**
   * Crée un nouvel intervenant
   * Create a new intervener
   *
   * @param {Object} data - Données de l'intervenant
   * @param {string} createdBy - ID de l'utilisateur créateur
   * @returns {Object} Intervenant créé
   */
  static create(data, createdBy) {
    const db = getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO interveners (
        id, matricule, nom, prenom, entreprise, fonction,
        type_habilitation, date_validite_hab, actif,
        created_at, updated_at, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.matricule,
      data.nom,
      data.prenom,
      data.entreprise,
      data.fonction,
      data.type_habilitation,
      data.date_validite_hab,
      data.actif !== false ? 1 : 0,
      now,
      now,
      createdBy
    );

    return this.findById(id);
  }

  /**
   * Trouve un intervenant par ID
   * Find intervener by ID
   *
   * @param {string} id - ID de l'intervenant
   * @returns {Object|null} Intervenant trouvé ou null
   */
  static findById(id) {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT * FROM interveners WHERE id = ?
    `);
    return stmt.get(id);
  }

  /**
   * Trouve un intervenant par matricule
   * Find intervener by matricule
   *
   * @param {string} matricule - Matricule de l'intervenant
   * @returns {Object|null} Intervenant trouvé ou null
   */
  static findByMatricule(matricule) {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT * FROM interveners WHERE matricule = ?
    `);
    return stmt.get(matricule);
  }

  /**
   * Liste tous les intervenants actifs
   * List all active interveners
   *
   * @param {Object} filters - Filtres optionnels
   * @returns {Array} Liste des intervenants
   */
  static findAll(filters = {}) {
    const db = getDatabase();
    let query = 'SELECT * FROM interveners WHERE 1=1';
    const params = [];

    if (filters.actif !== undefined) {
      query += ' AND actif = ?';
      params.push(filters.actif ? 1 : 0);
    }

    if (filters.entreprise) {
      query += ' AND entreprise = ?';
      params.push(filters.entreprise);
    }

    if (filters.type_habilitation) {
      query += ' AND type_habilitation = ?';
      params.push(filters.type_habilitation);
    }

    if (filters.search) {
      query += ' AND (nom LIKE ? OR prenom LIKE ? OR matricule LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY nom, prenom';

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }

  /**
   * Liste les intervenants avec une habilitation valide
   * List interveners with valid authorization
   *
   * @param {string} habilitationType - Type d'habilitation requis
   * @returns {Array} Liste des intervenants
   */
  static findWithValidHabilitation(habilitationType) {
    const db = getDatabase();
    const today = new Date().toISOString().split('T')[0];

    const stmt = db.prepare(`
      SELECT * FROM interveners
      WHERE actif = 1
      AND type_habilitation = ?
      AND date_validite_hab >= ?
      ORDER BY nom, prenom
    `);

    return stmt.all(habilitationType, today);
  }

  /**
   * Vérifie si l'habilitation d'un intervenant est valide
   * Check if intervener's authorization is valid
   *
   * @param {string} id - ID de l'intervenant
   * @returns {boolean} Habilitation valide ou non
   */
  static isHabilitationValid(id) {
    const intervener = this.findById(id);
    if (!intervener || !intervener.actif) return false;

    const today = new Date().toISOString().split('T')[0];
    return intervener.date_validite_hab >= today;
  }

  /**
   * Met à jour un intervenant
   * Update intervener
   *
   * @param {string} id - ID de l'intervenant
   * @param {Object} data - Données à mettre à jour
   * @returns {Object} Intervenant mis à jour
   */
  static update(id, data) {
    const db = getDatabase();
    const updates = [];
    const values = [];

    const allowedFields = [
      'matricule', 'nom', 'prenom', 'entreprise', 'fonction',
      'type_habilitation', 'date_validite_hab', 'actif'
    ];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(field === 'actif' ? (data[field] ? 1 : 0) : data[field]);
      }
    }

    if (updates.length === 0) return this.findById(id);

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const stmt = db.prepare(`
      UPDATE interveners SET ${updates.join(', ')} WHERE id = ?
    `);
    stmt.run(...values);

    return this.findById(id);
  }

  /**
   * Désactive un intervenant (soft delete)
   * Deactivate intervener (soft delete)
   *
   * @param {string} id - ID de l'intervenant
   * @returns {boolean} Succès de la désactivation
   */
  static deactivate(id) {
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE interveners SET actif = 0, updated_at = ? WHERE id = ?
    `);
    const result = stmt.run(new Date().toISOString(), id);
    return result.changes > 0;
  }

  /**
   * Liste les entreprises distinctes
   * List distinct companies
   *
   * @returns {Array} Liste des entreprises
   */
  static getCompanies() {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT DISTINCT entreprise FROM interveners
      WHERE actif = 1 AND entreprise IS NOT NULL
      ORDER BY entreprise
    `);
    return stmt.all().map(row => row.entreprise);
  }
}

module.exports = { Intervener, HABILITATION_TYPES };
