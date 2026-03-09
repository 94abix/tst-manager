/**
 * Composant Sidebar
 * Sidebar Component - Navigation principale
 *
 * @author Renault Group - Service 00596
 */

import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FilePlus,
  Archive,
  Users,
  LogOut,
  Settings,
  FileText
} from 'lucide-react';

/**
 * Sidebar de navigation
 */
function Sidebar() {
  const { user, logout, canWrite, isAdmin } = useAuth();

  // Éléments de navigation / Navigation items
  const navItems = [
    {
      to: '/',
      icon: LayoutDashboard,
      label: 'Tableau de bord',
      show: true
    },
    {
      to: '/nouvelle-fiche',
      icon: FilePlus,
      label: 'Nouvelle fiche',
      show: canWrite()
    },
    {
      to: '/archives',
      icon: Archive,
      label: 'Archives',
      show: true
    },
    {
      to: '/intervenants',
      icon: Users,
      label: 'Intervenants',
      show: true
    }
  ];

  return (
    <aside className="sidebar flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-renault-yellow rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-sm">TST</span>
          </div>
          <div>
            <h1 className="font-bold text-white">TST Manager</h1>
            <p className="text-xs text-gray-400">Renault Group</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {navItems.filter(item => item.show).map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `sidebar-item ${isActive ? 'active' : ''}`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer - Profil utilisateur */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">
              {user?.prenom?.[0]}{user?.nom?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.prenom} {user?.nom}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {user?.matricule}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
