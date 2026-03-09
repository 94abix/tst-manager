# Cycle en V - TST Manager

## Vue d'ensemble du Cycle en V

Le cycle en V est une méthodologie de développement qui associe chaque phase de conception à une phase de test correspondante, garantissant la qualité et la traçabilité du projet.

```
CONCEPTION                                                    VALIDATION
    │                                                              │
    │    ┌────────────────────────────────────────────────────┐   │
    │    │           1. SPÉCIFICATIONS GÉNÉRALES              │   │
    │    │         Besoins métier, contraintes légales        │   │
    │    └────────────────────────────────────────────────────┘   │
    │                           │                                  │
    │                           │                      ┌───────────┴───────────┐
    │                           │                      │ 7. RECETTE UTILISATEUR│
    │                           │                      │   Validation finale   │
    │                           │                      └───────────────────────┘
    │                           ▼                                  │
    │    ┌────────────────────────────────────────────────────┐   │
    │    │           2. SPÉCIFICATIONS FONCTIONNELLES         │   │
    │    │        Fonctionnalités, cas d'utilisation          │   │
    │    └────────────────────────────────────────────────────┘   │
    │                           │                                  │
    │                           │                      ┌───────────┴───────────┐
    │                           │                      │ 6. TESTS D'INTÉGRATION│
    │                           │                      │    Tests fonctionnels │
    │                           │                      └───────────────────────┘
    │                           ▼                                  │
    │    ┌────────────────────────────────────────────────────┐   │
    │    │           3. CONCEPTION ARCHITECTURALE             │   │
    │    │         Architecture technique, schéma DB          │   │
    │    └────────────────────────────────────────────────────┘   │
    │                           │                                  │
    │                           │                      ┌───────────┴───────────┐
    │                           │                      │ 5. TESTS COMPOSANTS   │
    │                           │                      │     Tests API, UI     │
    │                           │                      └───────────────────────┘
    │                           ▼                                  │
    │    ┌────────────────────────────────────────────────────┐   │
    │    │           4. CONCEPTION DÉTAILLÉE                  │   │
    │    │             Code, algorithmes                      │   │
    │    └────────────────────────────────────────────────────┘   │
    │                           │                                  │
    │                           │                      ┌───────────┴───────────┐
    │                           │                      │ TESTS UNITAIRES       │
    │                           │                      │   Fonctions isolées   │
    │                           ▼                      └───────────────────────┘
    │    ┌────────────────────────────────────────────────────┐   │
    │    │                   CODAGE                           │   │
    │    └────────────────────────────────────────────────────┘   │
    │                                                              │
    └──────────────────────────────────────────────────────────────┘
```

---

## Phase 1 : Spécifications Générales

### Contexte métier

| Élément | Description |
|---------|-------------|
| **Domaine** | Réparation batteries de traction (véhicules électriques/hybrides) |
| **Réglementation** | NF C 18-510 - Habilitations électriques |
| **Processus actuel** | Fiches papier manuelles |
| **Problèmes identifiés** | Lenteur, erreurs, archivage difficile, pas de traçabilité |

### Objectifs du projet

1. **Digitaliser** le processus de création des fiches TST
2. **Sécuriser** les données et garantir l'intégrité juridique
3. **Tracer** toutes les actions pour conformité
4. **Simplifier** le travail des intervenants

### Contraintes

- **Légales** : Fiches archivées non modifiables (valeur juridique)
- **Sécurité** : Authentification obligatoire, contrôle d'accès
- **Habilitations** : Vérification des qualifications (B1TL, B2TL)
- **Technique** : Application web interne, compatible navigateurs modernes

### Livrables Phase 1

- [x] Document d'analyse des besoins
- [x] Liste des contraintes réglementaires
- [x] Validation hiérarchique

---

## Phase 2 : Spécifications Fonctionnelles

### Cas d'utilisation principaux

#### UC1 : Créer une fiche TST
```
Acteur : Utilisateur habilité
Préconditions : Utilisateur connecté, rôle 'user' ou 'admin'
Scénario :
  1. L'utilisateur clique sur "Nouvelle fiche"
  2. Remplit les informations batterie (type, BIN)
  3. Sélectionne les intervenants (depuis l'annuaire)
  4. Définit la période d'autorisation
  5. Décrit la nature des travaux
  6. Enregistre la fiche (statut: brouillon)
Postconditions : Fiche créée avec référence unique
```

#### UC2 : Démarrer les travaux
```
Acteur : Chargé de travaux (B2TL)
Préconditions : Fiche en statut 'brouillon'
Scénario :
  1. Sélectionne l'exécutant (B1TL)
  2. Optionnel : Sélectionne le surveillant sécurité
  3. Valide le démarrage
Postconditions : Statut passe à 'en_cours', horodatage enregistré
```

#### UC3 : Terminer et valider
```
Acteur : Chargé de travaux (B2TL)
Préconditions : Fiche en statut 'en_cours'
Scénario :
  1. Renseigne l'état final de la batterie
  2. Sélectionne les validateurs finaux
  3. Confirme la fin des travaux
Postconditions : Statut passe à 'valide', fiche prête pour archivage
```

#### UC4 : Archiver une fiche
```
Acteur : Utilisateur habilité
Préconditions : Fiche en statut 'valide'
Scénario :
  1. Demande l'archivage
  2. Confirme l'action irréversible
Postconditions : Statut passe à 'archive', fiche en lecture seule définitive
```

### Matrice des droits

