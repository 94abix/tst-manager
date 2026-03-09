# TST Manager - Renault Group

**Application de gestion des fiches Travail Sous Tension**

## Description

TST Manager est une application web interne permettant de digitaliser la gestion des fiches de Travail Sous Tension (TST) pour les interventions sur batteries de traction de véhicules électriques et hybrides.

Cette application remplace le processus manuel sur papier, offrant :
- Création et validation des fiches TST
- Gestion des intervenants habilités
- Génération automatique de PDF
- Traçabilité complète des actions
- Archivage sécurisé et conforme

## Stack Technique

| Composant | Technologie |
|-----------|-------------|
| **Frontend** | React 18 + Vite + Tailwind CSS |
| **Backend** | Node.js + Express.js |
| **Base de données** | SQLite (better-sqlite3) |
| **Authentification** | JWT (JSON Web Tokens) |
| **PDF** | PDFKit |

## Installation

### Prérequis

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation rapide

```bash
# Cloner le projet (ou extraire l'archive)
cd tst-manager

# Installer toutes les dépendances
npm run install:all

# Copier et configurer l'environnement
cp server/.env.example server/.env

# Initialiser la base de données avec les données de test
cd server && npm run db:seed && cd ..

# Démarrer en mode développement
npm run dev
```

L'application sera accessible sur :
- **Frontend** : http://localhost:5173
- **API Backend** : http://localhost:3001

### Comptes de démonstration

| Rôle | Matricule | Mot de passe | Permissions |
|------|-----------|--------------|-------------|
| Admin | ADMIN001 | Admin@123! | Toutes |
| Utilisateur | USER001 | User@123! | Créer/Modifier fiches |
| Lecture seule | VIEW001 | View@123! | Consultation uniquement |

## Structure du Projet

```
tst-manager/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Composants réutilisables
│   │   ├── pages/          # Pages de l'application
│   │   ├── services/       # Services API
│   │   ├── context/        # Contextes React (Auth)
│   │   └── utils/          # Utilitaires
│   └── package.json
│
├── server/                 # Backend Node.js
│   ├── src/
│   │   ├── controllers/    # Contrôleurs API
│   │   ├── models/         # Modèles de données
│   │   ├── routes/         # Routes Express
│   │   ├── middleware/     # Middlewares
│   │   └── services/       # Services métier
│   ├── database/           # Migrations et seeds
│   └── package.json
│
├── docs/                   # Documentation
│   ├── README.md           # Ce fichier
│   ├── ARCH_EXPLAINED.md   # Architecture technique
│   ├── V_MODEL.md          # Cycle en V
│   └── USER_GUIDE.md       # Guide utilisateur
│
└── package.json            # Scripts racine
```

## Fonctionnalités

### Gestion des Fiches TST

- **Création** : Formulaire complet avec validation des champs
- **Cycle de vie** : Brouillon → En cours → Validé → Archivé
- **Signatures** : Zone de signature pour chaque intervenant
- **Export PDF** : Génération automatique du document officiel

### Annuaire des Intervenants

- Profils avec habilitations (B1TL, B2TL, etc.)
- Vérification automatique de la validité des habilitations
- Pré-remplissage des formulaires

### Sécurité & Conformité

- Authentification JWT obligatoire
- Fiches archivées en lecture seule (valeur juridique)
- Journal d'audit complet de toutes les actions
- Rôles utilisateurs (admin, user, readonly)

## API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur

### Fiches TST
- `GET /api/tst` - Liste des fiches (avec filtres)
- `POST /api/tst` - Créer une fiche
- `GET /api/tst/:id` - Détail d'une fiche
- `PUT /api/tst/:id` - Modifier une fiche
- `POST /api/tst/:id/start` - Démarrer les travaux
- `POST /api/tst/:id/end` - Terminer les travaux
- `POST /api/tst/:id/archive` - Archiver
- `GET /api/tst/:id/pdf` - Télécharger PDF

### Intervenants
- `GET /api/interveners` - Liste des intervenants
- `POST /api/interveners` - Créer un intervenant
- `PUT /api/interveners/:id` - Modifier
- `DELETE /api/interveners/:id` - Désactiver

## Scripts Disponibles

```bash
# Développement
npm run dev              # Lance frontend + backend

# Production
npm run client:build     # Build du frontend
npm run server:start     # Lance le serveur

# Base de données
npm run db:migrate       # Exécute les migrations
npm run db:seed          # Charge les données de test
```

## Configuration

### Variables d'environnement (server/.env)

```env
PORT=3001
NODE_ENV=development
JWT_SECRET=votre_cle_secrete
JWT_EXPIRES_IN=8
DATABASE_PATH=./database/tst_manager.db
FRONTEND_URL=http://localhost:5173
```

## Support

- **Service** : Renault Group - After Sales Engineering - Service 00596
- **Version** : 1.0.0
- **Date** : 2025

## Licence

Propriétaire - Renault Group
