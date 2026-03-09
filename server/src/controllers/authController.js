/**
 * Contrôleur d'authentification
 * Authentication Controller
 *
 * @module controllers/authController
 * @author Renault Group - Service 00596
 */

const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { User, ROLES } = require('../models/User');
const { AuditLog, AUDIT_ACTIONS } = require('../models/AuditLog');

/**
 * Connexion utilisateur
 * User login
 *
 * POST /api/auth/login
 */
async function login(req, res) {
  try {
    const { matricule, password } = req.body;

    // Rechercher l'utilisateur par matricule / Find user by matricule
    const user = User.findByMatricule(matricule);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Matricule ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe / Verify password
    const validPassword = User.verifyPassword(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Matricule ou mot de passe incorrect'
      });
    }

    // Mettre à jour la date de dernière connexion / Update last login
    User.updateLastLogin(user.id);

    // Générer le token JWT / Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        matricule: user.matricule,
        role: user.role
      },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn, algorithm: jwtConfig.algorithm }
    );

    // Calculer l'expiration / Calculate expiration
    const expiresIn = jwtConfig.expiresIn;
    const expiresAt = new Date();
    const hours = parseInt(expiresIn) || 8;
    expiresAt.setHours(expiresAt.getHours() + hours);

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        token,
        expiresAt: expiresAt.toISOString(),
        user: {
          id: user.id,
          matricule: user.matricule,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('[Auth] Erreur login:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Erreur lors de la connexion'
    });
  }
}

/**
 * Inscription utilisateur (admin uniquement)
 * User registration (admin only)
 *
 * POST /api/auth/register
 */
async function register(req, res) {
  try {
    const { matricule, email, password, nom, prenom, role } = req.body;

    // Vérifier que le matricule n'existe pas / Check matricule doesn't exist
    if (User.findByMatricule(matricule)) {
      return res.status(400).json({
        success: false,
        error: 'MATRICULE_EXISTS',
        message: 'Ce matricule est déjà utilisé'
      });
    }

    // Vérifier que l'email n'existe pas / Check email doesn't exist
    if (User.findByEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'EMAIL_EXISTS',
        message: 'Cet email est déjà utilisé'
      });
    }

    // Créer l'utilisateur / Create user
    const newUser = User.create({
      matricule,
      email,
      password,
      nom,
      prenom,
      role: role || ROLES.USER
    });

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: {
        user: {
          id: newUser.id,
          matricule: newUser.matricule,
          email: newUser.email,
          nom: newUser.nom,
          prenom: newUser.prenom,
          role: newUser.role
        }
      }
    });

  } catch (error) {
    console.error('[Auth] Erreur register:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Erreur lors de l\'inscription'
    });
  }
}

/**
 * Récupère le profil de l'utilisateur connecté
 * Get current user profile
 *
 * GET /api/auth/me
 */
async function getProfile(req, res) {
  try {
    const user = User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          matricule: user.matricule,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          role: user.role,
          created_at: user.created_at,
          last_login: user.last_login
        }
      }
    });

  } catch (error) {
    console.error('[Auth] Erreur getProfile:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Erreur lors de la récupération du profil'
    });
  }
}

/**
 * Met à jour le profil de l'utilisateur connecté
 * Update current user profile
 *
 * PUT /api/auth/me
 */
async function updateProfile(req, res) {
  try {
    const { nom, prenom, email, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Si changement de mot de passe, vérifier l'ancien / If password change, verify old one
    if (newPassword) {
      const user = User.findByMatricule(req.user.matricule);

      if (!currentPassword || !User.verifyPassword(currentPassword, user.password_hash)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_PASSWORD',
          message: 'Mot de passe actuel incorrect'
        });
      }
    }

    // Mettre à jour / Update
    const updateData = {};
    if (nom) updateData.nom = nom;
    if (prenom) updateData.prenom = prenom;
    if (email) updateData.email = email;
    if (newPassword) updateData.password = newPassword;

    const updatedUser = User.update(userId, updateData);

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: {
        user: {
          id: updatedUser.id,
          matricule: updatedUser.matricule,
          email: updatedUser.email,
          nom: updatedUser.nom,
          prenom: updatedUser.prenom,
          role: updatedUser.role
        }
      }
    });

  } catch (error) {
    console.error('[Auth] Erreur updateProfile:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Erreur lors de la mise à jour du profil'
    });
  }
}

/**
 * Liste tous les utilisateurs (admin uniquement)
 * List all users (admin only)
 *
 * GET /api/auth/users
 */
async function listUsers(req, res) {
  try {
    const users = User.findAll();

    res.json({
      success: true,
      data: {
        users,
        total: users.length
      }
    });

  } catch (error) {
    console.error('[Auth] Erreur listUsers:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Erreur lors de la récupération des utilisateurs'
    });
  }
}

/**
 * Rafraîchit le token JWT
 * Refresh JWT token
 *
 * POST /api/auth/refresh
 */
async function refreshToken(req, res) {
  try {
    const user = User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'Utilisateur non trouvé'
      });
    }

    // Générer un nouveau token / Generate new token
    const token = jwt.sign(
      {
        userId: user.id,
        matricule: user.matricule,
        role: user.role
      },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn, algorithm: jwtConfig.algorithm }
    );

    const expiresAt = new Date();
    const hours = parseInt(jwtConfig.expiresIn) || 8;
    expiresAt.setHours(expiresAt.getHours() + hours);

    res.json({
      success: true,
      message: 'Token rafraîchi',
      data: {
        token,
        expiresAt: expiresAt.toISOString()
      }
    });

  } catch (error) {
    console.error('[Auth] Erreur refreshToken:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Erreur lors du rafraîchissement du token'
    });
  }
}

module.exports = {
  login,
  register,
  getProfile,
  updateProfile,
  listUsers,
  refreshToken
};
