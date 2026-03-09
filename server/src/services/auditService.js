/**
 * Service d'audit et traçabilité
 * Audit Service - Centralizes audit logging operations
 *
 * @module services/auditService
 * @author Renault Group - Service 00596
 */

const { AuditLog, AUDIT_ACTIONS } = require('../models/AuditLog');

/**
 * Crée une entrée d'audit pour une action utilisateur
 * Create audit entry for user action
 *
 * @param {Object} params - Paramètres de l'entrée
 * @param {string} params.tstFormId - ID de la fiche TST
 * @param {string} params.userId - ID de l'utilisateur
 * @param {string} params.action - Type d'action
 * @param {Object} params.changes - Modifications apportées
 * @param {Object} params.request - Objet requête Express (pour IP et User-Agent)
 * @returns {Object} Entrée d'audit créée
 */
function logAction({ tstFormId, userId, action, changes = null, request = null }) {
  return AuditLog.create({
    tst_form_id: tstFormId,
    user_id: userId,
    action,
    champs_modifies: changes,
    ip_address: request ? getClientIP(request) : null,
    user_agent: request ? request.get('user-agent') : null
  });
}

/**
 * Log la création d'une fiche
 * Log form creation
 */
function logCreation(tstFormId, userId, request) {
  return logAction({
    tstFormId,
    userId,
    action: AUDIT_ACTIONS.CREATION,
    request
  });
}

/**
 * Log une modification de fiche
 * Log form modification
 */
function logModification(tstFormId, userId, oldData, newData, request) {
  const changes = AuditLog.calculateDiff(oldData, newData);
  return logAction({
    tstFormId,
    userId,
    action: AUDIT_ACTIONS.MODIFICATION,
    changes,
    request
  });
}

/**
 * Log le démarrage des travaux
 * Log work start
 */
function logStartWork(tstFormId, userId, request) {
  return logAction({
    tstFormId,
    userId,
    action: AUDIT_ACTIONS.START_WORK,
    request
  });
}

/**
 * Log la fin des travaux
 * Log work end
 */
function logEndWork(tstFormId, userId, request) {
  return logAction({
    tstFormId,
    userId,
    action: AUDIT_ACTIONS.END_WORK,
    request
  });
}

/**
 * Log la validation d'une fiche
 * Log form validation
 */
function logValidation(tstFormId, userId, request) {
  return logAction({
    tstFormId,
    userId,
    action: AUDIT_ACTIONS.VALIDATION,
    request
  });
}

/**
 * Log l'archivage d'une fiche
 * Log form archive
 */
function logArchive(tstFormId, userId, request) {
  return logAction({
    tstFormId,
    userId,
    action: AUDIT_ACTIONS.ARCHIVE,
    request
  });
}

/**
 * Log l'export PDF
 * Log PDF export
 */
function logPDFExport(tstFormId, userId, request) {
  return logAction({
    tstFormId,
    userId,
    action: AUDIT_ACTIONS.EXPORT_PDF,
    request
  });
}

/**
 * Log la consultation d'une fiche
 * Log form consultation
 */
function logConsultation(tstFormId, userId, request) {
  return logAction({
    tstFormId,
    userId,
    action: AUDIT_ACTIONS.CONSULTATION,
    request
  });
}

/**
 * Log l'ajout d'une signature
 * Log signature addition
 */
function logSignature(tstFormId, userId, signatureType, request) {
  return logAction({
    tstFormId,
    userId,
    action: AUDIT_ACTIONS.SIGNATURE,
    changes: { signature_type: signatureType },
    request
  });
}

/**
 * Récupère l'historique complet d'une fiche
 * Get complete form history
 *
 * @param {string} tstFormId - ID de la fiche
 * @returns {Array} Historique des actions
 */
function getFormHistory(tstFormId) {
  return AuditLog.findByTSTForm(tstFormId);
}

/**
 * Récupère les actions récentes d'un utilisateur
 * Get recent user actions
 *
 * @param {string} userId - ID de l'utilisateur
 * @param {number} limit - Nombre maximum d'entrées
 * @returns {Array} Actions récentes
 */
function getUserRecentActions(userId, limit = 50) {
  return AuditLog.findByUser(userId, { limit });
}

/**
 * Génère un rapport d'audit pour une période
 * Generate audit report for a period
 *
 * @param {string} dateDebut - Date de début (ISO)
 * @param {string} dateFin - Date de fin (ISO)
 * @returns {Object} Rapport d'audit
 */
function generateAuditReport(dateDebut, dateFin) {
  const entries = AuditLog.findAll({
    date_debut: dateDebut,
    date_fin: dateFin
  });

  // Statistiques par action / Statistics by action
  const actionStats = {};
  for (const action of Object.values(AUDIT_ACTIONS)) {
    actionStats[action] = entries.filter(e => e.action === action).length;
  }

  // Statistiques par utilisateur / Statistics by user
  const userStats = {};
  for (const entry of entries) {
    const userName = entry.user_nom || 'Utilisateur inconnu';
    if (!userStats[userName]) {
      userStats[userName] = 0;
    }
    userStats[userName]++;
  }

  return {
    period: { start: dateDebut, end: dateFin },
    totalActions: entries.length,
    byAction: actionStats,
    byUser: userStats,
    entries: entries.slice(0, 100) // Limiter à 100 entrées
  };
}

/**
 * Extrait l'IP du client depuis la requête
 * Extract client IP from request
 *
 * @param {Object} req - Requête Express
 * @returns {string} Adresse IP
 */
function getClientIP(req) {
  return req.ip ||
         req.headers['x-forwarded-for']?.split(',')[0] ||
         req.connection?.remoteAddress ||
         'unknown';
}

module.exports = {
  logAction,
  logCreation,
  logModification,
  logStartWork,
  logEndWork,
  logValidation,
  logArchive,
  logPDFExport,
  logConsultation,
  logSignature,
  getFormHistory,
  getUserRecentActions,
  generateAuditReport,
  AUDIT_ACTIONS
};
