/**
 * Fonctions de validation
 * Validation Functions
 *
 * @module utils/validators
 * @author Renault Group - Service 00596
 */

/**
 * Valide un email
 * Validate email
 *
 * @param {string} email - Email à valider
 * @returns {boolean} Valide ou non
 */
export function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Valide un matricule
 * Validate matricule
 *
 * @param {string} matricule - Matricule à valider
 * @returns {boolean} Valide ou non
 */
export function isValidMatricule(matricule) {
  if (!matricule) return false;
  const trimmed = matricule.trim();
  return trimmed.length >= 3 && trimmed.length <= 20 && /^[A-Z0-9]+$/i.test(trimmed);
}

/**
 * Valide un mot de passe
 * Validate password
 *
 * @param {string} password - Mot de passe à valider
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validatePassword(password) {
  const errors = [];

  if (!password || password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Valide une date ISO
 * Validate ISO date
 *
 * @param {string} dateStr - Date à valider
 * @returns {boolean} Valide ou non
 */
export function isValidDate(dateStr) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * Valide que la date de fin est après la date de début
 * Validate end date is after start date
 *
 * @param {string} startDate - Date de début
 * @param {string} endDate - Date de fin
 * @returns {boolean} Valide ou non
 */
export function isEndDateAfterStart(startDate, endDate) {
  if (!startDate || !endDate) return false;
  return new Date(endDate) > new Date(startDate);
}

/**
 * Valide qu'une date est dans le futur
 * Validate date is in future
 *
 * @param {string} dateStr - Date à valider
 * @returns {boolean} Dans le futur ou non
 */
export function isFutureDate(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) > new Date();
}

/**
 * Valide les champs requis d'un formulaire
 * Validate required form fields
 *
 * @param {Object} data - Données du formulaire
 * @param {string[]} requiredFields - Champs requis
 * @returns {Object} { valid: boolean, errors: { field: message } }
 */
export function validateRequiredFields(data, requiredFields) {
  const errors = {};

  for (const field of requiredFields) {
    const value = data[field];
    if (value === undefined || value === null || value === '') {
      errors[field] = 'Ce champ est requis';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Valide un formulaire TST complet
 * Validate complete TST form
 *
 * @param {Object} formData - Données du formulaire
 * @param {string} currentStatus - Statut actuel
 * @returns {Object} { valid: boolean, errors: { field: message } }
 */
export function validateTSTForm(formData, currentStatus = 'brouillon') {
  const errors = {};

  // Champs toujours requis / Always required fields
  const baseRequired = [
    'type_batterie',
    'identification_bin',
    'lieu_intervention',
    'nature_travaux',
    'autorisation_debut',
    'autorisation_fin',
    'responsable_exploitation_id',
    'charge_travaux_ordre_id'
  ];

  for (const field of baseRequired) {
    if (!formData[field]) {
      errors[field] = 'Ce champ est requis';
    }
  }

  // Validation des dates / Date validation
  if (formData.autorisation_debut && formData.autorisation_fin) {
    if (!isEndDateAfterStart(formData.autorisation_debut, formData.autorisation_fin)) {
      errors.autorisation_fin = 'La date de fin doit être postérieure à la date de début';
    }
  }

  // Champs requis pour démarrer les travaux / Required to start work
  if (currentStatus === 'brouillon') {
    // Pas de validation supplémentaire pour les brouillons
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Valide les données de début de travaux
 * Validate start work data
 *
 * @param {Object} data - Données de début de travaux
 * @returns {Object} { valid: boolean, errors: { field: message } }
 */
export function validateStartWorkData(data) {
  const errors = {};

  if (!data.charge_travaux_debut_id) {
    errors.charge_travaux_debut_id = 'Le chargé de travaux est requis';
  }

  if (!data.executant_id) {
    errors.executant_id = 'L\'exécutant est requis';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Valide les données de fin de travaux
 * Validate end work data
 *
 * @param {Object} data - Données de fin de travaux
 * @returns {Object} { valid: boolean, errors: { field: message } }
 */
export function validateEndWorkData(data) {
  const errors = {};

  if (!data.etat_batterie_fin) {
    errors.etat_batterie_fin = 'L\'état de la batterie est requis';
  }

  if (!data.charge_travaux_fin_id) {
    errors.charge_travaux_fin_id = 'Le chargé de travaux est requis';
  }

  if (!data.responsable_fin_id) {
    errors.responsable_fin_id = 'Le responsable d\'exploitation est requis';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Valide un intervenant
 * Validate intervener
 *
 * @param {Object} data - Données de l'intervenant
 * @returns {Object} { valid: boolean, errors: { field: message } }
 */
export function validateIntervener(data) {
  const errors = {};

  if (!data.matricule || !isValidMatricule(data.matricule)) {
    errors.matricule = 'Matricule invalide (3-20 caractères alphanumériques)';
  }

  if (!data.nom || data.nom.trim().length === 0) {
    errors.nom = 'Le nom est requis';
  }

  if (!data.prenom || data.prenom.trim().length === 0) {
    errors.prenom = 'Le prénom est requis';
  }

  if (!data.entreprise || data.entreprise.trim().length === 0) {
    errors.entreprise = 'L\'entreprise est requise';
  }

  if (!data.fonction || data.fonction.trim().length === 0) {
    errors.fonction = 'La fonction est requise';
  }

  if (!data.type_habilitation) {
    errors.type_habilitation = 'Le type d\'habilitation est requis';
  }

  if (!data.date_validite_hab) {
    errors.date_validite_hab = 'La date de validité est requise';
  } else if (!isFutureDate(data.date_validite_hab)) {
    errors.date_validite_hab = 'La date de validité doit être dans le futur';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}
