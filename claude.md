# TST Manager - Contexte Projet pour Claude

> **IMPORTANT**: Lis ce fichier au debut de chaque session pour avoir le contexte complet du projet.

---

## 1. Vue d'ensemble

### Description
Application web de gestion des fiches **TST (Travail Sous Tension)** pour Renault Group - Service 00596. Permet de digitaliser le processus de creation, signature et archivage des ordres de travail sous tension pour les reparations de batteries de traction sur vehicules electriques/hybrides.

### Objectifs metier
- Remplacer le processus papier actuel (lent et source d'erreurs)
- Assurer la tracabilite complete (ID unique, horodatage, historique)
- Garantir la conformite legale (archives en lecture seule)
- Gerer les habilitations des intervenants

### Stack technique
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Base de donnees**: SQLite via sql.js (pure JavaScript)
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **PDF**: PDFKit

---

## 2. Structure du projet

```
tst-manager/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── components/        # Composants reutilisables
│   │   │   ├── common/        # Badge, Card, Modal, etc.
│   │   │   ├── forms/         # Composants formulaire
│   │   │   └── layout/        # Header, Sidebar, Layout
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Gestion authentification
│   │   ├── pages/             # Pages de l'application
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── TSTList.jsx
│   │   │   ├── TSTDetail.jsx
│   │   │   ├── NewTSTForm.jsx
│   │   │   ├── Interveners.jsx
│   │   │   ├── Archives.jsx
│   │   │   └── Profile.jsx
│   │   ├── services/
│   │   │   └── api.js         # Client Axios + services API
│   │   └── App.jsx            # Routage principal
│   ├── vite.config.js         # Config Vite + proxy API
│   └── package.json
│
├── server/                    # Backend Express
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js    # Config SQLite (sql.js)
│   │   │   └── jwt.js         # Config JWT
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── intervenerController.js
│   │   │   └── tstController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js      # Verification JWT
│   │   │   ├── archiveGuard.js        # Protection archives
│   │   │   └── validationMiddleware.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Intervener.js
│   │   │   ├── TSTForm.js
│   │   │   └── AuditLog.js
│   │   ├── routes/
│   │   │   ├── index.js
│   │   │   ├── authRoutes.js
│   │   │   ├── intervenerRoutes.js
│   │   │   └── tstRoutes.js
│   │   ├── services/
│   │   │   └── pdfGenerator.js  # Generation PDF
│   │   └── app.js               # Point d'entree serveur
│   ├── database/
│   │   ├── migrate.js         # Script migrations
│   │   ├── seed.js            # Donnees initiales
│   │   └── tst_manager.db     # Fichier BDD SQLite
│   ├── .env                   # Variables environnement
│   └── package.json
│
├── docs/                      # Documentation
│   ├── README.md
│   ├── ARCH_EXPLAINED.md
│   ├── V_MODEL.md
│   └── USER_GUIDE.md
│
└── claude.md                  # CE FICHIER
```

---

## 3. Base de donnees

### Schema des tables

#### users
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  matricule TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',  -- admin, user, readonly
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_login TEXT
);
```

#### interveners (intervenants habilites)
```sql
CREATE TABLE interveners (
  id TEXT PRIMARY KEY,
  matricule TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  entreprise TEXT NOT NULL,
  fonction TEXT NOT NULL,
  type_habilitation TEXT NOT NULL,  -- B0, B1, B1V, B1TL, B2, B2V, B2TL, BR, BC, BE
  date_validite_hab TEXT NOT NULL,
  actif INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  created_by TEXT
);
```

#### tst_forms (fiches TST)
```sql
CREATE TABLE tst_forms (
  id TEXT PRIMARY KEY,
  reference_tst TEXT UNIQUE NOT NULL,  -- Format: TST-YYYYMMDD-XXXX
  statut TEXT NOT NULL DEFAULT 'brouillon',  -- brouillon, en_cours, valide, archive

  -- Section 1: Ordre de travail
  date_ordre TEXT,
  type_batterie TEXT,
  identification_bin TEXT,
  lieu_intervention TEXT,
  nature_travaux TEXT,
  indications_complementaires TEXT,
  autorisation_debut TEXT,
  autorisation_fin TEXT,
  delai_fin_travail TEXT,
  impossibilite_technique TEXT,

  -- Intervenants (references)
  responsable_exploitation_id TEXT,
  charge_travaux_ordre_id TEXT,
  charge_travaux_debut_id TEXT,
  executant_id TEXT,
  surveillant_securite_id TEXT,
  charge_travaux_fin_id TEXT,
  responsable_fin_id TEXT,

  -- Signatures (base64 ou JSON)
  signature_resp_ordre TEXT,
  signature_charge_ordre TEXT,
  signature_charge_debut TEXT,
  signature_executant TEXT,
  signature_surveillant TEXT,
  signature_charge_fin TEXT,
  signature_resp_fin TEXT,

  -- Section 2 & 3
  date_debut_travail TEXT,
  date_fin_travail TEXT,
  etat_batterie_fin TEXT,

  -- Metadata
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  validated_at TEXT,
  archived_at TEXT,
  created_by TEXT,
  validated_by TEXT
);
```

#### audit_logs
```sql
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  tst_form_id TEXT,
  user_id TEXT,
  action TEXT NOT NULL,
  champs_modifies TEXT,  -- JSON des modifications
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL
);
```

---

## 4. API Endpoints

### Authentification (`/api/auth`)
| Methode | Route | Description | Acces |
|---------|-------|-------------|-------|
| POST | `/login` | Connexion | Public |
| POST | `/register` | Inscription | Admin |
| GET | `/me` | Profil utilisateur | Auth |
| PUT | `/me` | Modifier profil | Auth |
| GET | `/users` | Liste utilisateurs | Admin |
| POST | `/refresh` | Rafraichir token | Auth |

### Intervenants (`/api/interveners`)
| Methode | Route | Description | Acces |
|---------|-------|-------------|-------|
| GET | `/` | Liste intervenants | Auth |
| GET | `/:id` | Detail intervenant | Auth |
| POST | `/` | Creer intervenant | User+ |
| PUT | `/:id` | Modifier intervenant | User+ |
| DELETE | `/:id` | Supprimer intervenant | Admin |
| GET | `/habilitation/:type` | Par type habilitation | Auth |
| GET | `/companies` | Liste entreprises | Auth |
| GET | `/habilitations` | Types habilitations | Auth |

### Fiches TST (`/api/tst`)
| Methode | Route | Description | Acces |
|---------|-------|-------------|-------|
| GET | `/` | Liste fiches | Auth |
| GET | `/stats` | Statistiques | Auth |
| GET | `/:id` | Detail fiche | Auth |
| POST | `/` | Creer fiche | User+ |
| PUT | `/:id` | Modifier fiche | User+ |
| DELETE | `/:id` | Supprimer fiche | Admin |
| POST | `/:id/start` | Demarrer travaux | User+ |
| POST | `/:id/end` | Terminer travaux | User+ |
| POST | `/:id/archive` | Archiver fiche | User+ |
| GET | `/:id/audit` | Historique audit | Auth |
| GET | `/:id/pdf` | Telecharger PDF | Auth |

---

## 5. Authentification

### Roles et permissions
| Role | Description | Permissions |
|------|-------------|-------------|
| `admin` | Administrateur | Tout (CRUD complet + gestion users) |
| `user` | Utilisateur | Creer/modifier fiches et intervenants |
| `readonly` | Lecture seule | Consultation uniquement |

### Comptes de test (seed)
| Role | Matricule | Mot de passe | Email |
|------|-----------|--------------|-------|
| Admin | `ADMIN001` | `Admin@123!` | admin@renault.com |
| User | `USER001` | `User@123!` | utilisateur@renault.com |
| Readonly | `VIEW001` | `View@123!` | consultation@renault.com |

### Configuration JWT
- Secret: `JWT_SECRET` dans `.env`
- Expiration: `8h` (IMPORTANT: utiliser le format string, ex: "8h", pas juste "8")
- Algorithme: HS256

---

## 6. Cycle de vie d'une fiche TST

```
[brouillon] --> [en_cours] --> [valide] --> [archive]
     |              |             |
   Creer         Demarrer      Terminer     Archiver
   fiche         travaux       travaux      (lecture seule)
