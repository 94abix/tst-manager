/**
 * Composant Badge de Statut
 * Status Badge Component
 *
 * @author Renault Group - Service 00596
 */

import { TST_STATUS, TST_STATUS_LABELS } from '../../utils/constants';

/**
 * Badge de statut pour les fiches TST
 *
 * @param {Object} props
 * @param {string} props.status - Statut de la fiche
 * @param {string} props.size - Taille du badge ('sm', 'md', 'lg')
 */
function StatusBadge({ status, size = 'md' }) {
  // Configuration des styles par statut
  const statusConfig = {
    [TST_STATUS.BROUILLON]: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-300',
      dot: 'bg-gray-500'
    },
    [TST_STATUS.EN_COURS]: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-300',
      dot: 'bg-yellow-500'
    },
    [TST_STATUS.VALIDE]: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-300',
      dot: 'bg-green-500'
    },
    [TST_STATUS.ARCHIVE]: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-300',
      dot: 'bg-blue-500'
    }
  };

  // Configuration des tailles
  const sizeConfig = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const config = statusConfig[status] || statusConfig[TST_STATUS.BROUILLON];
  const sizeClass = sizeConfig[size] || sizeConfig.md;
  const label = TST_STATUS_LABELS[status] || status;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium border
        ${config.bg} ${config.text} ${config.border} ${sizeClass}
      `}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot}`}></span>
      {label}
    </span>
  );
}

export default StatusBadge;
