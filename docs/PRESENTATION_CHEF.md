# TST Manager - Presentation Application

**Service 00596 - Renault Group**
**Version 1.0.0 - Mars 2026**

---

## 1. Objectif de l'application

### Problematique actuelle
Le processus actuel de gestion des fiches TST (Travail Sous Tension) repose sur des documents papier, ce qui engendre :
- Des risques d'erreurs de saisie
- Des difficultes de tracabilite
- Un archivage complexe et peu securise
- Une perte de temps dans la recherche de documents

### Solution proposee
**TST Manager** est une application web qui digitalise entierement le processus de creation, signature et archivage des ordres de travail sous tension pour les reparations de batteries de traction sur vehicules electriques et hybrides.

### Benefices cles
| Benefice | Description |
|----------|-------------|
| Tracabilite complete | Chaque fiche possede un ID unique, un horodatage et un historique des modifications |
| Conformite legale | Les archives sont en lecture seule, impossible de modifier une fiche archivee |
| Gain de temps | Creation et recherche de fiches en quelques clics |
| Zero papier | Tout est digitalise, export PDF disponible |
| Securite | Authentification obligatoire, roles et permissions |

---

## 2. Architecture technique

### Schema global

```
┌─────────────────────────────────────────────────────────────────┐
│                         UTILISATEURS                            │
│                    (Navigateur web moderne)                     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Pages     │  │ Composants  │  │  Services API (Axios)   │  │
│  │  - Login    │  │  - Header   │  │  - Authentification     │  │
│  │  - Dashboard│  │  - Sidebar  │  │  - Gestion TST          │  │
│  │  - Fiches   │  │  - Modals   │  │  - Intervenants         │  │
│  │  - Archives │  │  - Forms    │  │                         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│                         Port 5173                               │
└─────────────────────────────────────────────────────────────────┘
                                │
                          API REST (JSON)
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Node.js/Express)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Routes    │  │ Controllers │  │     Middlewares         │  │
│  │  /api/auth  │  │  - Auth     │  │  - Verification JWT     │  │
│  │  /api/tst   │  │  - TST      │  │  - Protection archives  │  │
│  │  /api/inter │  │  - Interv.  │  │  - Validation donnees   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│                         Port 3001                               │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BASE DE DONNEES (SQLite)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   users     │  │ interveners │  │       tst_forms         │  │
│  │ (comptes)   │  │(habilites)  │  │   (fiches TST)          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│                      + audit_logs (tracabilite)                 │
└─────────────────────────────────────────────────────────────────┘
```

### Technologies utilisees

| Couche | Technologie | Justification |
|--------|-------------|---------------|
| Frontend | React 18 + Vite | Framework moderne, performant, maintenable |
| Styles | Tailwind CSS | Design system coherent, responsive |
| Backend | Node.js + Express | Leger, rapide, ecosysteme riche |
| Base de donnees | SQLite | Simple, pas de serveur externe, portable |
| Authentification | JWT | Standard securise, stateless |
| PDF | PDFKit | Generation de documents officiels |

---

## 3. Fonctionnalites principales

### 3.1 Gestion des utilisateurs

**Trois niveaux d'acces :**

| Role | Permissions |
|------|-------------|
| **Admin** | Acces complet : gestion utilisateurs, CRUD fiches/intervenants, archives |
| **User** | Creation/modification de fiches et intervenants |
| **Readonly** | Consultation uniquement (auditeurs, consultants) |

### 3.2 Annuaire des intervenants

- Liste des personnes habilitees a intervenir sur batteries haute tension
- Gestion des habilitations electriques (B0, B1, B1V, B1TL, B2, B2V, B2TL, BR, BC, BE)
- Suivi des dates de validite
- Filtrage par entreprise, fonction, type d'habilitation

### 3.3 Fiches TST (coeur de l'application)

Chaque fiche TST suit un cycle de vie strict :

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  BROUILLON   │────▶│   EN COURS   │────▶│    VALIDE    │────▶│   ARCHIVE    │
│              │     │              │     │              │     │              │
│ Fiche creee  │     │   Travaux    │     │   Travaux    │     │   Lecture    │
│ modifiable   │     │   demarres   │     │   termines   │     │   seule      │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

