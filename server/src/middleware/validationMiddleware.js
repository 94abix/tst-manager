/**
 * Middleware de validation des requêtes
 * Request Validation Middleware
 *
 * @module middleware/validationMiddleware
 * @author Renault Group - Service 00596
 */

const { validationResult, body, param, query } = require('express-validator');

/**
 * Gère les erreurs de validation
 * Handle validation errors
 *
 * @param {Request} req - Requête Express
 * @param {Response} res - Réponse Express
 * @param {Function} next - Fonction next
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Erreurs de validation',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }

  next();
}

// Règles de validation pour l'authentification / Authentication validation rules
const authValidation = {
  login: [
    body('matricule')
      .trim()
      .notEmpty().withMessage('Le matricule est requis')
      .isLength({ min: 3, max: 20 }).withMessage('Le matricule doit contenir entre 3 et 20 caractères'),
    body('password')
      .notEmpty().withMessage('Le mot de passe est requis')
  ],

  register: [
    body('matricule')
      .trim()
      .notEmpty().withMessage('Le matricule est requis')
      .isLength({ min: 3, max: 20 }).withMessage('Le matricule doit contenir entre 3 et 20 caractères')
      .matches(/^[A-Z0-9]+$/i).withMessage('Le matricule ne doit contenir que des lettres et chiffres'),
    body('email')
      .trim()
      .isEmail().withMessage('Email invalide')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
      .matches(/[A-Z]/).withMessage('Le mot de passe doit contenir au moins une majuscule')
      .matches(/[0-9]/).withMessage('Le mot de passe doit contenir au moins un chiffre'),
    body('nom')
      .trim()
      .notEmpty().withMessage('Le nom est requis')
      .isLength({ max: 100 }).withMessage('Le nom ne doit pas dépasser 100 caractères'),
    body('prenom')
      .trim()
      .notEmpty().withMessage('Le prénom est requis')
      .isLength({ max: 100 }).withMessage('Le prénom ne doit pas dépasser 100 caractères')
  ]
};

// Règles de validation pour les intervenants / Intervener validation rules
const intervenerValidation = {
  create: [
    body('matricule')
      .trim()
      .notEmpty().withMessage('Le matricule est requis')
      .isLength({ min: 3, max: 20 }).withMessage('Le matricule doit contenir entre 3 et 20 caractères'),
    body('nom')
      .trim()
      .notEmpty().withMessage('Le nom est requis')
      .isLength({ max: 100 }).withMessage('Le nom ne doit pas dépasser 100 caractères'),
    body('prenom')
      .trim()
      .notEmpty().withMessage('Le prénom est requis')
      .isLength({ max: 100 }).withMessage('Le prénom ne doit pas dépasser 100 caractères'),
    body('entreprise')
      .trim()
      .notEmpty().withMessage('L\'entreprise est requise')
      .isLength({ max: 100 }).withMessage('L\'entreprise ne doit pas dépasser 100 caractères'),
    body('fonction')
      .trim()
      .notEmpty().withMessage('La fonction est requise')
      .isLength({ max: 100 }).withMessage('La fonction ne doit pas dépasser 100 caractères'),
    body('type_habilitation')
      .trim()
      .notEmpty().withMessage('Le type d\'habilitation est requis')
      .isIn(['B0', 'B1', 'B1V', 'B1TL', 'B2', 'B2V', 'B2TL', 'BR', 'BC', 'BE', 'H0', 'H1', 'H2'])
      .withMessage('Type d\'habilitation invalide'),
    body('date_validite_hab')
      .isISO8601().withMessage('Date de validité invalide (format: YYYY-MM-DD)')
      .custom((value) => {
        const date = new Date(value);
        const today = new Date();
        if (date < today) {
          throw new Error('La date de validité doit être dans le futur');
        }
        return true;
      })
  ],

  update: [
    param('id').isUUID().withMessage('ID intervenant invalide'),
    body('matricule')
      .optional()
      .trim()
      .isLength({ min: 3, max: 20 }).withMessage('Le matricule doit contenir entre 3 et 20 caractères'),
    body('type_habilitation')
      .optional()
      .isIn(['B0', 'B1', 'B1V', 'B1TL', 'B2', 'B2V', 'B2TL', 'BR', 'BC', 'BE', 'H0', 'H1', 'H2'])
      .withMessage('Type d\'habilitation invalide'),
    body('date_validite_hab')
      .optional()
      .isISO8601().withMessage('Date de validité invalide')
  ]
};

// Règles de validation pour les fiches TST / TST form validation rules
const tstFormValidation = {
  create: [
    body('type_batterie')
      .trim()
      .notEmpty().withMessage('Le type de batterie/véhicule est requis')
      .isLength({ max: 100 }).withMessage('Le type de batterie ne doit pas dépasser 100 caractères'),
    body('identification_bin')
      .trim()
      .notEmpty().withMessage('L\'identification BIN est requise')
      .isLength({ max: 50 }).withMessage('L\'identification BIN ne doit pas dépasser 50 caractères'),
    body('lieu_intervention')
      .trim()
      .notEmpty().withMessage('Le lieu d\'intervention est requis')
      .isLength({ max: 200 }).withMessage('Le lieu d\'intervention ne doit pas dépasser 200 caractères'),
    body('nature_travaux')
      .trim()
      .notEmpty().withMessage('La nature des travaux est requise'),
    body('autorisation_debut')
      .isISO8601().withMessage('Date de début d\'autorisation invalide'),
    body('autorisation_fin')
      .isISO8601().withMessage('Date de fin d\'autorisation invalide')
      .custom((value, { req }) => {
        const debut = new Date(req.body.autorisation_debut);
        const fin = new Date(value);
        if (fin <= debut) {
          throw new Error('La date de fin doit être postérieure à la date de début');
        }
        return true;
      }),
    body('delai_fin_travail')
      .isISO8601().withMessage('Délai de fin de travail invalide'),
    body('responsable_exploitation_id')
      .isUUID().withMessage('ID responsable d\'exploitation invalide'),
    body('charge_travaux_ordre_id')
      .isUUID().withMessage('ID chargé de travaux invalide')
  ],

  update: [
    param('id').isUUID().withMessage('ID fiche TST invalide'),
    body('type_batterie')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Le type de batterie ne doit pas dépasser 100 caractères'),
    body('autorisation_debut')
      .optional()
      .isISO8601().withMessage('Date de début d\'autorisation invalide'),
    body('autorisation_fin')
      .optional()
      .isISO8601().withMessage('Date de fin d\'autorisation invalide')
  ],

  startWork: [
    param('id').isUUID().withMessage('ID fiche TST invalide'),
    body('charge_travaux_debut_id')
      .isUUID().withMessage('ID chargé de travaux invalide'),
    body('executant_id')
      .isUUID().withMessage('ID exécutant invalide')
  ],

  endWork: [
    param('id').isUUID().withMessage('ID fiche TST invalide'),
    body('etat_batterie_fin')
      .trim()
      .notEmpty().withMessage('L\'état de la batterie est requis'),
    body('charge_travaux_fin_id')
      .isUUID().withMessage('ID chargé de travaux invalide'),
    body('responsable_fin_id')
      .isUUID().withMessage('ID responsable invalide')
  ]
};

// Règles de validation pour les filtres de recherche / Search filter validation rules
const searchValidation = {
  tstForms: [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page invalide'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limite invalide (1-100)'),
    query('statut')
      .optional()
      .isIn(['brouillon', 'en_cours', 'valide', 'archive'])
      .withMessage('Statut invalide'),
    query('date_debut')
      .optional()
      .isISO8601().withMessage('Date de début invalide'),
    query('date_fin')
      .optional()
      .isISO8601().withMessage('Date de fin invalide')
  ]
};

module.exports = {
  handleValidationErrors,
  authValidation,
  intervenerValidation,
  tstFormValidation,
  searchValidation
};
