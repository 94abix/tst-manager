/**
 * Modèle Journal d'Audit
 * Audit Log Model - Traçabilité des actions sur les fiches TST
 *
 * @module models/AuditLog
 * @author Renault Group - Service 00596
 */

const { getDatabase } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Types d'actions auditées / Audited action types
const AUDIT_ACTIONS = {
  CREATION: 'creation',             // Création d'une fiche
  MODIFICATION: 'modification',     // Modification d'une fiche
  VALIDATION: 'validation',         // Validation (fin de travaux)
  ARCHIVE: 'archive',               // Archivage
  EXPORT_PDF: 'export_pdf',         // Export PDF
  CONSULTATION: 'consultation',     // Consultation d'une fiche
  SIGNATURE: 'signature',           // Ajout d'une signature
  START_WORK: 'start_work',         // Début des travaux
  END_WORK: 'end_work'              // Fin des travaux
};

/**
 * Classe AuditLog - Gestion du journal d'audit
 */
class AuditLog {
  /**
   * Crée une entrée de journal
   * Create audit log entry
   *
   * @param {Object} data - Données de l'entrée
   * @returns {Object} Entrée créée
   */
  static create(data) {
    const db = getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO audit_logs (
        id, tst_form_id, user_id, action,
        champs_modifies, ip_address, user_agent, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.tst_form_id,
      data.user_id,
      data.action,
      data.champs_modifies ? JSON.stringify(data.champs_modifies) : null,
      data.ip_address || null,
      data.user_agent || null,
      now
    );

    return this.findById(id);
  }

  /**
   * Trouve une entrée par ID
   * Find entry by ID
   *
   * @param {string} id - ID de l'entrée
   * @returns {Object|null} Entrée trouvée ou null
   */
  static findById(id) {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT al.*,
        u.nom || ' ' || u.prenom as user_nom,
        u.matricule as user_matricule,
        f.reference_tst
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      LEFT JOIN tst_forms f ON al.tst_form_id = f.id
      WHERE al.id = ?
    `);
    const entry = stmt.get(id);

    if (entry && entry.champs_modifies) {
      entry.champs_modifies = JSON.parse(entry.champs_modifies);
    }

    return entry;
  }

  /**
   * Liste les entrées pour une fiche TST
   * List entries for a TST form
   *
   * @param {string} tstFormId - ID de la fiche TST
   * @returns {Array} Liste des entrées
   */
  static findByTSTForm(tstFormId) {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT al.*,
        u.nom || ' ' || u.prenom as user_nom,
        u.matricule as user_matricule
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.tst_form_id = ?
      ORDER BY al.created_at DESC
    `);

    const entries = stmt.all(tstFormId);
    return entries.map(entry => {
      if (entry.champs_modifies) {
        entry.champs_modifies = JSON.parse(entry.champs_modifies);
      }
      return entry;
    });
  }

  /**
   * Liste les entrées pour un utilisateur
   * List entries for a user
   *
   * @param {string} userId - ID de l'utilisateur
   * @param {Object} options - Options de pagination
   * @returns {Array} Liste des entrées
   */
  static findByUser(userId, options = {}) {
    const db = getDatabase();
    let query = `
      SELECT al.*,
        f.reference_tst
      FROM audit_logs al
      LEFT JOIN tst_forms f ON al.tst_form_id = f.id
      WHERE al.user_id = ?
      ORDER BY al.created_at DESC
    `;
    const params = [userId];

    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
      if (options.offset) {
        query += ' OFFSET ?';
        params.push(options.offset);
      }
    }

    const stmt = db.prepare(query);
    const entries = stmt.all(...params);

    return entries.map(entry => {
      if (entry.champs_modifies) {
        entry.champs_modifies = JSON.parse(entry.champs_modifies);
      }
      return entry;
    });
  }

  /**
   * Liste toutes les entrées avec filtres
   * List all entries with filters
   *
   * @param {Object} filters - Filtres de recherche
   * @returns {Array} Liste des entrées
   */
  static findAll(filters = {}) {
    const db = getDatabase();
    let query = `
      SELECT al.*,
        u.nom || ' ' || u.prenom as user_nom,
        u.matricule as user_matricule,
        f.reference_tst
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      LEFT JOIN tst_forms f ON al.tst_form_id = f.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.action) {
      query += ' AND al.action = ?';
      params.push(filters.action);
    }

    if (filters.date_debut) {
      query += ' AND al.created_at >= ?';
      params.push(filters.date_debut);
    }

    if (filters.date_fin) {
      query += ' AND al.created_at <= ?';
      params.push(filters.date_fin);
    }

    if (filters.user_id) {
      query += ' AND al.user_id = ?';
      params.push(filters.user_id);
    }

    query += ' ORDER BY al.created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
      if (filters.offset) {
        query += ' OFFSET ?';
        params.push(filters.offset);
      }
    }

    const stmt = db.prepare(query);
    const entries = stmt.all(...params);

    return entries.map(entry => {
      if (entry.champs_modifies) {
        entry.champs_modifies = JSON.parse(entry.champs_modifies);
      }
      return entry;
    });
  }

  /**
   * Calcule les différences entre deux versions d'une fiche
   * Calculate differences between two versions of a form
   *
   * @param {Object} oldData - Anciennes données
   * @param {Object} newData - Nouvelles données
   * @returns {Object} Différences {champ: {avant, apres}}
   */
  static calculateDiff(oldData, newData) {
    const diff = {};
    const allKeys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);

    for (const key of allKeys) {
      // Ignorer les champs de métadonnées / Ignore metadata fields
      if (['updated_at', 'created_at'].includes(key)) continue;

      const oldValue = oldData ? oldData[key] : undefined;
      const newValue = newData ? newData[key] : undefined;

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        diff[key] = {
          avant: oldValue,
          apres: newValue
        };
      }
    }

    return Object.keys(diff).length > 0 ? diff : null;
  }
}

module.exports = { AuditLog, AUDIT_ACTIONS };