```

### Statuts
1. **brouillon**: Fiche creee, modifiable
2. **en_cours**: Travaux demarres, Section 2 remplie
3. **valide**: Travaux termines, Section 3 remplie
4. **archive**: Fiche archivee, **LECTURE SEULE** (conformite legale)

### Protection des archives
Le middleware `archiveGuard.js` bloque toute modification sur les fiches archivees.

---

## 7. Intervenants et habilitations

### Types d'habilitation electrique
- **B0**: Personnel non electricien
- **B1/B1V/B1TL**: Executant
- **B2/B2V/B2TL**: Charge de travaux
- **BR**: Charge d'intervention
- **BC**: Charge de consignation
- **BE**: Essais

### Intervenants pre-enregistres (seed)
8 intervenants avec habilitations B1TL et B2TL, validite 1 an.

---

## 8. Commandes utiles

### Installation
```bash
# Client
cd client && npm install

# Serveur
cd server && npm install
```

### Demarrage
```bash
# Serveur (port 3001)
cd server && npm run dev

# Client (port 5173)
cd client && npm run dev
```

### Base de donnees
```bash
# Migrations
cd server && npm run db:migrate

# Seed (donnees initiales)
cd server && npm run db:seed
```

### URLs
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health check: http://localhost:3001/api/health

---

## 9. Problemes connus et solutions

### Issue: better-sqlite3 ne compile pas (Node.js v25)
**Solution**: Utiliser sql.js (pure JavaScript) a la place.
- Fichier modifie: `server/src/config/database.js`
- Wrapper classes pour compatibilite API better-sqlite3

### Issue: Token JWT expire immediatement
**Cause**: `.env` contenait `JWT_EXPIRES_IN=8` (8 secondes)
**Solution**: Changer en `JWT_EXPIRES_IN=8h` (8 heures)

### Issue: Connexion echoue avec "INVALID_JSON"
**Cause**: Caracteres speciaux (`!`) dans le shell
**Solution**: Utiliser des fichiers JSON ou echapper correctement

---

## 10. Fichiers de configuration cles

### server/.env
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=renault_tst_manager_secret_key_2025_change_in_production
JWT_EXPIRES_IN=8h
DATABASE_PATH=./database/tst_manager.db
FRONTEND_URL=http://localhost:5173
```

### client/vite.config.js
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
```

---

## 11. Formulaire TST - Structure

Le formulaire TST est divise en 3 sections correspondant au workflow:

### Section 1: Ordre et Autorisation de Travail
- Date de l'ordre
- Type batterie/vehicule
- Identification BIN
- Lieu d'intervention
- Nature des travaux
- Periode d'autorisation (debut/fin)
- Responsable exploitation + signature
- Charge de travaux + signature

### Section 2: Avis de Debut de Travail
- Date/heure debut
- Charge de travaux debut + signature
- Executant + signature
- Surveillant securite (optionnel) + signature

### Section 3: Avis de Fin de Travail
- Date/heure fin
- Etat batterie apres travaux
- Charge de travaux fin + signature
- Responsable fin + signature

---

## 12. Prochaines etapes potentielles

- [ ] Export Excel des archives
- [ ] Notifications email
- [ ] Dashboard statistiques avancees
- [ ] Mode hors-ligne (PWA)
- [ ] Integration LDAP/Active Directory
- [ ] Signature electronique certifiee

---

## 13. Contact projet

**Service**: 00596 - Renault Group
**Application**: TST Manager v1.0.0

---

*Derniere mise a jour: Mars 2026*
