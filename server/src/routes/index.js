/**
 * Index des routes
 * Routes Index - Centralise toutes les routes de l'API
 *
 * @module routes/index
 * @author Renault Group - Service 00596
 */

const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const intervenerRoutes = require('./intervenerRoutes');
const tstRoutes = require('./tstRoutes');

/**
 * Route de santé de l'API
 * API Health check route
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API TST Manager opérationnelle',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

/**
 * Routes d'authentification
 * Authentication routes
 */
router.use('/auth', authRoutes);

/**
 * Routes des intervenants
 * Intervener routes
 */
router.use('/interveners', intervenerRoutes);

/**
 * Routes des fiches TST
 * TST form routes
 */
router.use('/tst', tstRoutes);

/**
 * Route 404 pour les routes API non trouvées
 * 404 route for unknown API routes
 */
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: `Route ${req.method} ${req.originalUrl} non trouvée`
  });
});

module.exports = router;
