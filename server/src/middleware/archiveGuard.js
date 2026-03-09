/**
 * Middleware de protection des fiches archivées
 * Archive Guard Middleware - Prevents modification of archived TST forms
 *
 * @module middleware/archiveGuard
 * @author Renault Group - Service 00596
 */

const { TSTForm, TST_STATUS } = require('../models/TSTForm');

/**
 * Vérifie qu'une fiche TST n'est pas archivée avant modification
 * Check that a TST form is not archived before modification
 *
 * @param {Request} req - Requête Express
 * @param {Response} res - Réponse Express
 * @param {Function} next - Fonction next
 */
function preventArchiveModification(req, res, next) {
  const formId = req.params.id;

  if (!formId) {
    return next();
  }

  try {
    const form = TSTForm.findById(formId);

    if (!form) {
      return res.status(404).json({
        success: false,
        error: 'FORM_NOT_FOUND',
        message: 'Fiche TST non trouvée'
      });
    }

    if (form.statut === TST_STATUS.ARCHIVE) {
      return res.status(403).json({
        success: false,
        error: 'ARCHIVE_READONLY',
        message: 'Cette fiche est archivée et ne peut plus être modifiée. ' +
                 'Les fiches archivées sont en lecture seule pour garantir l\'intégrité juridique.',
        archived_at: form.archived_at
      });
    }

    // Ajouter la fiche à la requête pour éviter une seconde requête DB
    // Add form to request to avoid a second DB query
    req.tstForm = form;

    next();
  } catch (error) {
    console.error('[ArchiveGuard] Erreur:', error);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Erreur lors de la vérification du statut de la fiche'
    });
  }
}

/**
 * Vérifie qu'une fiche peut être archivée (statut VALIDE uniquement)
 * Check that a form can be archived (VALIDE status only)
 *
 * @param {Request} req - Requête Express
 * @param {Response} res - Réponse Express
 * @param {Function} next - Fonction next
 */
function validateArchiveEligibility(req, res, next) {
  const formId = req.params.id;

  if (!formId) {
    return res.status(400).json({
      success: false,
      error: 'MISSING_ID',
      message: 'ID de la fiche requis'
    });
  }

  try {
    const form = TSTForm.findById(formId);

    if (!form) {
      return res.status(404).json({
        success: false,
        error: 'FORM_NOT_FOUND',
        message: 'Fiche TST non trouvée'
      });
    }

    if (form.statut === TST_STATUS.ARCHIVE) {
      return res.status(400).json({
        success: false,
        error: 'ALREADY_ARCHIVED',
        message: 'Cette fiche est déjà archivée'
      });
    }

    if (form.statut !== TST_STATUS.VALIDE) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STATUS_FOR_ARCHIVE',
        message: `Seules les fiches validées peuvent être archivées. Statut actuel: ${form.statut}`,
        current_status: form.statut,
        required_status: TST_STATUS.VALIDE
      });
    }

    req.tstForm = form;
    next();
  } catch (error) {
    console.error('[ArchiveGuard] Erreur validation archivage:', error);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Erreur lors de la validation pour archivage'
    });
  }
}

/**
 * Vérifie les transitions de statut autorisées
 * Check allowed status transitions
 *
 * Transitions autorisées / Allowed transitions:
 * - brouillon -> en_cours (démarrage travaux)
 * - en_cours -> valide (fin de travaux)
 * - valide -> archive (archivage)
 *
 * @param {Request} req - Requête Express
 * @param {Response} res - Réponse Express
 * @param {Function} next - Fonction next
 */
function validateStatusTransition(req, res, next) {
  const newStatus = req.body.statut;

  if (!newStatus) {
    return next();
  }

  const form = req.tstForm;
  if (!form) {
    return next(); // Sera géré par le contrôleur
  }

  const allowedTransitions = {
    [TST_STATUS.BROUILLON]: [TST_STATUS.EN_COURS],
    [TST_STATUS.EN_COURS]: [TST_STATUS.VALIDE],
    [TST_STATUS.VALIDE]: [TST_STATUS.ARCHIVE],
    [TST_STATUS.ARCHIVE]: [] // Aucune transition depuis archivé
  };

  const currentStatus = form.statut;
  const allowed = allowedTransitions[currentStatus] || [];

  if (!allowed.includes(newStatus)) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_STATUS_TRANSITION',
      message: `Transition de statut non autorisée: ${currentStatus} -> ${newStatus}`,
      current_status: currentStatus,
      requested_status: newStatus,
      allowed_transitions: allowed
    });
  }

  next();
}

module.exports = {
  preventArchiveModification,
  validateArchiveEligibility,
  validateStatusTransition
};
