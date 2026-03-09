/**
 * Page Tableau de bord
 * Dashboard Page
 *
 * @author Renault Group - Service 00596
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FileText,
  Clock,
  CheckCircle,
  Archive,
  Plus,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { tstAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/common/StatusBadge';
import DataTable from '../components/common/DataTable';
import { formatDate, formatRelativeDate } from '../utils/formatters';
import { TST_STATUS } from '../utils/constants';

function Dashboard() {
  const navigate = useNavigate();
  const { canWrite } = useAuth();

  const [stats, setStats] = useState(null);
  const [recentForms, setRecentForms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les données / Load data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Charger les stats et les fiches récentes en parallèle
      const [statsRes, formsRes] = await Promise.all([
        tstAPI.getStatistics(),
        tstAPI.getAll({ limit: 10, orderBy: 'created_at', orderDir: 'desc' })
      ]);

      setStats(statsRes.data.data.stats);
      setRecentForms(formsRes.data.data.forms);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      toast.error('Erreur lors du chargement du tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  // Configuration des cartes de statistiques / Stats cards config
  const statsCards = [
    {
      label: 'Total fiches',
      value: stats?.total || 0,
      icon: FileText,
      color: 'bg-gray-500',
      bgColor: 'bg-gray-50'
    },
    {
      label: 'Brouillons',
      value: stats?.brouillons || 0,
      icon: Clock,
      color: 'bg-gray-400',
      bgColor: 'bg-gray-50'
    },
    {
      label: 'En cours',
      value: stats?.en_cours || 0,
      icon: AlertTriangle,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50'
    },
    {
      label: 'Validées',
      value: stats?.valides || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Archivées',
      value: stats?.archives || 0,
      icon: Archive,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50'
    }
  ];

  // Colonnes de la table / Table columns
  const columns = [
    {
      key: 'reference_tst',
      label: 'Référence',
      render: (value) => (
        <span className="font-mono font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (value) => <StatusBadge status={value} size="sm" />
    },
    {
      key: 'type_batterie',
      label: 'Type batterie',
      render: (value) => value || '-'
    },
    {
      key: 'lieu_intervention',
      label: 'Lieu',
      render: (value) => (
        <span className="truncate max-w-[200px] block">{value || '-'}</span>
      )
    },
    {
      key: 'created_at',
      label: 'Créée',
      render: (value) => formatRelativeDate(value)
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <ArrowRight className="w-4 h-4 text-gray-400" />
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="loading-spinner w-10 h-10 mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* En-tête avec bouton action */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600">
            Vue d'ensemble de vos fiches Travail Sous Tension
          </p>
        </div>
        {canWrite() && (
          <Link to="/nouvelle-fiche" className="btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle fiche
          </Link>
        )}
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statsCards.map((card) => (
          <div
            key={card.label}
            className={`${card.bgColor} rounded-xl p-5 border border-gray-200`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`${card.color} p-2 rounded-lg`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-600">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Fiches récentes */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Fiches récentes
          </h2>
          <Link
            to="/archives"
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            Voir tout
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <DataTable
          columns={columns}
          data={recentForms}
          onRowClick={(row) => navigate(`/fiche/${row.id}`)}
          emptyMessage="Aucune fiche créée"
        />
      </div>

      {/* Actions rapides */}
      {canWrite() && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/nouvelle-fiche"
            className="card p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-renault-yellow rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Créer une fiche</h3>
                <p className="text-sm text-gray-500">
                  Démarrer un nouveau travail sous tension
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/intervenants"
            className="card p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-gray-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Gérer les intervenants
                </h3>
                <p className="text-sm text-gray-500">
                  Annuaire des personnes habilitées
                </p>
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
