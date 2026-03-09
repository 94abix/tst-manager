# TST Manager

Application web de gestion des fiches **TST (Travail Sous Tension)** pour Renault Group - Service 00596.

Permet de digitaliser le processus de creation, signature et archivage des ordres de travail sous tension pour les reparations de batteries de traction sur vehicules electriques/hybrides.

![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![React](https://img.shields.io/badge/React-18-blue)
![License](https://img.shields.io/badge/License-Proprietary-red)

---

## Fonctionnalites

- **Gestion des fiches TST** : Creation, modification, validation et archivage
- **Cycle de vie complet** : Brouillon → En cours → Valide → Archive
- **Annuaire des intervenants** : Gestion des personnes habilitees et leurs certifications
- **Tracabilite** : Historique complet de toutes les actions (audit logs)
- **Export PDF** : Generation de documents officiels
- **Authentification securisee** : JWT avec roles (admin, user, readonly)
- **Protection des archives** : Fiches archivees en lecture seule (conformite legale)

---

## Stack Technique

| Couche | Technologies |
|--------|--------------|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router, Axios |
| **Backend** | Node.js, Express.js |
| **Base de donnees** | SQLite (sql.js) |
| **Authentification** | JWT (jsonwebtoken, bcryptjs) |
| **PDF** | PDFKit |

---

## Installation

### Prerequis

- Node.js v18 ou superieur
- npm

### 1. Cloner le depot

```bash
git clone https://github.com/VOTRE_USERNAME/tst-manager.git
cd tst-manager
```

### 2. Installer les dependances

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Configurer l'environnement

Creer le fichier `server/.env` :

```env
PORT=3001
NODE_ENV=development
JWT_SECRET=votre_secret_jwt_securise
JWT_EXPIRES_IN=8h
DATABASE_PATH=./database/tst_manager.db
FRONTEND_URL=http://localhost:5173
```

### 4. Initialiser la base de donnees

```bash
cd server
npm run db:seed
```

### 5. Demarrer l'application

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### 6. Acceder a l'application

- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3001

---

## Comptes de test

| Role | Matricule | Mot de passe |
|------|-----------|--------------|
| Admin | `ADMIN001` | `Admin@123!` |
| Utilisateur | `USER001` | `User@123!` |
| Lecture seule | `VIEW001` | `View@123!` |

---

## Structure du projet

```
tst-manager/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── components/        # Composants reutilisables
│   │   ├── context/           # Context React (Auth)
│   │   ├── pages/             # Pages de l'application
│   │   ├── services/          # Client API (Axios)
│   │   └── utils/             # Constantes, formatters
│   └── vite.config.js
│
├── server/                    # Backend Express
│   ├── src/
│   │   ├── config/            # Configuration (DB, JWT)
│   │   ├── controllers/       # Logique metier
│   │   ├── middleware/        # Auth, validation, archive guard
│   │   ├── models/            # Modeles de donnees
│   │   ├── routes/            # Routes API
│   │   └── services/          # Services (PDF)
│   └── database/              # Scripts DB + fichier SQLite
│
└── docs/                      # Documentation
```

---

## API Endpoints

### Authentification (`/api/auth`)
| Methode | Route | Description |
|---------|-------|-------------|
| POST | `/login` | Connexion |
| POST | `/register` | Inscription (admin) |
| GET | `/me` | Profil utilisateur |

### Fiches TST (`/api/tst`)
| Methode | Route | Description |
|---------|-------|-------------|
| GET | `/` | Liste des fiches |
| GET | `/:id` | Detail d'une fiche |
| POST | `/` | Creer une fiche |
| PUT | `/:id` | Modifier une fiche |
| POST | `/:id/start` | Demarrer les travaux |
| POST | `/:id/end` | Terminer les travaux |
| POST | `/:id/archive` | Archiver la fiche |
| GET | `/:id/pdf` | Telecharger le PDF |

### Intervenants (`/api/interveners`)
| Methode | Route | Description |
|---------|-------|-------------|
| GET | `/` | Liste des intervenants |
| POST | `/` | Creer un intervenant |
| PUT | `/:id` | Modifier un intervenant |
| DELETE | `/:id` | Supprimer un intervenant |

---

## Cycle de vie d'une fiche TST

```
[Brouillon] ──> [En cours] ──> [Valide] ──> [Archive]
     │              │             │              │
   Creer        Demarrer      Terminer      Lecture
   fiche        travaux       travaux       seule
```

---

## Scripts disponibles

### Backend (`server/`)
```bash
npm run dev          # Demarrer en mode developpement
npm run start        # Demarrer en production
npm run db:migrate   # Executer les migrations
npm run db:seed      # Inserer les donnees initiales
```

### Frontend (`client/`)
```bash
npm run dev          # Demarrer en mode developpement
npm run build        # Construire pour la production
npm run preview      # Previsualiser le build
```

---

## Securite

- **Authentification JWT** avec expiration 8h
- **Hashage des mots de passe** avec bcrypt
- **Protection des archives** : middleware bloquant toute modification
- **Validation des donnees** cote serveur
- **CORS** configure pour le frontend uniquement

---

## Licence

Proprietary - Renault Group - Service 00596

---

*Developpe en Mars 2026*
