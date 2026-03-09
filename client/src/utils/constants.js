/**
 * Constantes de l'application
 * Application Constants
 *
 * @module utils/constants
 * @author Renault Group - Service 00596
 */

// Statuts des fiches TST / TST form statuses
export const TST_STATUS = {
  BROUILLON: 'brouillon',
  EN_COURS: 'en_cours',
  VALIDE: 'valide',
  ARCHIVE: 'archive'
};

// Labels des statuts / Status labels
export const TST_STATUS_LABELS = {
  [TST_STATUS.BROUILLON]: 'Brouillon',
  [TST_STATUS.EN_COURS]: 'En cours',
  [TST_STATUS.VALIDE]: 'Validé',
  [TST_STATUS.ARCHIVE]: 'Archivé'
};

// Couleurs des statuts / Status colors
export const TST_STATUS_COLORS = {
  [TST_STATUS.BROUILLON]: 'gray',
  [TST_STATUS.EN_COURS]: 'yellow',
  [TST_STATUS.VALIDE]: 'green',
  [TST_STATUS.ARCHIVE]: 'blue'
};

// Types d'habilitation / Habilitation types
export const HABILITATION_TYPES = {
  B0: 'B0',
  B1: 'B1',
  B1V: 'B1V',
  B1TL: 'B1TL',
  B2: 'B2',
  B2V: 'B2V',
  B2TL: 'B2TL',
  BR: 'BR',
  BC: 'BC',
  BE: 'BE',
  H0: 'H0',
  H1: 'H1',
  H2: 'H2'
};

// Labels des habilitations / Habilitation labels
export const HABILITATION_LABELS = {
  [HABILITATION_TYPES.B0]: 'B0 - Exécutant non électricien',
  [HABILITATION_TYPES.B1]: 'B1 - Exécutant électricien',
  [HABILITATION_TYPES.B1V]: 'B1V - Exécutant électricien Voisinage',
  [HABILITATION_TYPES.B1TL]: 'B1TL - Exécutant TST Lithium-ion',
  [HABILITATION_TYPES.B2]: 'B2 - Chargé de travaux',
  [HABILITATION_TYPES.B2V]: 'B2V - Chargé de travaux Voisinage',
  [HABILITATION_TYPES.B2TL]: 'B2TL - Chargé de travaux TST Lithium-ion',
  [HABILITATION_TYPES.BR]: 'BR - Chargé d\'intervention générale',
  [HABILITATION_TYPES.BC]: 'BC - Chargé de consignation',
  [HABILITATION_TYPES.BE]: 'BE - Chargé d\'opérations spécifiques',
  [HABILITATION_TYPES.H0]: 'H0 - Exécutant non électricien HT',
  [HABILITATION_TYPES.H1]: 'H1 - Exécutant électricien HT',
  [HABILITATION_TYPES.H2]: 'H2 - Chargé de travaux HT'
};

// Rôles utilisateurs / User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  READONLY: 'readonly'
};

// Labels des rôles / Role labels
export const USER_ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Administrateur',
  [USER_ROLES.USER]: 'Utilisateur',
  [USER_ROLES.READONLY]: 'Lecture seule'
};

// Actions d'audit / Audit actions
export const AUDIT_ACTIONS = {
  CREATION: 'creation',
  MODIFICATION: 'modification',
  VALIDATION: 'validation',
  ARCHIVE: 'archive',
  EXPORT_PDF: 'export_pdf',
  CONSULTATION: 'consultation',
  SIGNATURE: 'signature',
  START_WORK: 'start_work',
  END_WORK: 'end_work'
};

// Labels des actions d'audit / Audit action labels
export const AUDIT_ACTION_LABELS = {
  [AUDIT_ACTIONS.CREATION]: 'Création',
  [AUDIT_ACTIONS.MODIFICATION]: 'Modification',
  [AUDIT_ACTIONS.VALIDATION]: 'Validation',
  [AUDIT_ACTIONS.ARCHIVE]: 'Archivage',
  [AUDIT_ACTIONS.EXPORT_PDF]: 'Export PDF',
  [AUDIT_ACTIONS.CONSULTATION]: 'Consultation',
  [AUDIT_ACTIONS.SIGNATURE]: 'Signature',
  [AUDIT_ACTIONS.START_WORK]: 'Début des travaux',
  [AUDIT_ACTIONS.END_WORK]: 'Fin des travaux'
};

// Entreprises par défaut (issues du fichier Excel) / Default companies
export const DEFAULT_COMPANIES = [
  'RENAULT SAS',
  'AMPERE',
  'HORSE',
  'DACIA',
  'SEGULA'
];

// Types de batterie courants / Common battery types
export const BATTERY_TYPES = [
  'XR110',
  'XR111',
  'T3E',
  'BTB FE',
  'Batterie Li-ion 400V',
  'Batterie Li-ion 800V',
  'Batterie NiMH',
  'Pack batterie HV',
  'Module batterie',
  'Autre'
];

// Pagination par défaut / Default pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
};
