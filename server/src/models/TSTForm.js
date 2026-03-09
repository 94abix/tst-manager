/**
 * Modèle Fiche TST
 * TST Form Model - Gestion des fiches Travail Sous Tension
 *
 * @module models/TSTForm
 * @author Renault Group - Service 00596
 */

const { getDatabase } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Statuts possibles d'une fiche TST / Possible TST form statuses
const TST_STATUS = {
  BROUILLON: 'brouillon',     // En cours de création
  EN_COURS: 'en_cours',       // Travaux en cours
  VALIDE: 'valide',           // Fiche validée (fin de travaux)
  ARCHIVE: 'archive'          // Fiche archivée (lecture seule)
};

/**
 * Génère une référence unique pour la fiche TST
 * Generate unique reference for TST form
 *
 * @returns {string} Référence au format TST-YYYY-NNNNNN
 */
function generateReference() {
  const db = getDatabase();
  const year = new Date().getFullYear();

  // Trouver le dernier numéro de l'année / Find last number of the year
  const stmt = db.prepare(`
    SELECT reference_tst FROM tst_forms
    WHERE reference_tst LIKE ?
    ORDER BY reference_tst DESC LIMIT 1
  `);
  const lastRef = stmt.get(`TST-${year}-%`);

  let nextNum = 1;
  if (lastRef) {
    const lastNum = parseInt(lastRef.reference_tst.split('-')[2], 10);
    nextNum = lastNum + 1;
  }

  return `TST-${year}-${String(nextNum).padStart(6, '0')}`;
}

/**
 * Classe TSTForm - Gestion des fiches TST
 */
class TSTForm {
  /**
   * Crée une nouvelle fiche TST
   * Create a new TST form
   *
   * @param {Object} data - Données de la fiche
   * @param {string} createdBy - ID de l'utilisateur créateur
   * @returns {Object} Fiche créée
   */
  static create(data, createdBy) {
    const db = getDatabase();
    const id = uuidv4();
    const reference = generateReference();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO tst_forms (
        id, reference_tst, statut,
        date_ordre, type_batterie, identification_bin,
        lieu_intervention, nature_travaux, indications_complementaires,
        autorisation_debut, autorisation_fin, delai_fin_travail,
        impossibilite_technique,
        responsable_exploitation_id, charge_travaux_ordre_id,
        created_at, updated_at, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      reference,
      TST_STATUS.BROUILLON,
      data.date_ordre || now.split('T')[0],
      data.type_batterie,
      data.identification_bin,
      data.lieu_intervention,
      data.nature_travaux,
      data.indications_complementaires || null,
      data.autorisation_debut,
      data.autorisation_fin,
      data.delai_fin_travail,
      data.impossibilite_technique || null,
      data.responsable_exploitation_id,
      data.charge_travaux_ordre_id,
      now,
      now,
      createdBy
    );

    return this.findById(id);
  }

