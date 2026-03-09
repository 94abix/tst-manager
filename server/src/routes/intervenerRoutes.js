/**
 * Routes des Intervenants
 * Intervener Routes
 *
 * @module routes/intervenerRoutes
 * @author Renault Group - Service 00596
 */

const express = require('express');
const router = express.Router();

const intervenerController = require('../controllers/intervenerController');
const { authenticateToken, requireWriteAccess } = require('../middleware/authMiddleware');
const { intervenerValidation, handleValidationErrors } = require('../middleware/validationMiddleware');

/**
 * @route   GET /api/interveners/habilitations
 * @desc    Liste les types d'habilitation disponibles
 * @access  Private
 */
router.get('/habilitations',
  authenticateToken,
  intervenerController.getHabilitationTypes
);

/**
 * @route   GET /api/interveners/companies
 * @desc    Liste les entreprises distinctes
 * @access  Private
 */
router.get('/companies',
  authenticateToken,
  intervenerController.getCompanies
);

/**
 * @route   GET /api/interveners/habilitation/:type
 * @desc    Liste les intervenants avec une habilitation valide pour un type donné
 * @access  Private
 */
router.get('/habilitation/:type',
  authenticateToken,
  intervenerController.findByHabilitation
);

/**
 * @route   GET /api/interveners
 * @desc    Liste tous les intervenants
 * @access  Private
 */
router.get('/',
  authenticateToken,
  intervenerController.findAll
);

/**
 * @route   POST /api/interveners
 * @desc    Crée un nouvel intervenant
 * @access  Private (Write)
 */
router.post('/',
  authenticateToken,
  requireWriteAccess,
  intervenerValidation.create,
  handleValidationErrors,
  intervenerController.create
);

/**
 * @route   GET /api/interveners/:id
 * @desc    Récupère un intervenant par ID
 * @access  Private
 */
router.get('/:id',
  authenticateToken,
  intervenerController.findById
);

/**
 * @route   PUT /api/interveners/:id
 * @desc    Met à jour un intervenant
 * @access  Private (Write)
 */
router.put('/:id',
  authenticateToken,
  requireWriteAccess,
  intervenerValidation.update,
  handleValidationErrors,
  intervenerController.update
);

/**
 * @route   DELETE /api/interveners/:id
 * @desc    Désactive un intervenant (soft delete)
 * @access  Private (Write)
 */
router.delete('/:id',
  authenticateToken,
  requireWriteAccess,
  intervenerController.deactivate
);

module.exports = router;
