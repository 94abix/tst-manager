/**
 * Générateur d'identifiants uniques
 * Unique ID Generator
 *
 * @module utils/idGenerator
 * @author Renault Group - Service 00596
 */

const { v4: uuidv4, validate: uuidValidate } = require('uuid');

/**
 * Génère un UUID v4
 * Generate UUID v4
 *
 * @returns {string} UUID v4
 */
function generateUUID() {
  return uuidv4();
}

/**
 * Valide un UUID
 * Validate UUID
 *
 * @param {string} id - ID à valider
 * @returns {boolean} Valide ou non
 */
function isValidUUID(id) {
  return uuidValidate(id);
}

/**
 * Génère une référence TST unique
 * Generate unique TST reference
 *
 * Format: TST-YYYY-NNNNNN
 * Exemple: TST-2025-000001
 *
 * @param {Function} getLastReference - Fonction pour obtenir la dernière référence
 * @returns {string} Référence TST
 */
function generateTSTReference(getLastReference) {
  const year = new Date().getFullYear();
  const prefix = `TST-${year}-`;

  const lastRef = getLastReference ? getLastReference(prefix) : null;

  let nextNum = 1;
  if (lastRef) {
    const parts = lastRef.split('-');
    if (parts.length === 3) {
      nextNum = parseInt(parts[2], 10) + 1;
    }
  }

  return `${prefix}${String(nextNum).padStart(6, '0')}`;
}

/**
 * Génère un code de vérification (pour les exports)
 * Generate verification code (for exports)
 *
 * @param {string} formId - ID de la fiche
 * @param {string} timestamp - Horodatage
 * @returns {string} Code de vérification
 */
function generateVerificationCode(formId, timestamp) {
  const crypto = require('crypto');
  const data = `${formId}-${timestamp}`;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 12).toUpperCase();
}

/**
 * Génère un matricule temporaire (pour les tests)
 * Generate temporary matricule (for testing)
 *
 * @returns {string} Matricule temporaire
 */
function generateTempMatricule() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `TEMP${timestamp}${random}`;
}

module.exports = {
  generateUUID,
  isValidUUID,
  generateTSTReference,
  generateVerificationCode,
  generateTempMatricule
};
