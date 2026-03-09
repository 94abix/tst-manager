/**
 * Point d'entrée de l'application serveur
 * Server Application Entry Point
 *
 * @module app
 * @author Renault Group - Service 00596
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const { initDatabase, closeDatabase } = require('./config/database');
const routes = require('./routes');

// Initialisation de l'application Express / Express app initialization
const app = express();

// Port du serveur / Server port
const PORT = process.env.PORT || 3001;

// ============================================
// MIDDLEWARES
// ============================================

// Sécurité HTTP / HTTP Security
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS - Autoriser le frontend / CORS - Allow frontend
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? true  // En production, le frontend est servi par le même serveur
    : (process.env.FRONTEND_URL || 'http://localhost:5173'),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parser JSON / JSON Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging des requêtes / Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ============================================
// ROUTES
// ============================================

// Routes API / API routes
app.use('/api', routes);

// ============================================
// FRONTEND STATIQUE (Production)
// ============================================

if (process.env.NODE_ENV === 'production') {
  // Servir les fichiers statiques du frontend buildé
  app.use(express.static(path.join(__dirname, '../../client/dist')));

  // Toutes les autres routes renvoient vers index.html (SPA React)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
} else {
  // Route racine en développement
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'TST Manager API - Renault Group',
      version: '1.0.0',
      documentation: '/api/health'
    });
  });

  // Erreur 404 en développement
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Ressource non trouvée'
    });
  });
}

// ============================================
// GESTION DES ERREURS / ERROR HANDLING
// ============================================

// Gestionnaire d'erreurs global / Global error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);

  // Erreurs de validation JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_JSON',
      message: 'Corps de la requête JSON invalide'
    });
  }

  // Erreur serveur générique
  res.status(err.status || 500).json({
    success: false,
    error: err.code || 'SERVER_ERROR',
    message: process.env.NODE_ENV === 'production'
      ? 'Une erreur interne est survenue'
      : err.message
  });
});

// ============================================
// DÉMARRAGE DU SERVEUR / SERVER START
// ============================================

async function startServer() {
  try {
    // Initialiser la base de données / Initialize database
    console.log('[Server] Initialisation de la base de données...');
    await initDatabase();

    // Exécuter les migrations / Run migrations
    console.log('[Server] Exécution des migrations...');
    await require('../database/migrate').runMigrations();

    // Exécuter le seed si la base est vide (premier démarrage)
    console.log('[Server] Vérification des données initiales...');
    await require('../database/seed').runSeed(false);

    // Démarrer le serveur / Start server
    app.listen(PORT, () => {
      console.log('');
      console.log('╔══════════════════════════════════════════════════════════╗');
      console.log('║                                                          ║');
      console.log('║   TST MANAGER - Renault Group                            ║');
      console.log('║   Gestion des fiches Travail Sous Tension                ║');
      console.log('║                                                          ║');
      console.log(`║   Serveur démarré sur: http://localhost:${PORT}             ║`);
      console.log(`║   Environnement: ${(process.env.NODE_ENV || 'development').padEnd(15)}                    ║`);
      console.log('║                                                          ║');
      console.log('╚══════════════════════════════════════════════════════════╝');
      console.log('');
    });

  } catch (error) {
    console.error('[Server] Erreur au démarrage:', error);
    process.exit(1);
  }
}

// Gestion de l'arrêt propre / Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('\n[Server] Arrêt demandé...');
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[Server] Arrêt demandé...');
  closeDatabase();
  process.exit(0);
});

// Démarrer le serveur / Start the server
startServer();

module.exports = app;
