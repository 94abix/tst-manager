/**
 * Utilitaires de manipulation de dates
 * Date Manipulation Utilities
 *
 * @module utils/dateUtils
 * @author Renault Group - Service 00596
 */

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const isBetween = require('dayjs/plugin/isBetween');

// Plugins dayjs
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

// Fuseau horaire par défaut (France) / Default timezone (France)
const DEFAULT_TIMEZONE = 'Europe/Paris';

/**
 * Retourne la date et heure actuelle en ISO
 * Return current datetime in ISO format
 *
 * @returns {string} Date ISO
 */
function now() {
  return dayjs().toISOString();
}

/**
 * Retourne la date actuelle (sans heure)
 * Return current date (without time)
 *
 * @returns {string} Date YYYY-MM-DD
 */
function today() {
  return dayjs().format('YYYY-MM-DD');
}

/**
 * Formate une date pour l'affichage
 * Format date for display
 *
 * @param {string|Date} date - Date à formater
 * @param {string} format - Format souhaité (défaut: DD/MM/YYYY)
 * @returns {string} Date formatée
 */
function formatDate(date, format = 'DD/MM/YYYY') {
  if (!date) return '-';
  return dayjs(date).format(format);
}

/**
 * Formate une date et heure pour l'affichage
 * Format datetime for display
 *
 * @param {string|Date} date - Date à formater
 * @param {string} format - Format souhaité (défaut: DD/MM/YYYY HH:mm)
 * @returns {string} Date formatée
 */
function formatDateTime(date, format = 'DD/MM/YYYY HH:mm') {
  if (!date) return '-';
  return dayjs(date).format(format);
}

/**
 * Formate une heure pour l'affichage
 * Format time for display
 *
 * @param {string|Date} date - Date à formater
 * @returns {string} Heure formatée (HH:mm)
 */
function formatTime(date) {
  if (!date) return '-';
  return dayjs(date).format('HH:mm');
}

/**
 * Parse une date depuis différents formats
 * Parse date from various formats
 *
 * @param {string} dateStr - Chaîne de date
 * @returns {dayjs.Dayjs|null} Objet dayjs ou null
 */
function parseDate(dateStr) {
  if (!dateStr) return null;

  // Formats supportés / Supported formats
  const formats = [
    'YYYY-MM-DD',
    'YYYY-MM-DDTHH:mm:ss.SSSZ',
    'YYYY-MM-DDTHH:mm:ssZ',
    'YYYY-MM-DDTHH:mm:ss',
    'DD/MM/YYYY',
    'DD/MM/YYYY HH:mm',
    'DD-MM-YYYY',
    'DD-MM-YYYY HH:mm'
  ];

  for (const format of formats) {
    const parsed = dayjs(dateStr, format, true);
    if (parsed.isValid()) {
      return parsed;
    }
  }

  // Essayer le parsing automatique / Try automatic parsing
  const auto = dayjs(dateStr);
  return auto.isValid() ? auto : null;
}

/**
 * Vérifie si une date est dans le passé
 * Check if date is in the past
 *
 * @param {string|Date} date - Date à vérifier
 * @returns {boolean} Vrai si dans le passé
 */
function isPast(date) {
  return dayjs(date).isBefore(dayjs());
}

/**
 * Vérifie si une date est dans le futur
 * Check if date is in the future
 *
 * @param {string|Date} date - Date à vérifier
 * @returns {boolean} Vrai si dans le futur
 */
function isFuture(date) {
  return dayjs(date).isAfter(dayjs());
}

/**
 * Vérifie si une date est aujourd'hui
 * Check if date is today
 *
 * @param {string|Date} date - Date à vérifier
 * @returns {boolean} Vrai si aujourd'hui
 */
function isToday(date) {
  return dayjs(date).isSame(dayjs(), 'day');
}

/**
 * Vérifie si une date est entre deux autres
 * Check if date is between two others
 *
 * @param {string|Date} date - Date à vérifier
 * @param {string|Date} start - Date de début
 * @param {string|Date} end - Date de fin
 * @returns {boolean} Vrai si entre les deux dates
 */
function isBetweenDates(date, start, end) {
  return dayjs(date).isBetween(start, end, null, '[]');
}

/**
 * Calcule la différence entre deux dates
 * Calculate difference between two dates
 *
 * @param {string|Date} date1 - Première date
 * @param {string|Date} date2 - Deuxième date
 * @param {string} unit - Unité (day, hour, minute, etc.)
 * @returns {number} Différence dans l'unité spécifiée
 */
function diffDates(date1, date2, unit = 'day') {
  return dayjs(date1).diff(dayjs(date2), unit);
}

/**
 * Ajoute une durée à une date
 * Add duration to date
 *
 * @param {string|Date} date - Date de départ
 * @param {number} amount - Quantité à ajouter
 * @param {string} unit - Unité (day, hour, minute, etc.)
 * @returns {string} Nouvelle date ISO
 */
function addToDate(date, amount, unit = 'day') {
  return dayjs(date).add(amount, unit).toISOString();
}

/**
 * Soustrait une durée d'une date
 * Subtract duration from date
 *
 * @param {string|Date} date - Date de départ
 * @param {number} amount - Quantité à soustraire
 * @param {string} unit - Unité (day, hour, minute, etc.)
 * @returns {string} Nouvelle date ISO
 */
function subtractFromDate(date, amount, unit = 'day') {
  return dayjs(date).subtract(amount, unit).toISOString();
}

/**
 * Retourne le début d'une période
 * Return start of period
 *
 * @param {string|Date} date - Date de référence
 * @param {string} unit - Unité (day, week, month, year)
 * @returns {string} Date ISO du début de la période
 */
function startOf(date, unit = 'day') {
  return dayjs(date).startOf(unit).toISOString();
}

/**
 * Retourne la fin d'une période
 * Return end of period
 *
 * @param {string|Date} date - Date de référence
 * @param {string} unit - Unité (day, week, month, year)
 * @returns {string} Date ISO de la fin de la période
 */
function endOf(date, unit = 'day') {
  return dayjs(date).endOf(unit).toISOString();
}

/**
 * Vérifie si une habilitation est expirée
 * Check if habilitation is expired
 *
 * @param {string|Date} expiryDate - Date d'expiration
 * @returns {boolean} Vrai si expirée
 */
function isHabilitationExpired(expiryDate) {
  if (!expiryDate) return true;
  return dayjs(expiryDate).isBefore(dayjs(), 'day');
}

/**
 * Calcule les jours restants avant expiration
 * Calculate days remaining before expiration
 *
 * @param {string|Date} expiryDate - Date d'expiration
 * @returns {number} Nombre de jours restants (négatif si expiré)
 */
function daysUntilExpiry(expiryDate) {
  if (!expiryDate) return -Infinity;
  return dayjs(expiryDate).diff(dayjs(), 'day');
}

module.exports = {
  now,
  today,
  formatDate,
  formatDateTime,
  formatTime,
  parseDate,
  isPast,
  isFuture,
  isToday,
  isBetweenDates,
  diffDates,
  addToDate,
  subtractFromDate,
  startOf,
  endOf,
  isHabilitationExpired,
  daysUntilExpiry,
  DEFAULT_TIMEZONE
};