**Structure d'une fiche TST :**

| Section | Contenu |
|---------|---------|
| **Section 1** : Ordre de travail | Date, type batterie, lieu, nature travaux, responsable exploitation, charge de travaux |
| **Section 2** : Debut de travail | Date/heure debut, executant, surveillant securite, signatures |
| **Section 3** : Fin de travail | Date/heure fin, etat batterie, signatures de cloture |

### 3.4 Signatures electroniques

- Capture de signature manuscrite sur ecran tactile
- Stockage securise en base de donnees
- Association signature/intervenant/horodatage

### 3.5 Generation PDF

- Export de chaque fiche en PDF officiel
- Format conforme aux exigences reglementaires
- Inclut toutes les signatures et informations

### 3.6 Tracabilite (Audit logs)

Chaque action est enregistree :
- Qui a fait quoi
- Quand (horodatage precis)
- Quels champs ont ete modifies
- Adresse IP et navigateur

---

## 4. Securite et conformite

### Mesures de securite implementees

| Mesure | Description |
|--------|-------------|
| Authentification JWT | Token securise avec expiration 8h |
| Hashage mots de passe | bcrypt avec salt (standard industrie) |
| Protection des archives | Middleware bloquant toute modification |
| Validation des donnees | Verification cote serveur de toutes les entrees |
| CORS configure | Seul le frontend autorise peut acceder a l'API |

### Conformite reglementaire

- **Archives inviolables** : Une fois archivee, une fiche ne peut plus etre modifiee
- **Tracabilite complete** : Historique de toutes les modifications
- **Identification unique** : Format TST-YYYYMMDD-XXXX
- **Horodatage** : Date et heure precises de chaque action

---

## 5. Demonstration de l'application

### Parcours de demonstration suggere

#### Etape 1 : Connexion
1. Acceder a l'application : `http://localhost:5173`
2. Se connecter avec le compte admin :
   - Matricule : `ADMIN001`
   - Mot de passe : `Admin@123!`

#### Etape 2 : Dashboard
- Presenter les statistiques globales
- Montrer les fiches recentes
- Expliquer les indicateurs

#### Etape 3 : Annuaire intervenants
1. Menu "Intervenants"
2. Montrer la liste des personnes habilitees
3. Filtrer par entreprise ou habilitation
4. Ouvrir le detail d'un intervenant

#### Etape 4 : Creation d'une fiche TST
1. Cliquer sur "Nouvelle fiche TST"
2. Remplir la Section 1 (Ordre de travail) :
   - Selectionner le type de batterie
   - Choisir le lieu d'intervention
   - Decrire la nature des travaux
   - Selectionner les intervenants
3. Sauvegarder en brouillon

#### Etape 5 : Cycle de vie complet
1. Ouvrir une fiche en brouillon
2. Demarrer les travaux (Section 2)
3. Terminer les travaux (Section 3)
4. Archiver la fiche
5. Montrer qu'elle est en lecture seule

#### Etape 6 : Export PDF
1. Ouvrir une fiche validee ou archivee
2. Cliquer sur "Telecharger PDF"
3. Montrer le document genere

#### Etape 7 : Archives
1. Menu "Archives"
2. Montrer la recherche et les filtres
3. Demontrer l'impossibilite de modification

---

## 6. Prochaines evolutions possibles

| Evolution | Description | Priorite |
|-----------|-------------|----------|
| Export Excel | Export des archives en format tableur | Haute |
| Notifications email | Alertes automatiques (expiration habilitation, etc.) | Moyenne |
| Mode hors-ligne | Application PWA fonctionnant sans connexion | Moyenne |
| Integration LDAP | Connexion avec l'annuaire Renault | Haute |
| Signature certifiee | Signature electronique qualifiee | Basse |
| Dashboard avance | Statistiques et graphiques detailles | Basse |

---

## 7. Contacts et support

**Application** : TST Manager v1.0.0
**Service** : 00596 - Renault Group
**Environnement** : Development

### URLs d'acces (environnement de developpement)
- Frontend : http://localhost:5173
- API Backend : http://localhost:3001
- Health check : http://localhost:3001/api/health

---

*Document genere le 9 mars 2026*
