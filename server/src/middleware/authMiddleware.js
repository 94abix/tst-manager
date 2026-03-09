/**
 * Middleware d'authentification JWT
 * JWT Authentication Middleware
 *
 * @module middleware/authMiddleware
 * @author Renault Group - Service 00596
 */

const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { User, ROLES } = require('../models/User');

/**
 * Vérifie le token JWT dans le header Authorization
 * Verify JWT token in Authorization header
 *
 * @param {Request} req - Requête Express
 * @param {Response} res - Réponse Express
 * @param {Function} next - Fonction next
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'TOKEN_MISSING',
      message: 'Token d\'authentification requis'
    });
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret, jwtConfig.verifyOptions);

    // Vérifier que l'utilisateur existe toujours / Verify user still exists
    const user = User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'Utilisateur non trouvé'
      });
    }

    // Ajouter les infos utilisateur à la requête / Add user info to request
    req.user = {
      id: user.id,
      matricule: user.matricule,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'TOKEN_EXPIRED',
        message: 'Token expiré, veuillez vous reconnecter'
      });
    }

    return res.status(403).json({
      success: false,
      error: 'TOKEN_INVALID',
      message: 'Token invalide'
    });
  }
}

/**
 * Vérifie que l'utilisateur a un rôle spécifique
 * Verify user has specific role
 *
 * @param {string[]} allowedRoles - Rôles autorisés
 * @returns {Function} Middleware Express
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'NOT_AUTHENTICATED',
        message: 'Authentification requise'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'Permissions insuffisantes pour cette action'
      });
    }

    next();
  };
}

/**
 * Vérifie que l'utilisateur n'est pas en lecture seule
 * Verify user is not read-only
 *
 * @param {Request} req - Requête Express
 * @param {Response} res - Réponse Express
 * @param {Function} next - Fonction next
 */
function requireWriteAccess(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'NOT_AUTHENTICATED',
      message: 'Authentification requise'
    });
  }

  if (req.user.role === ROLES.READONLY) {
    return res.status(403).json({
      success: false,
      error: 'READ_ONLY_ACCESS',
      message: 'Votre compte est en lecture seule'
    });
  }

  next();
}

/**
 * Middleware optionnel - tente l'authentification mais ne bloque pas
 * Optional middleware - attempts authentication but doesn't block
 *
 * @param {Request} req - Requête Express
 * @param {Response} res - Réponse Express
 * @param {Function} next - Fonction next
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret, jwtConfig.verifyOptions);
    const user = User.findById(decoded.userId);

    if (user) {
      req.user = {
        id: user.id,
        matricule: user.matricule,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role
      };
    }
  } catch (error) {
    // Ignorer les erreurs de token / Ignore token errors
  }

  next();
}

module.exports = {
  authenticateToken,
  requireRole,
  requireWriteAccess,
  optionalAuth
};