  /**
   * Trouve une fiche par ID
   * Find form by ID
   *
   * @param {string} id - ID de la fiche
   * @returns {Object|null} Fiche trouvée ou null
   */
  static findById(id) {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT f.*,
        re.nom || ' ' || re.prenom as responsable_exploitation_nom,
        re.entreprise as responsable_exploitation_entreprise,
        re.fonction as responsable_exploitation_fonction,
        cto.nom || ' ' || cto.prenom as charge_travaux_ordre_nom,
        cto.entreprise as charge_travaux_ordre_entreprise,
        ctd.nom || ' ' || ctd.prenom as charge_travaux_debut_nom,
        exe.nom || ' ' || exe.prenom as executant_nom,
        ss.nom || ' ' || ss.prenom as surveillant_nom,
        ctf.nom || ' ' || ctf.prenom as charge_travaux_fin_nom,
        rf.nom || ' ' || rf.prenom as responsable_fin_nom
      FROM tst_forms f
      LEFT JOIN interveners re ON f.responsable_exploitation_id = re.id
      LEFT JOIN interveners cto ON f.charge_travaux_ordre_id = cto.id
      LEFT JOIN interveners ctd ON f.charge_travaux_debut_id = ctd.id
      LEFT JOIN interveners exe ON f.executant_id = exe.id
      LEFT JOIN interveners ss ON f.surveillant_securite_id = ss.id
      LEFT JOIN interveners ctf ON f.charge_travaux_fin_id = ctf.id
      LEFT JOIN interveners rf ON f.responsable_fin_id = rf.id
      WHERE f.id = ?
    `);
    return stmt.get(id);
  }

  /**
   * Trouve une fiche par référence
   * Find form by reference
   *
   * @param {string} reference - Référence de la fiche
   * @returns {Object|null} Fiche trouvée ou null
   */
  static findByReference(reference) {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT * FROM tst_forms WHERE reference_tst = ?
    `);
    return stmt.get(reference);
  }

  /**
   * Liste les fiches avec filtres
   * List forms with filters
   *
   * @param {Object} filters - Filtres de recherche
   * @returns {Array} Liste des fiches
   */
  static findAll(filters = {}) {
    const db = getDatabase();
    let query = `
      SELECT f.*,
        re.nom || ' ' || re.prenom as responsable_nom,
        cto.nom || ' ' || cto.prenom as charge_travaux_nom,
        u.nom || ' ' || u.prenom as createur_nom
      FROM tst_forms f
      LEFT JOIN interveners re ON f.responsable_exploitation_id = re.id
      LEFT JOIN interveners cto ON f.charge_travaux_ordre_id = cto.id
      LEFT JOIN users u ON f.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    // Filtre par statut / Filter by status
    if (filters.statut) {
      query += ' AND f.statut = ?';
      params.push(filters.statut);
    }

    // Filtre par date / Filter by date
    if (filters.date_debut) {
      query += ' AND f.date_ordre >= ?';
      params.push(filters.date_debut);
    }
    if (filters.date_fin) {
      query += ' AND f.date_ordre <= ?';
      params.push(filters.date_fin);
    }

    // Filtre par intervenant / Filter by intervener
    if (filters.intervenant_id) {
      query += ` AND (
        f.responsable_exploitation_id = ? OR
        f.charge_travaux_ordre_id = ? OR
        f.executant_id = ?
      )`;
      params.push(filters.intervenant_id, filters.intervenant_id, filters.intervenant_id);
    }

    // Filtre par lieu / Filter by location
    if (filters.lieu) {
      query += ' AND f.lieu_intervention LIKE ?';
      params.push(`%${filters.lieu}%`);
    }

    // Recherche textuelle / Text search
    if (filters.search) {
      query += ` AND (
        f.reference_tst LIKE ? OR
        f.type_batterie LIKE ? OR
        f.identification_bin LIKE ?
      )`;
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Tri / Sort
    const orderBy = filters.orderBy || 'created_at';
    const orderDir = filters.orderDir === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY f.${orderBy} ${orderDir}`;

    // Pagination
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
      if (filters.offset) {
        query += ' OFFSET ?';
        params.push(filters.offset);
      }
    }

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }

  /**
   * Compte le nombre de fiches
   * Count forms
   *
   * @param {Object} filters - Filtres de recherche
   * @returns {number} Nombre de fiches
   */
  static count(filters = {}) {
    const db = getDatabase();
    let query = 'SELECT COUNT(*) as total FROM tst_forms WHERE 1=1';
    const params = [];

    if (filters.statut) {
      query += ' AND statut = ?';
      params.push(filters.statut);
    }

    const stmt = db.prepare(query);
    return stmt.get(...params).total;
  }

  /**
   * Met à jour une fiche TST
   * Update TST form
   *
   * @param {string} id - ID de la fiche
   * @param {Object} data - Données à mettre à jour
   * @returns {Object|null} Fiche mise à jour ou null si archivée
   */
  static update(id, data) {
    const db = getDatabase();

    // Vérifier si la fiche n'est pas archivée / Check if form is not archived
    const existingForm = this.findById(id);
    if (!existingForm) return null;
    if (existingForm.statut === TST_STATUS.ARCHIVE) {
      throw new Error('ARCHIVE_READONLY');
    }

    const allowedFields = [
      'statut', 'date_ordre', 'type_batterie', 'identification_bin',
      'lieu_intervention', 'nature_travaux', 'indications_complementaires',
      'autorisation_debut', 'autorisation_fin', 'delai_fin_travail',
      'impossibilite_technique',
      'responsable_exploitation_id', 'charge_travaux_ordre_id',
      'charge_travaux_debut_id', 'executant_id', 'surveillant_securite_id',
      'charge_travaux_fin_id', 'responsable_fin_id',
      'signature_resp_ordre', 'signature_charge_ordre',
      'signature_charge_debut', 'signature_executant', 'signature_surveillant',
      'signature_charge_fin', 'signature_resp_fin',
      'date_debut_travail', 'date_fin_travail', 'etat_batterie_fin'
    ];

    const updates = [];
    const values = [];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(data[field]);
      }
    }

    if (updates.length === 0) return existingForm;

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const stmt = db.prepare(`
      UPDATE tst_forms SET ${updates.join(', ')} WHERE id = ?
    `);
    stmt.run(...values);

    return this.findById(id);
  }

  /**
   * Démarre les travaux (passage en statut EN_COURS)
   * Start work (change status to EN_COURS)
   *
   * @param {string} id - ID de la fiche
   * @param {Object} data - Données de début de travaux
   * @returns {Object} Fiche mise à jour
   */
  static startWork(id, data) {
    return this.update(id, {
      statut: TST_STATUS.EN_COURS,
      date_debut_travail: data.date_debut_travail || new Date().toISOString(),
      charge_travaux_debut_id: data.charge_travaux_debut_id,
      executant_id: data.executant_id,
      surveillant_securite_id: data.surveillant_securite_id,
      signature_charge_debut: data.signature_charge_debut,
      signature_executant: data.signature_executant,
      signature_surveillant: data.signature_surveillant
    });
  }

  /**
   * Termine les travaux (passage en statut VALIDE)
   * End work (change status to VALIDE)
   *
   * @param {string} id - ID de la fiche
   * @param {Object} data - Données de fin de travaux
   * @returns {Object} Fiche mise à jour
   */
  static endWork(id, data) {
    const now = new Date().toISOString();
    return this.update(id, {
      statut: TST_STATUS.VALIDE,
      date_fin_travail: data.date_fin_travail || now,
      etat_batterie_fin: data.etat_batterie_fin,
      charge_travaux_fin_id: data.charge_travaux_fin_id,
      responsable_fin_id: data.responsable_fin_id,
      signature_charge_fin: data.signature_charge_fin,
      signature_resp_fin: data.signature_resp_fin,
      validated_at: now,
      validated_by: data.validated_by
    });
  }

  /**
   * Archive une fiche (lecture seule définitive)
   * Archive form (permanent read-only)
   *
   * @param {string} id - ID de la fiche
   * @returns {Object} Fiche archivée
   */
  static archive(id) {
    const db = getDatabase();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      UPDATE tst_forms
      SET statut = ?, archived_at = ?, updated_at = ?
      WHERE id = ? AND statut = ?
    `);

    const result = stmt.run(TST_STATUS.ARCHIVE, now, now, id, TST_STATUS.VALIDE);

    if (result.changes === 0) {
      throw new Error('ARCHIVE_INVALID_STATUS');
    }

    return this.findById(id);
  }

  /**
   * Supprime une fiche brouillon
   * Delete draft form
   *
   * @param {string} id - ID de la fiche
   * @returns {boolean} Succès de la suppression
   */
  static delete(id) {
    const db = getDatabase();
    const form = this.findById(id);

    if (!form) return false;
    if (form.statut !== TST_STATUS.BROUILLON) {
      throw new Error('DELETE_NON_DRAFT');
    }

    const stmt = db.prepare('DELETE FROM tst_forms WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Statistiques des fiches
   * Form statistics
   *
   * @returns {Object} Statistiques
   */
  static getStatistics() {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN statut = 'brouillon' THEN 1 ELSE 0 END) as brouillons,
        SUM(CASE WHEN statut = 'en_cours' THEN 1 ELSE 0 END) as en_cours,
        SUM(CASE WHEN statut = 'valide' THEN 1 ELSE 0 END) as valides,
        SUM(CASE WHEN statut = 'archive' THEN 1 ELSE 0 END) as archives
      FROM tst_forms
    `);
    return stmt.get();
  }
}

module.exports = { TSTForm, TST_STATUS, generateReference };
