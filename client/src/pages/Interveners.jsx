/**
 * Page Intervenants
 * Interveners Page - Annuaire des intervenants habilités
 *
 * @author Renault Group - Service 00596
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  Plus,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  AlertTriangle,
  X
} from 'lucide-react';
import { intervenersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/common/DataTable';
import SearchFilter from '../components/common/SearchFilter';
import {
  formatDate,
  formatExpiryStatus,
  getExpiryClass,
  formatFullName
} from '../utils/formatters';
import { validateIntervener } from '../utils/validators';
import { HABILITATION_LABELS, DEFAULT_COMPANIES } from '../utils/constants';

function Interveners() {
  const { canWrite } = useAuth();

  const [interveners, setInterveners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingIntervener, setEditingIntervener] = useState(null);
  const [formData, setFormData] = useState({
    matricule: '',
    nom: '',
    prenom: '',
    entreprise: '',
    fonction: '',
    type_habilitation: '',
    date_validite_hab: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [filters, setFilters] = useState({ search: '' });
  const [saving, setSaving] = useState(false);

  // Charger les intervenants / Load interveners
  const loadInterveners = useCallback(async () => {
    try {
      setLoading(true);
      const params = filters.search ? { search: filters.search } : {};
      const response = await intervenersAPI.getAll(params);
      setInterveners(response.data.data.interveners);
    } catch (error) {
      console.error('Erreur chargement intervenants:', error);
      toast.error('Erreur lors du chargement des intervenants');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadInterveners();
  }, [loadInterveners]);

  // Ouvrir le modal pour créer / Open modal to create
  const handleCreate = () => {
    setEditingIntervener(null);
    setFormData({
      matricule: '',
      nom: '',
      prenom: '',
      entreprise: '',
      fonction: '',
      type_habilitation: '',
      date_validite_hab: ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  // Ouvrir le modal pour éditer / Open modal to edit
  const handleEdit = (intervener) => {
    setEditingIntervener(intervener);
    setFormData({
      matricule: intervener.matricule,
      nom: intervener.nom,
      prenom: intervener.prenom,
      entreprise: intervener.entreprise,
      fonction: intervener.fonction,
      type_habilitation: intervener.type_habilitation,
      date_validite_hab: intervener.date_validite_hab
    });
    setFormErrors({});
    setShowModal(true);
  };

  // Sauvegarder / Save
  const handleSave = async () => {
    const validation = validateIntervener(formData);
    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }

    try {
      setSaving(true);

      if (editingIntervener) {
        await intervenersAPI.update(editingIntervener.id, formData);
        toast.success('Intervenant mis à jour');
      } else {
        await intervenersAPI.create(formData);
        toast.success('Intervenant créé');
      }

      setShowModal(false);
      loadInterveners();
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la sauvegarde';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  // Désactiver / Deactivate
  const handleDeactivate = async (intervener) => {
    if (!confirm(`Désactiver l'intervenant ${intervener.nom} ${intervener.prenom} ?`)) {
      return;
    }

    try {
      await intervenersAPI.delete(intervener.id);
      toast.success('Intervenant désactivé');
      loadInterveners();
    } catch (error) {
      toast.error('Erreur lors de la désactivation');
    }
  };

  // Colonnes / Columns
  const columns = [
    {
      key: 'matricule',
      label: 'Matricule',
      sortable: true,
      render: (value) => (
        <span className="font-mono font-medium">{value}</span>
      )
    },
    {
      key: 'nom',
      label: 'Nom',
      sortable: true,
      render: (_, row) => formatFullName(row.nom, row.prenom)
    },
    {
      key: 'entreprise',
      label: 'Entreprise',
      sortable: true
    },
    {
      key: 'fonction',
      label: 'Fonction'
    },
    {
      key: 'type_habilitation',
      label: 'Habilitation',
      render: (value) => (
        <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-sm font-medium">
          {value}
        </span>
      )
    },
    {
      key: 'date_validite_hab',
      label: 'Validité',
      render: (value) => (
        <span className={getExpiryClass(value)}>
          {formatExpiryStatus(value)}
        </span>
      )
    },
    {
      key: 'actif',
      label: 'Statut',
      render: (value) =>
        value ? (
          <span className="flex items-center gap-1 text-green-600">
            <UserCheck className="w-4 h-4" />
            Actif
          </span>
        ) : (
          <span className="flex items-center gap-1 text-gray-400">
            <UserX className="w-4 h-4" />
            Inactif
          </span>
        )
    },
    ...(canWrite()
      ? [
          {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(row);
                  }}
                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                  title="Modifier"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {row.actif && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeactivate(row);
                    }}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Désactiver"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )
          }
        ]
      : [])
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Gérez les intervenants habilités pour les travaux sous tension
        </p>
        {canWrite() && (
          <button onClick={handleCreate} className="btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            Nouvel intervenant
          </button>
        )}
      </div>

      {/* Filtres */}
      <SearchFilter
        filters={filters}
        onFilterChange={setFilters}
        onReset={() => setFilters({ search: '' })}
        showStatusFilter={false}
        showDateFilter={false}
        placeholder="Rechercher par nom, matricule..."
      />

      {/* Table */}
      <div className="card">
        <DataTable
          columns={columns}
          data={interveners}
          loading={loading}
          emptyMessage="Aucun intervenant trouvé"
        />
      </div>

      {/* Modal création/édition */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal max-w-xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-semibold">
                {editingIntervener ? 'Modifier l\'intervenant' : 'Nouvel intervenant'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="modal-body space-y-4">
              {/* Matricule */}
              <div>
                <label className="form-label">Matricule *</label>
                <input
                  type="text"
                  value={formData.matricule}
                  onChange={(e) =>
                    setFormData({ ...formData, matricule: e.target.value.toUpperCase() })
                  }
                  className={`form-input ${formErrors.matricule ? 'error' : ''}`}
                  placeholder="Ex: INT001"
                />
                {formErrors.matricule && (
                  <p className="form-error">{formErrors.matricule}</p>
                )}
              </div>

              {/* Nom / Prénom */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Nom *</label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) =>
                      setFormData({ ...formData, nom: e.target.value })
                    }
                    className={`form-input ${formErrors.nom ? 'error' : ''}`}
                  />
                  {formErrors.nom && (
                    <p className="form-error">{formErrors.nom}</p>
                  )}
                </div>
                <div>
                  <label className="form-label">Prénom *</label>
                  <input
                    type="text"
                    value={formData.prenom}
                    onChange={(e) =>
                      setFormData({ ...formData, prenom: e.target.value })
                    }
                    className={`form-input ${formErrors.prenom ? 'error' : ''}`}
                  />
                  {formErrors.prenom && (
                    <p className="form-error">{formErrors.prenom}</p>
                  )}
                </div>
              </div>

              {/* Entreprise / Fonction */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Entreprise *</label>
                  <select
                    value={formData.entreprise}
                    onChange={(e) =>
                      setFormData({ ...formData, entreprise: e.target.value })
                    }
                    className={`form-input ${formErrors.entreprise ? 'error' : ''}`}
                  >
                    <option value="">Sélectionner...</option>
                    {DEFAULT_COMPANIES.map((company) => (
                      <option key={company} value={company}>
                        {company}
                      </option>
                    ))}
                    <option value="Autre">Autre</option>
                  </select>
                  {formErrors.entreprise && (
                    <p className="form-error">{formErrors.entreprise}</p>
                  )}
                </div>
                <div>
                  <label className="form-label">Fonction *</label>
                  <input
                    type="text"
                    value={formData.fonction}
                    onChange={(e) =>
                      setFormData({ ...formData, fonction: e.target.value })
                    }
                    className={`form-input ${formErrors.fonction ? 'error' : ''}`}
                  />
                  {formErrors.fonction && (
                    <p className="form-error">{formErrors.fonction}</p>
                  )}
                </div>
              </div>

              {/* Habilitation */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Type d'habilitation *</label>
                  <select
                    value={formData.type_habilitation}
                    onChange={(e) =>
                      setFormData({ ...formData, type_habilitation: e.target.value })
                    }
                    className={`form-input ${formErrors.type_habilitation ? 'error' : ''}`}
                  >
                    <option value="">Sélectionner...</option>
                    {Object.entries(HABILITATION_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  {formErrors.type_habilitation && (
                    <p className="form-error">{formErrors.type_habilitation}</p>
                  )}
                </div>
                <div>
                  <label className="form-label">Date de validité *</label>
                  <input
                    type="date"
                    value={formData.date_validite_hab}
                    onChange={(e) =>
                      setFormData({ ...formData, date_validite_hab: e.target.value })
                    }
                    className={`form-input ${formErrors.date_validite_hab ? 'error' : ''}`}
                  />
                  {formErrors.date_validite_hab && (
                    <p className="form-error">{formErrors.date_validite_hab}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary"
                disabled={saving}
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="btn-primary"
                disabled={saving}
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Interveners;
