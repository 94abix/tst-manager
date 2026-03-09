/**
 * Routes d'authentification
 * Authentication Routes
 *
 * @module routes/authRoutes
 * @author Renault Group - Service 00596
 */

const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const { authValidation, handleValidationErrors } = require('../middleware/validationMiddleware');
const { ROLES } = require('../models/User');

/**
 * @route   POST /api/auth/login
 * @desc    Connexion utilisateur
 * @access  Public
 */
router.post('/login',
  authValidation.login,
  handleValidationErrors,
  authController.login
);

/**
 * @route   POST /api/auth/register
 * @desc    Inscription utilisateur (admin uniquement)
 * @access  Private (Admin)
 */
router.post('/register',
  authenticateToken,
  requireRole(ROLES.ADMIN),
  authValidation.register,
  handleValidationErrors,
  authController.register
);

/**
 * @route   GET /api/auth/me
 * @desc    Récupérer le profil de l'utilisateur connecté
 * @access  Private
 */
router.get('/me',
  authenticateToken,
  authController.getProfile
);

/**
 * @route   PUT /api/auth/me
 * @desc    Mettre à jour le profil de l'utilisateur connecté
 * @access  Private
 */
router.put('/me',
  authenticateToken,
  authController.updateProfile
);

/**
 * @route   GET /api/auth/users
 * @desc    Liste tous les utilisateurs
 * @access  Private (Admin)
 */
router.get('/users',
  authenticateToken,
  requireRole(ROLES.ADMIN),
  authController.listUsers
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Rafraîchit le token JWT
 * @access  Private
 */
router.post('/refresh',
  authenticateToken,
  authController.refreshToken
);

module.exports = router;