| Fonctionnalité | Admin | User | Readonly |
|----------------|:-----:|:----:|:--------:|
| Consulter fiches | ✓ | ✓ | ✓ |
| Créer fiche | ✓ | ✓ | ✗ |
| Modifier fiche | ✓ | ✓ | ✗ |
| Démarrer/Terminer | ✓ | ✓ | ✗ |
| Archiver | ✓ | ✓ | ✗ |
| Exporter PDF | ✓ | ✓ | ✓ |
| Gérer utilisateurs | ✓ | ✗ | ✗ |
| Gérer intervenants | ✓ | ✓ | ✗ |

### Livrables Phase 2

- [x] Cas d'utilisation détaillés
- [x] Matrice des droits
- [x] Maquettes d'interface (wireframes)
- [x] Règles de validation

---

## Phase 3 : Conception Architecturale

### Architecture technique

Voir [ARCH_EXPLAINED.md](./ARCH_EXPLAINED.md) pour les détails complets.

**Résumé** :
- Frontend : React SPA
- Backend : Node.js/Express REST API
- Database : SQLite
- Auth : JWT

### Schéma de base de données

```sql
-- 4 tables principales
users           -- Utilisateurs de l'application
interveners     -- Annuaire des intervenants habilités
tst_forms       -- Fiches Travail Sous Tension
audit_logs      -- Journal de traçabilité
```

### Diagramme de flux

```
[Utilisateur] → [Login] → [Dashboard]
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        [Nouvelle Fiche] [Archives]    [Intervenants]
              │               │               │
              ▼               ▼               ▼
        [Détail Fiche]   [Filtres]      [CRUD]
              │
    ┌─────────┼─────────┐
    ▼         ▼         ▼
[Démarrer] [Terminer] [Archiver]
    │         │         │
    ▼         ▼         ▼
[PDF Export] ←─────────────
```

### Livrables Phase 3

- [x] Document d'architecture
- [x] Schéma de base de données
- [x] Diagrammes de séquence
- [x] Spécifications API

---

## Phase 4 : Conception Détaillée & Codage

### Standards de code

- **Langage** : JavaScript ES6+
- **Style** : Commentaires bilingues (FR/EN)
- **Nommage** : camelCase (variables), PascalCase (composants)
- **Documentation** : JSDoc pour les fonctions

### Structure des fichiers

```
Modèle : 1 fichier = 1 responsabilité
  - User.js        → Gestion des utilisateurs
  - TSTForm.js     → Gestion des fiches TST
  - Intervener.js  → Gestion des intervenants
  - AuditLog.js    → Journal d'audit
```

### Livrables Phase 4

- [x] Code source complet
- [x] Commentaires et documentation inline
- [x] Scripts de migration DB

---

## Phase 5 : Tests Composants

### Tests Backend (API)

| Endpoint | Méthode | Test |
|----------|---------|------|
| /api/auth/login | POST | Connexion valide/invalide |
| /api/tst | GET | Liste avec pagination |
| /api/tst | POST | Création avec validation |
| /api/tst/:id | PUT | Modification (non archivé) |
| /api/tst/:id/archive | POST | Archivage (depuis validé) |

### Tests Frontend (UI)

| Composant | Test |
|-----------|------|
| Login | Affichage, validation, redirection |
| Dashboard | Chargement stats, affichage liste |
| NewTSTForm | Validation champs, soumission |
| TSTDetail | Affichage données, actions contextuelles |

### Livrables Phase 5

- [ ] Suite de tests unitaires
- [ ] Rapport de couverture

---

## Phase 6 : Tests d'Intégration

### Scénarios de test

1. **Parcours complet d'une fiche**
   - Login → Créer → Démarrer → Terminer → Archiver → PDF

2. **Gestion des erreurs**
   - Token expiré → Redirection login
   - Modification fiche archivée → Erreur 403

3. **Permissions**
   - Readonly ne peut pas créer
   - User ne peut pas gérer utilisateurs

### Livrables Phase 6

- [ ] Plan de tests d'intégration
- [ ] Rapport d'exécution

---

## Phase 7 : Recette Utilisateur

### Critères d'acceptation

| Critère | Validation |
|---------|------------|
| Création de fiche en < 3 min | ✓ |
| Export PDF conforme au format papier | ✓ |
| Fiche archivée non modifiable | ✓ |
| Traçabilité de toutes les actions | ✓ |
| Interface intuitive (formation < 1h) | ✓ |

### Procédure de recette

1. Formation utilisateurs pilotes
2. Test en conditions réelles (1 semaine)
3. Collecte des retours
4. Corrections éventuelles
5. Validation finale

### Livrables Phase 7

- [ ] PV de recette signé
- [ ] Documentation utilisateur finale
- [ ] Guide de déploiement

---

## Matrice de Traçabilité

| Exigence | Spéc. | Code | Test |
|----------|:-----:|:----:|:----:|
| EX01: Authentification | SF-01 | authController.js | T-AUTH-01 |
| EX02: Créer fiche | SF-02 | tstController.js | T-TST-01 |
| EX03: Cycle de vie | SF-03 | TSTForm.js | T-TST-02 |
| EX04: Archivage RO | SF-04 | archiveGuard.js | T-TST-03 |
| EX05: Export PDF | SF-05 | pdfGenerator.js | T-PDF-01 |
| EX06: Audit | SF-06 | AuditLog.js | T-AUD-01 |
| EX07: Intervenants | SF-07 | Intervener.js | T-INT-01 |

---

## Conclusion

Ce document décrit l'application du cycle en V au projet TST Manager. Chaque phase de conception est liée à une phase de validation, garantissant :

- La **traçabilité** des exigences
- La **qualité** du code
- La **conformité** aux besoins métier
- La **documentation** complète du projet
