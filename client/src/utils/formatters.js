/**
 * Fonctions de formatage
 * Formatting Functions
 *
 * @module utils/formatters
 * @author Renault Group - Service 00596
 */

import dayjs from 'dayjs';
import 'dayjs/locale/fr';

// Configurer dayjs en français / Configure dayjs in French
dayjs.locale('fr');

/**
 * Formate une date pour l'affichage
 * Format date for display
 *
 * @param {string|Date} date - Date à formater
 * @param {string} format - Format souhaité
 * @returns {string} Date formatée
 */
export function formatDate(date, format = 'DD/MM/YYYY') {
  if (!date) return '-';
  return dayjs(date).format(format);
}

/**
 * Formate une date et heure
 * Format datetime
 *
 * @param {string|Date} date - Date à formater
 * @returns {string} Date et heure formatées
 */
export function formatDateTime(date) {
  if (!date) return '-';
  return dayjs(date).format('DD/MM/YYYY à HH:mm');
}

/**
 * Formate une heure
 * Format time
 *
 * @param {string|Date} date - Date à formater
 * @returns {string} Heure formatée
 */
export function formatTime(date) {
  if (!date) return '-';
  return dayjs(date).format('HH:mm');
}

/**
 * Formate une date relative (il y a X jours, etc.)
 * Format relative date
 *
 * @param {string|Date} date - Date à formater
 * @returns {string} Date relative
 */
export function formatRelativeDate(date) {
  if (!date) return '-';

  const d = dayjs(date);
  const now = dayjs();
  const diffDays = now.diff(d, 'day');
  const diffHours = now.diff(d, 'hour');
  const diffMinutes = now.diff(d, 'minute');

  if (diffMinutes < 1) return 'À l\'instant';
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;

  return formatDate(date);
}

/**
 * Formate une date pour un input datetime-local
 * Format date for datetime-local input
 *
 * @param {string|Date} date - Date à formater
 * @returns {string} Date au format input
 */
export function formatDateForInput(date) {
  if (!date) return '';
  return dayjs(date).format('YYYY-MM-DDTHH:mm');
}

/**
 * Formate une date pour un input date
 * Format date for date input
 *
 * @param {string|Date} date - Date à formater
 * @returns {string} Date au format input
 */
export function formatDateOnlyForInput(date) {
  if (!date) return '';
  return dayjs(date).format('YYYY-MM-DD');
}

/**
 * Formate un nom complet
 * Format full name
 *
 * @param {string} nom - Nom
 * @param {string} prenom - Prénom
 * @returns {string} Nom complet
 */
export function formatFullName(nom, prenom) {
  if (!nom && !prenom) return '-';
  return `${prenom || ''} ${nom || ''}`.trim();
}

/**
 * Formate un matricule en majuscules
 * Format matricule in uppercase
 *
 * @param {string} matricule - Matricule
 * @returns {string} Matricule formaté
 */
export function formatMatricule(matricule) {
  if (!matricule) return '-';
  return matricule.toUpperCase();
}

/**
 * Formate un numéro de référence TST
 * Format TST reference number
 *
 * @param {string} reference - Référence TST
 * @returns {string} Référence formatée
 */
export function formatReference(reference) {
  if (!reference) return '-';
  return reference;
}

/**
 * Tronque un texte avec ellipsis
 * Truncate text with ellipsis
 *
 * @param {string} text - Texte à tronquer
 * @param {number} maxLength - Longueur maximum
 * @returns {string} Texte tronqué
 */
export function truncate(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Formate un nombre avec séparateur de milliers
 * Format number with thousand separator
 *
 * @param {number} num - Nombre à formater
 * @returns {string} Nombre formaté
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '-';
  return new Intl.NumberFormat('fr-FR').format(num);
}

/**
 * Capitalise la première lettre
 * Capitalize first letter
 *
 * @param {string} str - Chaîne à capitaliser
 * @returns {string} Chaîne capitalisée
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Formate les jours restants avant expiration
 * Format days remaining before expiration
 *
 * @param {string|Date} expiryDate - Date d'expiration
 * @returns {string} Texte formaté
 */
export function formatExpiryStatus(expiryDate) {
  if (!expiryDate) return 'Non définie';

  const d = dayjs(expiryDate);
  const now = dayjs();
  const diffDays = d.diff(now, 'day');

  if (diffDays < 0) {
    return `Expirée depuis ${Math.abs(diffDays)} jour(s)`;
  }
  if (diffDays === 0) {
    return 'Expire aujourd\'hui';
  }
  if (diffDays <= 30) {
    return `Expire dans ${diffDays} jour(s)`;
  }

  return formatDate(expiryDate);
}

/**
 * Retourne la classe CSS pour le statut d'expiration
 * Return CSS class for expiry status
 *
 * @param {string|Date} expiryDate - Date d'expiration
 * @returns {string} Classe CSS
 */
export function getExpiryClass(expiryDate) {
  if (!expiryDate) return 'text-gray-500';

  const d = dayjs(expiryDate);
  const now = dayjs();
  const diffDays = d.diff(now, 'day');

  if (diffDays < 0) return 'text-red-600';
  if (diffDays <= 30) return 'text-yellow-600';
  return 'text-green-600';
}
