# Architecture Technique - TST Manager

## Vue d'ensemble

TST Manager suit une architecture **client-serveur** classique avec séparation claire des responsabilités.

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Browser)                          │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    React Application (SPA)                     │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │ │
│  │  │  Pages   │  │Components│  │ Services │  │   Context    │   │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ HTTP/REST (JSON)
                                   │ JWT Authentication
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        SERVEUR (Node.js/Express)                    │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                         Middlewares                            │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │ │
│  │  │  CORS    │  │  Auth    │  │Validation│  │ArchiveGuard  │   │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │ │
│  ├────────────────────────────────────────────────────────────────┤ │
│  │                         Routes / Controllers                   │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │ │
│  │  │   Auth   │  │   TST    │  │Intervener│  │     PDF      │   │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │ │
│  ├────────────────────────────────────────────────────────────────┤ │
│  │                           Models                               │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │ │
│  │  │   User   │  │ TSTForm  │  │Intervener│  │  AuditLog    │   │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ SQL
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         BASE DE DONNÉES (SQLite)                    │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────────┐   │
│  │  users   │  │tst_forms │  │interveners│  │   audit_logs     │   │
│  └──────────┘  └──────────┘  └───────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## Frontend (React)

### Structure des composants

```
src/
├── App.jsx                 # Routeur principal et layout
├── main.jsx                # Point d'entrée React
│
├── context/
│   └── AuthContext.jsx     # Gestion de l'authentification globale
│
├── pages/                  # Pages (routes)
│   ├── Login.jsx           # Page de connexion
│   ├── Dashboard.jsx       # Tableau de bord
│   ├── NewTSTForm.jsx      # Création/édition de fiche
│   ├── TSTDetail.jsx       # Détail d'une fiche
│   ├── Archive.jsx         # Liste des fiches avec filtres
│   └── Interveners.jsx     # Gestion des intervenants
│
├── components/
│   ├── layout/             # Composants de mise en page
│   │   ├── Sidebar.jsx     # Navigation latérale
│   │   └── Header.jsx      # Barre supérieure
│   │
│   └── common/             # Composants réutilisables
│       ├── DataTable.jsx   # Table avec tri/pagination
│       ├── StatusBadge.jsx # Badge de statut
│       └── SearchFilter.jsx# Barre de filtres
│
├── services/
│   └── api.js              # Client Axios + endpoints API
│
└── utils/
    ├── constants.js        # Constantes (statuts, types...)
    ├── validators.js       # Fonctions de validation
    └── formatters.js       # Formatage dates, noms...
```

### Flux de données

1. **Authentification** : `AuthContext` stocke l'utilisateur et le token JWT
2. **Appels API** : `services/api.js` ajoute automatiquement le token aux requêtes
3. **État local** : Chaque page gère son propre état avec `useState`
4. **Notifications** : `react-toastify` pour les messages utilisateur

## Backend (Node.js/Express)

### Pipeline de requête

```
Request HTTP
     │
     ▼
┌─────────────┐
│   helmet    │  → Sécurité HTTP (headers)
└─────────────┘
     │
     ▼
┌─────────────┐
│    cors     │  → Politique cross-origin
└─────────────┘
     │
     ▼
┌─────────────┐
│   morgan    │  → Logging des requêtes
└─────────────┘
     │
     ▼
┌─────────────────────┐
│  authenticateToken  │  → Vérification JWT
└─────────────────────┘
     │
     ▼
┌─────────────────────┐
│    requireRole      │  → Vérification des permissions
└─────────────────────┘
     │
     ▼
┌─────────────────────┐
│  archiveGuard       │  → Protection lecture seule
└─────────────────────┘
     │
     ▼
┌─────────────────────┐
│    validation       │  → Validation des données
└─────────────────────┘
     │
     ▼
┌─────────────────────┐
│    Controller       │  → Logique métier
└─────────────────────┘
     │
     ▼
┌─────────────────────┐
│      Model          │  → Accès base de données
└─────────────────────┘
     │
     ▼
Response JSON
```

### Modèles de données

#### User (Utilisateur)
```javascript
{
  id: UUID,
  matricule: string (unique),
  email: string (unique),
  password_hash: string,
  nom: string,
  prenom: string,
  role: 'admin' | 'user' | 'readonly',
  created_at: datetime,
  last_login: datetime
}
```

#### Intervener (Intervenant)
```javascript
{
  id: UUID,
  matricule: string (unique),
  nom: string,
  prenom: string,
  entreprise: string,
  fonction: string,
  type_habilitation: 'B0'|'B1TL'|'B2TL'|...,
  date_validite_hab: date,
  actif: boolean
}
```

#### TSTForm (Fiche TST)
```javascript
{
  id: UUID,
  reference_tst: string (TST-YYYY-NNNNNN),
  statut: 'brouillon'|'en_cours'|'valide'|'archive',

  // Section Ordre
  date_ordre: date,
  type_batterie: string,
  identification_bin: string,
  lieu_intervention: string,
  nature_travaux: text,
  autorisation_debut: datetime,
  autorisation_fin: datetime,

  // Intervenants (FK)
  responsable_exploitation_id: UUID,
  charge_travaux_ordre_id: UUID,
  executant_id: UUID,
  ...

  // Métadonnées
  created_at: datetime,
  validated_at: datetime,
  archived_at: datetime
}
```

#### AuditLog (Journal d'audit)
```javascript
{
  id: UUID,
  tst_form_id: UUID (FK),
  user_id: UUID (FK),
  action: string,
  champs_modifies: JSON,
  ip_address: string,
  created_at: datetime
}
```

## Sécurité

### Authentification JWT

1. L'utilisateur se connecte avec matricule/mot de passe
2. Le serveur génère un token JWT signé
3. Le client stocke le token dans `localStorage`
4. Chaque requête API inclut le token dans le header `Authorization: Bearer <token>`
5. Le middleware `authenticateToken` vérifie le token

### Protection des fiches archivées

Le middleware `archiveGuard` garantit l'intégrité juridique :
- Une fiche avec statut `archive` ne peut plus être modifiée
- Les tentatives de modification retournent une erreur 403
- Cette protection est appliquée au niveau du serveur

### Traçabilité

Chaque action est loguée dans `audit_logs` :
- Création, modification, validation, archivage
- Export PDF, consultation
- Utilisateur, IP, timestamp

## Génération PDF

Le service `pdfGenerator.js` utilise PDFKit :

1. Création d'un document A4
2. En-tête avec logo Renault et référence
3. Sections : Ordre, Début de travaux, Fin de travaux
4. Zones de signature
5. Pied de page avec horodatage
6. Watermark "ARCHIVÉ" si applicable

## Performance

- **SQLite WAL mode** : Écriture concurrente optimisée
- **Index** : Sur tous les champs de recherche
- **Pagination** : Côté serveur pour les listes
- **Vite** : Build frontend optimisé

## Évolutivité

Pour migrer vers une infrastructure plus robuste :

1. **PostgreSQL** : Remplacer better-sqlite3 par pg
2. **Redis** : Cache des sessions et des données fréquentes
3. **S3** : Stockage des PDF générés
4. **Docker** : Conteneurisation pour le déploiement
