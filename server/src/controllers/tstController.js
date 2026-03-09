/**
 * Contrôleur des Fiches TST
 * TST Form Controller - Gestion des fiches Travail Sous Tension
 *
 * @module controllers/tstController
 * @author Renault Group - Service 00596
 */

const { TSTForm, TST_STATUS } = require('../models/TSTForm');
const { Intervener } = require('../models/Intervener');
const { AuditLog, AUDIT_ACTIONS } = require('../models/AuditLog');

/**
 * Crée une nouvelle fiche TST
 * Create new TST form
 *
 * POST /api/tst
 */
async function create(req, res) {
  try {
    const data = req.body;

    // Vérifier les intervenants / Validate interveners
    const validationErrors = await validateInterveners(data);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_INTERVENERS',
        message: 'Erreurs de validation des intervenants',
        details: validationErrors
      });
    }

    // Créer la fiche / Create form
    const form = TSTForm.create(data, req.user.id);

    // Créer l'entrée d'audit / Create audit entry
    AuditLog.create({
      tst_form_id: form.id,
      user_id: req.user.id,
      action: AUDIT_ACTIONS.CREATION,
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    });

    res.status(201).json({
      success: true,
      message: 'Fiche TST créée avec succès',
      data: { form }
    });

  } catch (error) {
    console.error('[TST] Erreur create:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Erreur lors de la création de la fiche TST'
    });
  }
}

/**
 * Liste les fiches TST avec filtres
 * List TST forms with filters
 *
 * GET /api/tst
 */
async function findAll(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      statut,
      date_debut,
      date_fin,
      intervenant_id,
      lieu,
      search,
      orderBy = 'created_at',
      orderDir = 'desc'
    } = req.query;

    const filters = {
      statut,
      date_debut,
      date_fin,
      intervenant_id,
      lieu,
      search,
      orderBy,
      orderDir,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    };

    const forms = TSTForm.findAll(filters);
    const total = TSTForm.count({ statut });

    res.json({
      success: true,
      data: {
        forms,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('[TST] Erreur findAll:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Erreur lors de la récupération des fiches TST'
    });
  }
}

/**
 * Récupère une fiche TST par ID
 * Get TST form by ID
 *
 * GET /api/tst/:id
 */
async function findById(req, res) {
  try {
    const { id } = req.params;
    const form = TSTForm.findById(id);

    if (!form) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Fiche TST non trouvée'
      });
    }

    // Log consultation / Log consultation
    AuditLog.create({
      tst_form_id: form.id,
      user_id: req.user.id,
      action: AUDIT_ACTIONS.CONSULTATION,
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    });

    res.json({
      success: true,
      data: { form }
    });

  } catch (error) {
    console.error('[TST] Erreur findById:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Erreur lors de la récupération de la fiche TST'
    });
  }
}

/**
 * Met à jour une fiche TST
 * Update TST form
 *
 * PUT /api/tst/:id
 */
async function update(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;

    // La fiche est déjà chargée par le middleware archiveGuard
    // Form is already loaded by archiveGuard middleware
    const oldForm = req.tstForm || TSTForm.findById(id);

    if (!oldForm) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Fiche TST non trouvée'
      });
    }

    // Mettre à jour / Update
    const form = TSTForm.update(id, data);

    // Calculer les différences pour l'audit / Calculate diff for audit
    const diff = AuditLog.calculateDiff(oldForm, form);

    // Créer l'entrée d'audit / Create audit entry
    AuditLog.create({
      tst_form_id: form.id,
      user_id: req.user.id,
      action: AUDIT_ACTIONS.MODIFICATION,
      champs_modifies: diff,
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: 'Fiche TST mise à jour avec succès',
      data: { form }
    });

  } catch (error) {
    if (error.message === 'ARCHIVE_READONLY') {
      return res.status(403).json({
        success: false,
        error: 'ARCHIVE_READONLY',
        message: 'Cette fiche est archivée et ne peut plus être modifiée'
      });
    }

    console.error('[TST] Erreur update:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Erreur lors de la mise à jour de la fiche TST'
    });
  }
}

