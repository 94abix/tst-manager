# Guide Rapide du Code - TST Manager

## Structure en 30 secondes

```
tst-manager/
├── client/     → Interface utilisateur (ce que l'utilisateur voit)
├── server/     → Logique metier + base de donnees (ce qui tourne en arriere-plan)
└── docs/       → Documentation
```

---

## FRONTEND (client/)

### Point d'entree
| Fichier | Role |
|---------|------|
| `src/main.jsx` | Demarre l'application React |
| `src/App.jsx` | **Routage** : definit quelle page s'affiche selon l'URL |

### Pages (`src/pages/`)
| Fichier | Ce qu'il affiche |
|---------|------------------|
| `Login.jsx` | Page de connexion (matricule + mot de passe) |
| `Dashboard.jsx` | Tableau de bord avec statistiques |
| `TSTList.jsx` | Liste des fiches TST |
| `TSTDetail.jsx` | Detail d'une fiche + boutons actions |
| `NewTSTForm.jsx` | Formulaire creation/edition fiche |
| `Interveners.jsx` | Annuaire des intervenants |
| `Archives.jsx` | Fiches archivees (lecture seule) |
| `Profile.jsx` | Profil utilisateur |

### Composants reutilisables (`src/components/`)
| Dossier | Contenu |
|---------|---------|
| `common/` | Badge, Card, Modal, StatusBadge (petits elements UI) |
| `forms/` | Champs de formulaire |
| `layout/` | Header, Sidebar, Layout general |

### Logique partagee
| Fichier | Role |
|---------|------|
| `context/AuthContext.jsx` | Gere la connexion/deconnexion + stocke l'utilisateur connecte |
| `services/api.js` | **Toutes les requetes API** : login, get fiches, create, update, etc. |
| `utils/constants.js` | Constantes (statuts, types habilitation, etc.) |
| `utils/formatters.js` | Fonctions de formatage (dates, noms) |

---

## BACKEND (server/)

### Point d'entree
| Fichier | Role |
|---------|------|
| `src/app.js` | **Demarre le serveur Express** sur le port 3001 |

### Routes (`src/routes/`)
> Definissent les URLs disponibles

| Fichier | URLs | Description |
|---------|------|-------------|
| `authRoutes.js` | `/api/auth/*` | Connexion, inscription, profil |
| `tstRoutes.js` | `/api/tst/*` | CRUD fiches TST |
| `intervenerRoutes.js` | `/api/interveners/*` | CRUD intervenants |

### Controllers (`src/controllers/`)
> Contiennent la logique metier (que faire quand on appelle une route)

| Fichier | Gere |
|---------|------|
| `authController.js` | Login, register, verification token |
| `tstController.js` | Creer/modifier/supprimer fiches, demarrer/terminer travaux, archiver |
| `intervenerController.js` | Gestion des intervenants |

### Models (`src/models/`)
> Interagissent avec la base de donnees

| Fichier | Table SQL |
|---------|-----------|
| `User.js` | `users` (comptes utilisateurs) |
| `TSTForm.js` | `tst_forms` (fiches TST) |
| `Intervener.js` | `interveners` (personnes habilitees) |
| `AuditLog.js` | `audit_logs` (historique actions) |

### Middlewares (`src/middleware/`)
> Fonctions executees AVANT chaque requete

| Fichier | Role |
|---------|------|
| `authMiddleware.js` | Verifie que l'utilisateur est connecte (token JWT valide) |
| `archiveGuard.js` | **BLOQUE** toute modification sur fiches archivees |
| `validationMiddleware.js` | Verifie que les donnees envoyees sont correctes |

### Config (`src/config/`)
| Fichier | Role |
|---------|------|
| `database.js` | Connexion SQLite + fonctions DB |
| `jwt.js` | Configuration tokens (secret, duree) |

### Services (`src/services/`)
| Fichier | Role |
|---------|------|
| `pdfGenerator.js` | Genere le PDF d'une fiche TST |

### Base de donnees (`database/`)
| Fichier | Role |
|---------|------|
| `migrate.js` | Cree les tables SQL |
| `seed.js` | Insere les donnees de test (users, intervenants) |
| `tst_manager.db` | Fichier de base de donnees SQLite |

---

## Flux d'une action (exemple : creer une fiche)

```
1. Utilisateur remplit le formulaire (NewTSTForm.jsx)
           ↓
2. Clic "Enregistrer" → appel api.js (tstAPI.create)
           ↓
3. Requete POST /api/tst envoyee au serveur
           ↓
4. authMiddleware.js verifie le token JWT
           ↓
5. tstRoutes.js redirige vers tstController.create()
           ↓
6. tstController.js valide les donnees + appelle TSTForm.create()
           ↓
7. TSTForm.js execute INSERT dans la base SQLite
           ↓
8. Reponse JSON renvoyee au frontend
           ↓
9. NewTSTForm.jsx affiche "Fiche creee" + redirige
```

---

## Les 5 fichiers les plus importants a connaitre

| # | Fichier | Pourquoi |
|---|---------|----------|
| 1 | `server/src/app.js` | Point d'entree serveur, tout demarre ici |
| 2 | `client/src/App.jsx` | Routage frontend, definit toutes les pages |
| 3 | `client/src/services/api.js` | Toutes les communications avec le serveur |
| 4 | `server/src/controllers/tstController.js` | Toute la logique des fiches TST |
| 5 | `server/src/models/TSTForm.js` | Requetes SQL pour les fiches |

---

## Concepts cles a retenir

### JWT (JSON Web Token)
- Token genere a la connexion, valide 8h
- Envoye dans chaque requete (header Authorization)
- Le serveur le verifie avant d'autoriser l'action

### Cycle de vie fiche TST
```
brouillon → en_cours → valide → archive
                                   ↓
                           LECTURE SEULE
```

### Roles utilisateurs
- **admin** : Tout faire
- **user** : Creer/modifier fiches et intervenants
- **readonly** : Consulter uniquement

### Protection des archives
Le fichier `archiveGuard.js` empeche TOUTE modification sur une fiche archivee. C'est une obligation legale.

---

## Commandes utiles

```bash
# Demarrer le serveur
cd server && npm run dev

# Demarrer le client
cd client && npm run dev

# Reinitialiser la base de donnees
cd server && rm database/tst_manager.db && npm run db:seed
```

---

## Si on te demande "Comment ca marche ?"

> "C'est une application web classique en 2 parties :
> - Le **frontend React** affiche l'interface et envoie des requetes
> - Le **backend Node.js/Express** recoit les requetes, applique la logique metier et stocke dans une base SQLite
> - La communication se fait en **API REST** avec authentification **JWT**
> - Les fiches suivent un cycle de vie strict et une fois archivees, elles sont **verrouillees** pour conformite legale"

---

*Document de reference rapide - Mars 2026*
