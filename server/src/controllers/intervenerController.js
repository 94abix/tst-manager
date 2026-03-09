/**
 * Contrôleur des Intervenants
 * Intervener Controller - Gestion de l'annuaire des intervenants habilités
 *
 * @module controllers/intervenerController
 * @author Renault Group - Service 00596
 */

const { Intervener, HABILITATION_TYPES } = require('../models/Intervener');

/**
 * Crée un nouvel intervenant
 * Create new intervener
 *
 * POST /api/interveners
 */
async function create(req, res) {
  try {
    const data = req.body;

    // Vérifier que le matricule n'existe pas / Check matricule doesn't exist
    if (Intervener.findByMatricule(data.matricule)) {
      return res.status(400).json({
        success: false,
        error: 'MATRICULE_EXISTS',
        message: 'Un intervenant avec ce matricule existe déjà'
      });
    }

    const intervener = Intervener.create(data, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Intervenant créé avec succès',
      data: { intervener }
    });

  } catch (error) {
    console.error('[Intervener] Erreur create:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Erreur lors de la création de l\'intervenant'
    });
  }
}

/**
 * Liste tous les intervenants
 * List all interveners
 *
 * GET /api/interveners
 */
async function findAll(req, res) {
  try {
    const { actif, entreprise, type_habilitation, search } = req.query;

    const filters = {};
    if (actif !== undefined) filters.actif = actif === 'true';
    if (entreprise) filters.entreprise = entreprise;
    if (type_habilitation) filters.type_habilitation = type_habilitation;
    if (search) filters.search = search;

    const interveners = Intervener.findAll(filters);

    res.json({
      success: true,
      data: {
        interveners,
        total: interveners.length
      }
    });

  } catch (error) {
    console.error('[Intervener] Erreur findAll:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Erreur lors de la récupération des intervenants'
    });
  }
}

/**
 * Récupère un intervenant par ID
 * Get intervener by ID
 *
 * GET /api/interveners/:id
 */
async function findById(req, res) {
  try {
    const { id } = req.params;
    const intervener = Intervener.findById(id);

    if (!intervener) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Intervenant non trouvé'
      });
    }

    // Ajouter l'info de validité de l'habilitation / Add habilitation validity info
    intervener.habilitation_valide = Intervener.isHabilitationValid(id);

    res.json({
      success: true,
      data: { intervener }
    });

  } catch (error) {
    console.error('[Intervener] Erreur findById:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Erreur lors de la récupération de l\'intervenant'
    });
  }
}

/**
 * Met à jour un intervenant
 * Update intervener
 *
 * PUT /api/interveners/:id
 */
async function update(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;

    // Vérifier que l'intervenant existe / Check intervener exists
    const existing = Intervener.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Intervenant non trouvé'
      });
    }

    // Si changement de matricule, vérifier l'unicité / If matricule change, check uniqueness
    if (data.matricule && data.matricule !== existing.matricule) {
      const duplicate = Intervener.findByMatricule(data.matricule);
      if (duplicate) {
        return res.status(400).json({
          success: false,
          error: 'MATRICULE_EXISTS',
          message: 'Ce matricule est déjà utilisé par un autre intervenant'
        });
      }
    }

    const intervener = Intervener.update(id, data);

    res.json({
      success: true,
      message: 'Intervenant mis à jour avec succès',
      data: { intervener }
    });

  } catch (error) {
    console.error('[Intervener] Erreur update:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Erreur lors de la mise à jour de l\'intervenant'
    });
  }
}

/**
 * Désactive un intervenant (soft delete)
 * Deactivate intervener (soft delete)
 *
 * DELETE /api/interveners/:id
 */
async function deactivate(req, res) {
  try {
    const { id } = req.params;

    const existing = Intervener.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Intervenant non trouvé'
      });
    }

    const success = Intervener.deactivate(id);

    if (success) {
      res.json({
        success: true,
        message: 'Intervenant désactivé avec succès'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'DEACTIVATION_FAILED',
        message: 'Échec de la désactivation'
      });
    }

  } catch (error) {
    console.error('[Intervener] Erreur deactivate:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Erreur lors de la désactivation de l\'intervenant'
    });
  }
}

/**
 * Liste les intervenants avec une habilitation valide pour un type donné
 * List interveners with valid habilitation for a given type
 *
 * GET /api/interveners/habilitation/:type
 */
async function findByHabilitation(req, res) {
  try {
    const { type } = req.params;

    // Vérifier que le type est valide / Check type is valid
    if (!Object.values(HABILITATION_TYPES).includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_HABILITATION_TYPE',
        message: 'Type d\'habilitation invalide',
        valid_types: Object.values(HABILITATION_TYPES)
      });
    }

    const interveners = Intervener.findWithValidHabilitation(type);

    res.json({
      success: true,
      data: {
        interveners,
        total: interveners.length,
        habilitation_type: type
      }
    });

  } catch (error) {
    console.error('[Intervener] Erreur findByHabilitation:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Erreur lors de la recherche par habilitation'
    });
  }
}

/**
 * Liste les entreprises distinctes
 * List distinct companies
 *
 * GET /api/interveners/companies
 */
async function getCompanies(req, res) {
  try {
    const companies = Intervener.getCompanies();

    res.json({
      success: true,
      data: { companies }
    });

  } catch (error) {
    console.error('[Intervener] Erreur getCompanies:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Erreur lors de la récupération des entreprises'
    });
  }
}

/**
 * Liste les types d'habilitation disponibles
 * List available habilitation types
 *
 * GET /api/interveners/habilitations
 */
async function getHabilitationTypes(req, res) {
  const types = Object.entries(HABILITATION_TYPES).map(([key, value]) => ({
    code: value,
    label: getHabilitationLabel(value)
  }));

  res.json({
    success: true,
    data: { types }
  });
}

/**
 * Retourne le libellé d'un type d'habilitation
 * Return habilitation type label
 *
 * @param {string} type - Code du type
 * @returns {string} Libellé
 */
function getHabilitationLabel(type) {
  const labels = {
    'B0': 'B0 - Exécutant non électricien',
    'B1': 'B1 - Exécutant électricien',
    'B1V': 'B1V - Exécutant électricien Voisinage',
    'B1TL': 'B1TL - Exécutant TST Lithium-ion',
    'B2': 'B2 - Chargé de travaux',
    'B2V': 'B2V - Chargé de travaux Voisinage',
    'B2TL': 'B2TL - Chargé de travaux TST Lithium-ion',
    'BR': 'BR - Chargé d\'intervention générale',
    'BC': 'BC - Chargé de consignation',
    'BE': 'BE - Chargé d\'opérations spécifiques',
    'H0': 'H0 - Exécutant non électricien HT',
    'H1': 'H1 - Exécutant électricien HT',
    'H2': 'H2 - Chargé de travaux HT'
  };
  return labels[type] || type;
}

module.exports = {
  create,
  findAll,
  findById,
  update,
  deactivate,
  findByHabilitation,
  getCompanies,
  getHabilitationTypes
};