/**
 * Démarre les travaux
 * Start work
 *
 * POST /api/tst/:id/start
 */
async function startWork(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;

    const oldForm = req.tstForm || TSTForm.findById(id);

    if (!oldForm) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Fiche TST non trouvée'
      });
    }

    // Vérifier le statut / Check status
    if (oldForm.statut !== TST_STATUS.BROUILLON) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STATUS',
        message: `Les travaux ne peuvent être démarrés que sur une fiche brouillon. Statut actuel: ${oldForm.statut}`
      });
    }

    // Vérifier les habilitations des intervenants / Check interveners habilitations
    const validationErrors = [];

    // Chargé de travaux doit être B2TL / Work manager must be B2TL
    const chargeTravaux = Intervener.findById(data.charge_travaux_debut_id);
    if (!chargeTravaux || chargeTravaux.type_habilitation !== 'B2TL') {
      validationErrors.push('Le chargé de travaux doit avoir l\'habilitation B2TL');
    } else if (!Intervener.isHabilitationValid(data.charge_travaux_debut_id)) {
      validationErrors.push('L\'habilitation du chargé de travaux est expirée');
    }

    // Exécutant doit être B1TL / Executor must be B1TL
    const executant = Intervener.findById(data.executant_id);
    if (!executant || executant.type_habilitation !== 'B1TL') {
      validationErrors.push('L\'exécutant doit avoir l\'habilitation B1TL');
    } else if (!Intervener.isHabilitationValid(data.executant_id)) {
      validationErrors.push('L\'habilitation de l\'exécutant est expirée');
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'HABILITATION_INVALID',
        message: 'Erreurs de validation des habilitations',
        details: validationErrors
      });
    }

    // Démarrer les travaux / Start work
    const form = TSTForm.startWork(id, data);

    // Audit
    AuditLog.create({
      tst_form_id: form.id,
      user_id: req.user.id,
      action: AUDIT_ACTIONS.START_WORK,
      champs_modifies: {
        statut: { avant: oldForm.statut, apres: form.statut },
        date_debut_travail: { avant: null, apres: form.date_debut_travail }
      },
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: 'Travaux démarrés avec succès',
      data: { form }
    });

  } catch (error) {
    console.error('[TST] Erreur startWork:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Erreur lors du démarrage des travaux'
    });
  }
}

/**
 * Termine les travaux
 * End work
 *
 * POST /api/tst/:id/end
 */
async function endWork(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;

    const oldForm = req.tstForm || TSTForm.findById(id);

    if (!oldForm) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Fiche TST non trouvée'
      });
    }

    // Vérifier le statut / Check status
    if (oldForm.statut !== TST_STATUS.EN_COURS) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STATUS',
        message: `Les travaux ne peuvent être terminés que sur une fiche en cours. Statut actuel: ${oldForm.statut}`
      });
    }

    // Terminer les travaux / End work
    data.validated_by = req.user.id;
    const form = TSTForm.endWork(id, data);

    // Audit
    AuditLog.create({
      tst_form_id: form.id,
      user_id: req.user.id,
      action: AUDIT_ACTIONS.END_WORK,
      champs_modifies: {
        statut: { avant: oldForm.statut, apres: form.statut },
        date_fin_travail: { avant: null, apres: form.date_fin_travail },
        etat_batterie_fin: { avant: null, apres: form.etat_batterie_fin }
      },
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: 'Travaux terminés et fiche validée',
      data: { form }
    });

  } catch (error) {
    console.error('[TST] Erreur endWork:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Erreur lors de la fin des travaux'
    });
  }
}

/**
 * Archive une fiche TST
 * Archive TST form
 *
 * POST /api/tst/:id/archive
 */
