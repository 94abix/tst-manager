/**
 * Composant Filtres de recherche
 * Search Filter Component
 *
 * @author Renault Group - Service 00596
 */

import { useState } from 'react';
import { Search, Filter, X, Calendar } from 'lucide-react';
import { TST_STATUS, TST_STATUS_LABELS } from '../../utils/constants';

/**
 * Barre de filtres pour les listes
 *
 * @param {Object} props
 * @param {Object} props.filters - Filtres actuels
 * @param {Function} props.onFilterChange - Callback changement de filtres
 * @param {Function} props.onReset - Callback réinitialisation
 * @param {boolean} props.showStatusFilter - Afficher le filtre de statut
 * @param {boolean} props.showDateFilter - Afficher le filtre de date
 */
function SearchFilter({
  filters = {},
  onFilterChange,
  onReset,
  showStatusFilter = true,
  showDateFilter = true,
  placeholder = 'Rechercher...'
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Gérer le changement d'un filtre / Handle filter change
  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  // Compter les filtres actifs / Count active filters
  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== '' && v !== null && v !== undefined
  ).length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {/* Barre de recherche principale / Main search bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={placeholder}
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            className="form-input pl-10"
          />
        </div>

        {/* Bouton filtres avancés / Advanced filters button */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`
            btn-outline flex items-center gap-2
            ${showAdvanced || activeFiltersCount > 0 ? 'border-renault-yellow bg-yellow-50' : ''}
          `}
        >
          <Filter className="w-4 h-4" />
          Filtres
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-renault-yellow text-black text-xs flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Bouton réinitialiser / Reset button */}
        {activeFiltersCount > 0 && (
          <button
            onClick={onReset}
            className="btn-outline text-red-600 border-red-200 hover:bg-red-50"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filtres avancés / Advanced filters */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
          {/* Filtre statut / Status filter */}
          {showStatusFilter && (
            <div>
              <label className="form-label">Statut</label>
              <select
                value={filters.statut || ''}
                onChange={(e) => handleChange('statut', e.target.value)}
                className="form-input"
              >
                <option value="">Tous les statuts</option>
                {Object.entries(TST_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Filtre date début / Start date filter */}
          {showDateFilter && (
            <>
              <div>
                <label className="form-label">Date début</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={filters.date_debut || ''}
                    onChange={(e) => handleChange('date_debut', e.target.value)}
                    className="form-input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Date fin</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={filters.date_fin || ''}
                    onChange={(e) => handleChange('date_fin', e.target.value)}
                    className="form-input pl-10"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchFilter;
