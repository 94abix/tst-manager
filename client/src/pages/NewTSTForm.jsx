/**
 * Page Création/Édition de fiche TST
 * New/Edit TST Form Page
 *
 * @author Renault Group - Service 00596
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  User,
  Calendar,
  MapPin,
  Battery,
  FileText
} from 'lucide-react';
import { tstAPI, intervenersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { validateTSTForm } from '../utils/validators';
import { formatDateForInput } from '../utils/formatters';
import { BATTERY_TYPES } from '../utils/constants';

function NewTSTForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { canWrite } = useAuth();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [interveners, setInterveners] = useState([]);
  const [chargesTravaux, setChargesTravaux] = useState([]);
  const [formData, setFormData] = useState({
    type_batterie: '',
    identification_bin: '',
    lieu_intervention: '',
    nature_travaux: '',
    indications_complementaires: '',
    autorisation_debut: '',
    autorisation_fin: '',
    delai_fin_travail: '',
    impossibilite_technique: '',
    responsable_exploitation_id: '',
    charge_travaux_ordre_id: ''
  });
  const [errors, setErrors] = useState({});

  // Charger les intervenants et la fiche si édition
  useEffect(() => {
    loadInterveners();
    if (isEditing) {
      loadForm();
    }
  }, [id]);

  const loadInterveners = async () => {
    try {
      const [allResponse, b2tlResponse] = await Promise.all([
        intervenersAPI.getAll({ actif: true }),
        intervenersAPI.getByHabilitation('B2TL')
      ]);
      setInterveners(allResponse.data.data.interveners);
      setChargesTravaux(b2tlResponse.data.data.interveners);
    } catch (error) {
      console.error('Erreur chargement intervenants:', error);
    }
  };

  const loadForm = async () => {
    try {
      setLoading(true);
      const response = await tstAPI.getById(id);
      const form = response.data.data.form;

      // Vérifier si la fiche est modifiable
      if (form.statut === 'archive') {
        toast.error('Cette fiche est archivée et ne peut pas être modifiée');
        navigate(`/fiche/${id}`);
        return;
      }

      setFormData({
        type_batterie: form.type_batterie || '',
        identification_bin: form.identification_bin || '',
        lieu_intervention: form.lieu_intervention || '',
        nature_travaux: form.nature_travaux || '',
        indications_complementaires: form.indications_complementaires || '',
        autorisation_debut: formatDateForInput(form.autorisation_debut) || '',
        autorisation_fin: formatDateForInput(form.autorisation_fin) || '',
        delai_fin_travail: formatDateForInput(form.delai_fin_travail) || '',
        impossibilite_technique: form.impossibilite_technique || '',
        responsable_exploitation_id: form.responsable_exploitation_id || '',
        charge_travaux_ordre_id: form.charge_travaux_ordre_id || ''
      });
    } catch (error) {
      console.error('Erreur chargement fiche:', error);
      toast.error('Erreur lors du chargement de la fiche');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour un champ
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Effacer l'erreur du champ
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Pré-remplir avec un intervenant
  const handleSelectIntervener = (field, intervenerId) => {
    handleChange(field, intervenerId);
  };

  // Sauvegarder la fiche
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const validation = validateTSTForm(formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    try {
      setSaving(true);

      if (isEditing) {
        await tstAPI.update(id, formData);
        toast.success('Fiche mise à jour avec succès');
      } else {
        const response = await tstAPI.create(formData);
        const newId = response.data.data.form.id;
        toast.success('Fiche créée avec succès');
        navigate(`/fiche/${newId}`);
        return;
      }

      navigate(`/fiche/${id}`);
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la sauvegarde';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="loading-spinner w-10 h-10 mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!canWrite()) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Accès refusé
        </h2>
        <p className="text-gray-600">
          Vous n'avez pas les permissions pour créer ou modifier des fiches
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      {/* En-tête */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-semibold">
            {isEditing ? 'Modifier la fiche' : 'Nouvelle fiche TST'}
          </h1>
          <p className="text-sm text-gray-500">
            Remplissez les informations de l'ordre de travail sous tension
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section Batterie */}
        <div className="card">
          <div className="card-header flex items-center gap-3">
            <Battery className="w-5 h-5 text-renault-yellow" />
            <h2 className="font-semibold">Informations batterie</h2>
          </div>
          <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Type de batterie/véhicule *</label>
              <select
                value={formData.type_batterie}
                onChange={(e) => handleChange('type_batterie', e.target.value)}
                className={`form-input ${errors.type_batterie ? 'error' : ''}`}
              >
                <option value="">Sélectionner...</option>
                {BATTERY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.type_batterie && (
                <p className="form-error">{errors.type_batterie}</p>
              )}
            </div>
            <div>
              <label className="form-label">Identification BIN *</label>
              <input
                type="text"
                value={formData.identification_bin}
                onChange={(e) => handleChange('identification_bin', e.target.value)}
                className={`form-input ${errors.identification_bin ? 'error' : ''}`}
                placeholder="Ex: BIN123456789"
              />
              {errors.identification_bin && (
                <p className="form-error">{errors.identification_bin}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section Lieu et Travaux */}
        <div className="card">
          <div className="card-header flex items-center gap-3">
            <MapPin className="w-5 h-5 text-renault-yellow" />
            <h2 className="font-semibold">Lieu et nature des travaux</h2>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label className="form-label">Lieu d'intervention *</label>
              <input
                type="text"
                value={formData.lieu_intervention}
                onChange={(e) => handleChange('lieu_intervention', e.target.value)}
                className={`form-input ${errors.lieu_intervention ? 'error' : ''}`}
                placeholder="Ex: Atelier batterie - Zone A"
              />
              {errors.lieu_intervention && (
                <p className="form-error">{errors.lieu_intervention}</p>
              )}
            </div>
            <div>
              <label className="form-label">Nature des travaux *</label>
              <textarea
                value={formData.nature_travaux}
                onChange={(e) => handleChange('nature_travaux', e.target.value)}
                className={`form-input min-h-[100px] ${errors.nature_travaux ? 'error' : ''}`}
                placeholder="Décrivez les travaux à effectuer..."
              />
              {errors.nature_travaux && (
                <p className="form-error">{errors.nature_travaux}</p>
              )}
            </div>
            <div>
              <label className="form-label">Indications complémentaires</label>
              <textarea
                value={formData.indications_complementaires}
                onChange={(e) => handleChange('indications_complementaires', e.target.value)}
                className="form-input min-h-[80px]"
                placeholder="Informations additionnelles (optionnel)"
              />
            </div>
            <div>
              <label className="form-label">Impossibilité technique (justification)</label>
              <input
                type="text"
                value={formData.impossibilite_technique}
                onChange={(e) => handleChange('impossibilite_technique', e.target.value)}
                className="form-input"
                placeholder="Si applicable, justifier l'impossibilité de consignation"
              />
            </div>
          </div>
        </div>

        {/* Section Intervenants */}
        <div className="card">
          <div className="card-header flex items-center gap-3">
            <User className="w-5 h-5 text-renault-yellow" />
            <h2 className="font-semibold">Intervenants</h2>
          </div>
          <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Responsable d'exploitation *</label>
              <select
                value={formData.responsable_exploitation_id}
                onChange={(e) => handleSelectIntervener('responsable_exploitation_id', e.target.value)}
                className={`form-input ${errors.responsable_exploitation_id ? 'error' : ''}`}
              >
                <option value="">Sélectionner...</option>
                {interveners.map((int) => (
                  <option key={int.id} value={int.id}>
                    {int.nom} {int.prenom} - {int.entreprise} ({int.type_habilitation})
                  </option>
                ))}
              </select>
              {errors.responsable_exploitation_id && (
                <p className="form-error">{errors.responsable_exploitation_id}</p>
              )}
            </div>
            <div>
              <label className="form-label">Chargé de travaux (B2TL) *</label>
              <select
                value={formData.charge_travaux_ordre_id}
                onChange={(e) => handleSelectIntervener('charge_travaux_ordre_id', e.target.value)}
                className={`form-input ${errors.charge_travaux_ordre_id ? 'error' : ''}`}
              >
                <option value="">Sélectionner...</option>
                {chargesTravaux.map((int) => (
                  <option key={int.id} value={int.id}>
                    {int.nom} {int.prenom} - {int.entreprise}
                  </option>
                ))}
              </select>
              {errors.charge_travaux_ordre_id && (
                <p className="form-error">{errors.charge_travaux_ordre_id}</p>
              )}
              <p className="form-helper">Seuls les intervenants B2TL sont listés</p>
            </div>
          </div>
        </div>

        {/* Section Dates */}
        <div className="card">
          <div className="card-header flex items-center gap-3">
            <Calendar className="w-5 h-5 text-renault-yellow" />
            <h2 className="font-semibold">Période d'autorisation</h2>
          </div>
          <div className="card-body grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Début d'autorisation *</label>
              <input
                type="datetime-local"
                value={formData.autorisation_debut}
                onChange={(e) => handleChange('autorisation_debut', e.target.value)}
                className={`form-input ${errors.autorisation_debut ? 'error' : ''}`}
              />
              {errors.autorisation_debut && (
                <p className="form-error">{errors.autorisation_debut}</p>
              )}
            </div>
            <div>
              <label className="form-label">Fin d'autorisation *</label>
              <input
                type="datetime-local"
                value={formData.autorisation_fin}
                onChange={(e) => handleChange('autorisation_fin', e.target.value)}
                className={`form-input ${errors.autorisation_fin ? 'error' : ''}`}
              />
              {errors.autorisation_fin && (
                <p className="form-error">{errors.autorisation_fin}</p>
              )}
            </div>
            <div>
              <label className="form-label">Délai fin de travail</label>
              <input
                type="datetime-local"
                value={formData.delai_fin_travail}
                onChange={(e) => handleChange('delai_fin_travail', e.target.value)}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
          >
            {saving ? (
              <>
                <div className="loading-spinner w-5 h-5 mr-2"></div>
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                {isEditing ? 'Mettre à jour' : 'Créer la fiche'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewTSTForm;
