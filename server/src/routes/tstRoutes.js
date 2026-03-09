/**
 * Routes des Fiches TST
 * TST Form Routes
 *
 * @module routes/tstRoutes
 * @author Renault Group - Service 00596
 */

const express = require('express');
const router = express.Router();

const tstController = require('../controllers/tstController');
const pdfController = require('../controllers/pdfController');
const { authenticateToken, requireWriteAccess } = require('../middleware/authMiddleware');
const { tstFormValidation, searchValidation, handleValidationErrors } = require('../middleware/validationMiddleware');
const { preventArchiveModification, validateArchiveEligibility } = require('../middleware/archiveGuard');

/**
 * @route   GET /api/tst/stats
 * @desc    Récupère les statistiques des fiches
 * @access  Private
 */
router.get('/stats',
  authenticateToken,
  tstController.getStatistics
);

/**
 * @route   GET /api/tst
 * @desc    Liste les fiches TST avec filtres et pagination
 * @access  Private
 */
router.get('/',
  authenticateToken,
  searchValidation.tstForms,
  handleValidationErrors,
  tstController.findAll
);

/**
 * @route   POST /api/tst
 * @desc    Crée une nouvelle fiche TST
 * @access  Private (Write)
 */
router.post('/',
  authenticateToken,
  requireWriteAccess,
  tstFormValidation.create,
  handleValidationErrors,
  tstController.create
);

/**
 * @route   GET /api/tst/:id
 * @desc    Récupère une fiche TST par ID
 * @access  Private
 */
router.get('/:id',
  authenticateToken,
  tstController.findById
);

/**
 * @route   PUT /api/tst/:id
 * @desc    Met à jour une fiche TST
 * @access  Private (Write)
 */
router.put('/:id',
  authenticateToken,
  requireWriteAccess,
  preventArchiveModification,
  tstFormValidation.update,
  handleValidationErrors,
  tstController.update
);

/**
 * @route   DELETE /api/tst/:id
 * @desc    Supprime une fiche brouillon
 * @access  Private (Write)
 */
router.delete('/:id',
  authenticateToken,
  requireWriteAccess,
  tstController.remove
);

/**
 * @route   POST /api/tst/:id/start
 * @desc    Démarre les travaux (passage en statut EN_COURS)
 * @access  Private (Write)
 */
router.post('/:id/start',
  authenticateToken,
  requireWriteAccess,
  preventArchiveModification,
  tstFormValidation.startWork,
  handleValidationErrors,
  tstController.startWork
);

/**
 * @route   POST /api/tst/:id/end
 * @desc    Termine les travaux (passage en statut VALIDE)
 * @access  Private (Write)
 */
router.post('/:id/end',
  authenticateToken,
  requireWriteAccess,
  preventArchiveModification,
  tstFormValidation.endWork,
  handleValidationErrors,
  tstController.endWork
);

/**
 * @route   POST /api/tst/:id/archive
 * @desc    Archive une fiche TST (lecture seule définitive)
 * @access  Private (Write)
 */
router.post('/:id/archive',
  authenticateToken,
  requireWriteAccess,
  validateArchiveEligibility,
  tstController.archive
);

/**
 * @route   GET /api/tst/:id/audit
 * @desc    Récupère l'historique d'audit d'une fiche
 * @access  Private
 */
router.get('/:id/audit',
  authenticateToken,
  tstController.getAuditHistory
);

/**
 * @route   GET /api/tst/:id/pdf
 * @desc    Génère et télécharge le PDF d'une fiche TST
 * @access  Private
 */
router.get('/:id/pdf',
  authenticateToken,
  pdfController.generatePDF
);

/**
 * @route   GET /api/tst/:id/pdf/preview
 * @desc    Prévisualise le PDF d'une fiche TST
 * @access  Private
 */
router.get('/:id/pdf/preview',
  authenticateToken,
  pdfController.previewPDF
);

module.exports = router;
