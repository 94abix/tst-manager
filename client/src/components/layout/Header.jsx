/**
 * Composant Header
 * Header Component - Barre supérieure
 *
 * @author Renault Group - Service 00596
 */

import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Bell,
  User,
  ChevronRight,
  Home
} from 'lucide-react';

/**
 * Mapping des routes vers les titres / Route to title mapping
 */
const routeTitles = {
  '/': 'Tableau de bord',
  '/nouvelle-fiche': 'Nouvelle fiche TST',
  '/archives': 'Archives',
  '/intervenants': 'Annuaire des intervenants'
};

/**
 * Header de l'application
 */
function Header() {
  const location = useLocation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Déterminer le titre de la page / Determine page title
  const getPageTitle = () => {
    // Route exacte / Exact route
    if (routeTitles[location.pathname]) {
      return routeTitles[location.pathname];
    }

    // Route dynamique (fiche/:id) / Dynamic route
    if (location.pathname.startsWith('/fiche/')) {
      if (location.pathname.endsWith('/edit')) {
        return 'Modifier la fiche';
      }
      return 'Détail de la fiche';
    }

    return 'TST Manager';
  };

  // Générer le fil d'Ariane / Generate breadcrumb
  const getBreadcrumbs = () => {
    const breadcrumbs = [
      { label: 'Accueil', to: '/', icon: Home }
    ];

    if (location.pathname !== '/') {
      const title = getPageTitle();
      breadcrumbs.push({ label: title, to: location.pathname });
    }

    return breadcrumbs;
  };

  return (
    <header className="header flex items-center justify-between px-6">
      {/* Fil d'Ariane / Breadcrumb */}
      <div>
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          {getBreadcrumbs().map((crumb, index) => (
            <span key={crumb.to} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="w-4 h-4" />}
              {index === getBreadcrumbs().length - 1 ? (
                <span className="text-gray-900 font-medium">{crumb.label}</span>
              ) : (
                <Link
                  to={crumb.to}
                  className="hover:text-gray-900 transition-colors flex items-center gap-1"
                >
                  {crumb.icon && <crumb.icon className="w-4 h-4" />}
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
        <h1 className="text-xl font-semibold text-gray-900">
          {getPageTitle()}
        </h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une fiche..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-renault-yellow focus:border-renault-yellow"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          {/* Badge notification */}
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profil utilisateur */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="w-8 h-8 bg-renault-yellow rounded-full flex items-center justify-center">
            <span className="text-black font-medium text-sm">
              {user?.prenom?.[0]}{user?.nom?.[0]}
            </span>
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-gray-900">
              {user?.prenom} {user?.nom}
            </p>
            <p className="text-xs text-gray-500">
              {user?.role === 'admin' ? 'Administrateur' : user?.role === 'readonly' ? 'Lecture seule' : 'Utilisateur'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