async function archive(req, res) {
  try {
    const { id } = req.params;

    // La validation est faite par le middleware validateArchiveEligibility
    // Validation is done by validateArchiveEligibility middleware

    const form = TSTForm.archive(id);

    // Audit
    AuditLog.create({
      tst_form_id: form.id,
      user_id: req.user.id,
      action: AUDIT_ACTIONS.ARCHIVE,
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    });

    res.json({
      success: true,
      message: 'Fiche archivée avec succès. Elle est désormais en lecture seule.',
      data: { form }
    });

  } catch (error) {
    if (error.message === 'ARCHIVE_INVALID_STATUS') {
      return res.status(400).json({
        success: false,
        error: 'ARCHIVE_INVALID_STATUS',
        message: 'Seules les fiches validées peuvent être archivées'
      });
    }

    console.error('[TST] Erreur archive:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Erreur lors de l\'archivage de la fiche'
    });
  }
}

/**
 * Supprime une fiche brouillon
 * Delete draft form
 *
 * DELETE /api/tst/:id
 */
async function remove(req, res) {
  try {
    const { id } = req.params;

    const form = TSTForm.findById(id);
    if (!form) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Fiche TST non trouvée'
      });
    }

    const success = TSTForm.delete(id);

    if (success) {
      res.json({
        success: true,
        message: 'Fiche brouillon supprimée avec succès'
      });
    }

  } catch (error) {
    if (error.message === 'DELETE_NON_DRAFT') {
      return res.status(400).json({
        success: false,
        error: 'DELETE_NON_DRAFT',
        message: 'Seules les fiches brouillon peuvent être supprimées'
      });
    }

    console.error('[TST] Erreur remove:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Erreur lors de la suppression de la fiche'
    });
  }
}

/**
 * Récupère l'historique d'audit d'une fiche
 * Get form audit history
 *
 * GET /api/tst/:id/audit
 */
async function getAuditHistory(req, res) {
  try {
    const { id } = req.params;

    const form = TSTForm.findById(id);
    if (!form) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Fiche TST non trouvée'
      });
    }

    const history = AuditLog.findByTSTForm(id);

    res.json({
      success: true,
      data: {
        reference: form.reference_tst,
        history
      }
    });

  } catch (error) {
    console.error('[TST] Erreur getAuditHistory:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Erreur lors de la récupération de l\'historique'
    });
  }
}

/**
 * Récupère les statistiques des fiches
 * Get form statistics
 *
 * GET /api/tst/stats
 */
async function getStatistics(req, res) {
  try {
    const stats = TSTForm.getStatistics();

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('[TST] Erreur getStatistics:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
}

/**
 * Valide les intervenants d'une fiche
 * Validate form interveners
 *
 * @param {Object} data - Données de la fiche
 * @returns {Array} Erreurs de validation
 */
async function validateInterveners(data) {
  const errors = [];

  // Responsable d'exploitation / Operations manager
  if (data.responsable_exploitation_id) {
    const resp = Intervener.findById(data.responsable_exploitation_id);
    if (!resp) {
      errors.push({ field: 'responsable_exploitation_id', message: 'Responsable d\'exploitation non trouvé' });
    } else if (!resp.actif) {
      errors.push({ field: 'responsable_exploitation_id', message: 'Responsable d\'exploitation inactif' });
    }
  }

  // Chargé de travaux / Work manager
  if (data.charge_travaux_ordre_id) {
    const charge = Intervener.findById(data.charge_travaux_ordre_id);
    if (!charge) {
      errors.push({ field: 'charge_travaux_ordre_id', message: 'Chargé de travaux non trouvé' });
    } else {
      if (!charge.actif) {
        errors.push({ field: 'charge_travaux_ordre_id', message: 'Chargé de travaux inactif' });
      }
      if (charge.type_habilitation !== 'B2TL') {
        errors.push({ field: 'charge_travaux_ordre_id', message: 'Le chargé de travaux doit avoir l\'habilitation B2TL' });
      }
    }
  }

  return errors;
}

module.exports = {
  create,
  findAll,
  findById,
  update,
  startWork,
  endWork,
  archive,
  remove,
  getAuditHistory,
  getStatistics
};
