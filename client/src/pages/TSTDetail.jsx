/**
 * Page Détail d'une fiche TST
 * TST Form Detail Page
 *
 * @author Renault Group - Service 00596
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ArrowLeft,
  Download,
  Edit,
  Play,
  Square,
  Archive,
  Clock,
  User,
  MapPin,
  Battery,
  FileText,
  History,
  AlertTriangle,
  CheckCircle,
  Lock
} from 'lucide-react';
import { tstAPI, intervenersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/common/StatusBadge';
import { formatDate, formatDateTime, formatFullName } from '../utils/formatters';
import { TST_STATUS, AUDIT_ACTION_LABELS } from '../utils/constants';

function TSTDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canWrite } = useAuth();

  const [form, setForm] = useState(null);
  const [auditHistory, setAuditHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [interveners, setInterveners] = useState([]);
  const [b1tlInterveners, setB1tlInterveners] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Données pour les modales
  const [startData, setStartData] = useState({
    charge_travaux_debut_id: '',
    executant_id: '',
    surveillant_securite_id: ''
  });
  const [endData, setEndData] = useState({
    etat_batterie_fin: '',
    charge_travaux_fin_id: '',
    responsable_fin_id: ''
  });

  // Charger les données
  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [formRes, auditRes, intervenersRes, b1tlRes] = await Promise.all([
        tstAPI.getById(id),
        tstAPI.getAuditHistory(id),
        intervenersAPI.getAll({ actif: true }),
        intervenersAPI.getByHabilitation('B1TL')
      ]);

      setForm(formRes.data.data.form);
      setAuditHistory(auditRes.data.data.history || []);
      setInterveners(intervenersRes.data.data.interveners);
      setB1tlInterveners(b1tlRes.data.data.interveners);
    } catch (error) {
      console.error('Erreur chargement:', error);
      toast.error('Erreur lors du chargement de la fiche');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  // Télécharger PDF
  const handleDownloadPDF = async () => {
    try {
      const response = await tstAPI.downloadPDF(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${form.reference_tst}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('PDF téléchargé');
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    }
  };

  // Démarrer les travaux
  const handleStartWork = async () => {
    if (!startData.charge_travaux_debut_id || !startData.executant_id) {
      toast.error('Veuillez sélectionner le chargé de travaux et l\'exécutant');
      return;
    }

    try {
      setActionLoading(true);
      await tstAPI.startWork(id, startData);
      toast.success('Travaux démarrés');
      setShowStartModal(false);
      loadData();
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  // Terminer les travaux
  const handleEndWork = async () => {
    if (!endData.etat_batterie_fin || !endData.charge_travaux_fin_id || !endData.responsable_fin_id) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setActionLoading(true);
      await tstAPI.endWork(id, endData);
      toast.success('Travaux terminés et fiche validée');
      setShowEndModal(false);
      loadData();
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  // Archiver
  const handleArchive = async () => {
    if (!confirm('Archiver cette fiche ? Elle sera en lecture seule définitive.')) {
      return;
    }

    try {
      setActionLoading(true);
      await tstAPI.archive(id);
      toast.success('Fiche archivée');
      loadData();
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner w-10 h-10"></div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Fiche non trouvée</h2>
      </div>
    );
  }

  const isReadOnly = form.statut === TST_STATUS.ARCHIVE;
  const canEdit = canWrite() && !isReadOnly && form.statut === TST_STATUS.BROUILLON;
  const canStart = canWrite() && form.statut === TST_STATUS.BROUILLON;
  const canEnd = canWrite() && form.statut === TST_STATUS.EN_COURS;
  const canArchive = canWrite() && form.statut === TST_STATUS.VALIDE;

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn">
      {/* En-tête */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold font-mono">{form.reference_tst}</h1>
              <StatusBadge status={form.statut} />
              {isReadOnly && (
                <span className="flex items-center gap-1 text-sm text-blue-600">
                  <Lock className="w-4 h-4" /> Lecture seule
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">Créée le {formatDateTime(form.created_at)}</p>
          </div>
        </div>

        {/* Actions - ligne séparée */}
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handleDownloadPDF} className="btn-outline">
            <Download className="w-4 h-4 mr-2" /> PDF
          </button>
          {canEdit && (
            <Link to={`/fiche/${id}/edit`} className="btn-secondary">
              <Edit className="w-4 h-4 mr-2" /> Modifier
            </Link>
          )}
          {canStart && (
            <button onClick={() => setShowStartModal(true)} className="btn-primary">
              <Play className="w-4 h-4 mr-2" /> Démarrer
            </button>
          )}
          {canEnd && (
            <button onClick={() => setShowEndModal(true)} className="btn-success">
              <Square className="w-4 h-4 mr-2" /> Terminer
            </button>
          )}
          {canArchive && (
            <button onClick={handleArchive} className="btn-outline text-blue-600 border-blue-200">
              <Archive className="w-4 h-4 mr-2" /> Archiver
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Infos batterie */}
          <div className="card">
            <div className="card-header flex items-center gap-3">
              <Battery className="w-5 h-5 text-renault-yellow" />
              <h2 className="font-semibold">Batterie</h2>
            </div>
            <div className="card-body grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium">{form.type_batterie || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Identification BIN</p>
                <p className="font-mono font-medium">{form.identification_bin || '-'}</p>
              </div>
            </div>
          </div>

          {/* Lieu et travaux */}
          <div className="card">
            <div className="card-header flex items-center gap-3">
              <MapPin className="w-5 h-5 text-renault-yellow" />
              <h2 className="font-semibold">Intervention</h2>
            </div>
            <div className="card-body space-y-4">
              <div>
                <p className="text-sm text-gray-500">Lieu</p>
                <p className="font-medium">{form.lieu_intervention || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nature des travaux</p>
                <p className="whitespace-pre-wrap">{form.nature_travaux || '-'}</p>
              </div>
              {form.indications_complementaires && (
                <div>
                  <p className="text-sm text-gray-500">Indications complémentaires</p>
                  <p>{form.indications_complementaires}</p>
                </div>
              )}
              {form.impossibilite_technique && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800">Impossibilité technique</p>
                  <p className="text-yellow-700">{form.impossibilite_technique}</p>
                </div>
              )}
            </div>
          </div>

          {/* Intervenants */}
          <div className="card">
            <div className="card-header flex items-center gap-3">
              <User className="w-5 h-5 text-renault-yellow" />
              <h2 className="font-semibold">Intervenants</h2>
            </div>
            <div className="card-body space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Responsable d'exploitation</p>
                  <p className="font-medium">{form.responsable_exploitation_nom || '-'}</p>
                  <p className="text-sm text-gray-500">{form.responsable_exploitation_entreprise}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Chargé de travaux (ordre)</p>
                  <p className="font-medium">{form.charge_travaux_ordre_nom || '-'}</p>
                  <p className="text-sm text-gray-500">{form.charge_travaux_ordre_entreprise}</p>
                </div>
              </div>
              {(form.executant_nom || form.surveillant_nom) && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-500">Exécutant (B1TL)</p>
                    <p className="font-medium">{form.executant_nom || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Surveillant sécurité</p>
                    <p className="font-medium">{form.surveillant_nom || '-'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* État final (si terminé) */}
          {form.etat_batterie_fin && (
            <div className="card">
              <div className="card-header flex items-center gap-3 bg-green-50">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h2 className="font-semibold text-green-800">Fin des travaux</h2>
              </div>
              <div className="card-body">
                <div>
                  <p className="text-sm text-gray-500">État de la batterie</p>
                  <p className="font-medium">{form.etat_batterie_fin}</p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Date de fin</p>
                    <p>{formatDateTime(form.date_fin_travail)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Validé le</p>
                    <p>{formatDateTime(form.validated_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Période */}
          <div className="card">
            <div className="card-header flex items-center gap-3">
              <Clock className="w-5 h-5 text-renault-yellow" />
              <h2 className="font-semibold">Période</h2>
            </div>
            <div className="card-body space-y-3">
              <div>
                <p className="text-sm text-gray-500">Début autorisation</p>
                <p className="font-medium">{formatDateTime(form.autorisation_debut)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fin autorisation</p>
                <p className="font-medium">{formatDateTime(form.autorisation_fin)}</p>
              </div>
              {form.date_debut_travail && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-500">Début effectif</p>
                  <p className="font-medium">{formatDateTime(form.date_debut_travail)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Historique */}
          <div className="card">
            <div className="card-header flex items-center gap-3">
              <History className="w-5 h-5 text-renault-yellow" />
              <h2 className="font-semibold">Historique</h2>
            </div>
            <div className="card-body">
              {auditHistory.length === 0 ? (
                <p className="text-gray-500 text-sm">Aucun historique</p>
              ) : (
                <ul className="space-y-3">
                  {auditHistory.slice(0, 10).map((entry) => (
                    <li key={entry.id} className="text-sm border-l-2 border-gray-200 pl-3">
                      <p className="font-medium">{AUDIT_ACTION_LABELS[entry.action] || entry.action}</p>
                      <p className="text-gray-500">
                        {entry.user_nom} - {formatDateTime(entry.created_at)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Démarrer */}
      {showStartModal && (
        <div className="modal-overlay" onClick={() => setShowStartModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-semibold">Démarrer les travaux</h3>
            </div>
            <div className="modal-body space-y-4">
              <div>
                <label className="form-label">Chargé de travaux (B2TL) *</label>
                <select
                  value={startData.charge_travaux_debut_id}
                  onChange={(e) => setStartData({ ...startData, charge_travaux_debut_id: e.target.value })}
                  className="form-input"
                >
                  <option value="">Sélectionner...</option>
                  {interveners.filter(i => i.type_habilitation === 'B2TL').map((int) => (
                    <option key={int.id} value={int.id}>
                      {int.nom} {int.prenom} - {int.entreprise}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Exécutant (B1TL) *</label>
                <select
                  value={startData.executant_id}
                  onChange={(e) => setStartData({ ...startData, executant_id: e.target.value })}
                  className="form-input"
                >
                  <option value="">Sélectionner...</option>
                  {b1tlInterveners.map((int) => (
                    <option key={int.id} value={int.id}>
                      {int.nom} {int.prenom} - {int.entreprise}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Surveillant sécurité (optionnel)</label>
                <select
                  value={startData.surveillant_securite_id}
                  onChange={(e) => setStartData({ ...startData, surveillant_securite_id: e.target.value })}
                  className="form-input"
                >
                  <option value="">Aucun</option>
                  {interveners.map((int) => (
                    <option key={int.id} value={int.id}>
                      {int.nom} {int.prenom}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowStartModal(false)} className="btn-secondary">Annuler</button>
              <button onClick={handleStartWork} className="btn-primary" disabled={actionLoading}>
                {actionLoading ? 'Démarrage...' : 'Démarrer les travaux'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Terminer */}
      {showEndModal && (
        <div className="modal-overlay" onClick={() => setShowEndModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-semibold">Terminer les travaux</h3>
            </div>
            <div className="modal-body space-y-4">
              <div>
                <label className="form-label">État de la batterie *</label>
                <textarea
                  value={endData.etat_batterie_fin}
                  onChange={(e) => setEndData({ ...endData, etat_batterie_fin: e.target.value })}
                  className="form-input"
                  placeholder="Décrivez l'état final de la batterie..."
                />
              </div>
              <div>
                <label className="form-label">Chargé de travaux *</label>
                <select
                  value={endData.charge_travaux_fin_id}
                  onChange={(e) => setEndData({ ...endData, charge_travaux_fin_id: e.target.value })}
                  className="form-input"
                >
                  <option value="">Sélectionner...</option>
                  {interveners.filter(i => i.type_habilitation === 'B2TL').map((int) => (
                    <option key={int.id} value={int.id}>
                      {int.nom} {int.prenom}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Responsable d'exploitation *</label>
                <select
                  value={endData.responsable_fin_id}
                  onChange={(e) => setEndData({ ...endData, responsable_fin_id: e.target.value })}
                  className="form-input"
                >
                  <option value="">Sélectionner...</option>
                  {interveners.map((int) => (
                    <option key={int.id} value={int.id}>
                      {int.nom} {int.prenom} - {int.entreprise}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowEndModal(false)} className="btn-secondary">Annuler</button>
              <button onClick={handleEndWork} className="btn-success" disabled={actionLoading}>
                {actionLoading ? 'Validation...' : 'Terminer et valider'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TSTDetail;
