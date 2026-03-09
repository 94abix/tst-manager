/**
 * Page Archives
 * Archive Page - Historique et filtrage des fiches TST
 *
 * @author Renault Group - Service 00596
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Download, Eye, FileText } from 'lucide-react';
import { tstAPI } from '../services/api';
import DataTable from '../components/common/DataTable';
import SearchFilter from '../components/common/SearchFilter';
import StatusBadge from '../components/common/StatusBadge';
import { formatDate, formatRelativeDate, truncate } from '../utils/formatters';
import { PAGINATION } from '../utils/constants';

function Archive() {
  const navigate = useNavigate();

  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: PAGINATION.DEFAULT_PAGE,
    limit: PAGINATION.DEFAULT_LIMIT,
    total: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    statut: '',
    date_debut: '',
    date_fin: ''
  });

  // Charger les fiches / Load forms
  const loadForms = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        )
      };

      const response = await tstAPI.getAll(params);
      const { forms: data, pagination: paginationData } = response.data.data;

      setForms(data);
      setPagination((prev) => ({
        ...prev,
        total: paginationData.total
      }));
    } catch (error) {
      console.error('Erreur chargement fiches:', error);
      toast.error('Erreur lors du chargement des fiches');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  // Changement de page / Page change
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Changement de filtres / Filter change
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  };

  // Réinitialiser les filtres / Reset filters
  const handleResetFilters = () => {
    setFilters({
      search: '',
      statut: '',
      date_debut: '',
      date_fin: ''
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Télécharger PDF / Download PDF
  const handleDownloadPDF = async (e, formId, reference) => {
    e.stopPropagation();
    try {
      const response = await tstAPI.downloadPDF(formId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reference}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('PDF téléchargé');
    } catch (error) {
      console.error('Erreur téléchargement PDF:', error);
      toast.error('Erreur lors du téléchargement du PDF');
    }
  };

  // Colonnes de la table / Table columns
  const columns = [
    {
      key: 'reference_tst',
      label: 'Référence',
      sortable: true,
      render: (value) => (
        <span className="font-mono font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: 'statut',
      label: 'Statut',
      sortable: true,
      render: (value) => <StatusBadge status={value} size="sm" />
    },
    {
      key: 'type_batterie',
      label: 'Type batterie',
      render: (value) => truncate(value, 30) || '-'
    },
    {
      key: 'identification_bin',
      label: 'BIN',
      render: (value) => (
        <span className="font-mono text-sm">{value || '-'}</span>
      )
    },
    {
      key: 'lieu_intervention',
      label: 'Lieu',
      render: (value) => truncate(value, 25) || '-'
    },
    {
      key: 'charge_travaux_nom',
      label: 'Chargé de travaux',
      render: (value) => value || '-'
    },
    {
      key: 'date_ordre',
      label: 'Date',
      sortable: true,
      render: (value) => formatDate(value)
    },
    {
      key: 'created_at',
      label: 'Créée',
      sortable: true,
      render: (value) => formatRelativeDate(value)
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/fiche/${row.id}`);
            }}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            title="Voir"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => handleDownloadPDF(e, row.id, row.reference_tst)}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            title="Télécharger PDF"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* En-tête */}
      <div>
        <p className="text-gray-600">
          Consultez et filtrez l'historique de toutes les fiches TST
        </p>
      </div>

      {/* Filtres */}
      <SearchFilter
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        placeholder="Rechercher par référence, BIN, type..."
      />

      {/* Table des fiches */}
      <div className="card">
        <DataTable
          columns={columns}
          data={forms}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onRowClick={(row) => navigate(`/fiche/${row.id}`)}
          emptyMessage="Aucune fiche trouvée"
        />
      </div>

      {/* Résumé */}
      {!loading && forms.length > 0 && (
        <div className="text-sm text-gray-500 text-center">
          {pagination.total} fiche(s) au total
        </div>
      )}
    </div>
  );
}

export default Archive;
