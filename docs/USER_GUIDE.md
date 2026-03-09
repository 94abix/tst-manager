# Guide Utilisateur - TST Manager

## Introduction

Bienvenue dans TST Manager, l'application de gestion des fiches Travail Sous Tension pour les interventions sur batteries de traction.

Ce guide vous accompagne dans l'utilisation quotidienne de l'application.

---

## Connexion

### Accéder à l'application

1. Ouvrez votre navigateur web
2. Accédez à l'URL de l'application
3. L'écran de connexion s'affiche

### Se connecter

```
┌─────────────────────────────────────┐
│           TST Manager               │
│         [Logo Renault]              │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Matricule: [___________]    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Mot de passe: [*********]   │   │
│  └─────────────────────────────┘   │
│                                     │
│  [ Se connecter ]                   │
│                                     │
└─────────────────────────────────────┘
```

1. Entrez votre **matricule** (ex: USER001)
2. Entrez votre **mot de passe**
3. Cliquez sur **Se connecter**

---

## Tableau de bord

Après connexion, vous arrivez sur le tableau de bord.

```
┌─────────────────────────────────────────────────────────────────┐
│  [Sidebar]  │              TABLEAU DE BORD                      │
│             │                                                   │
│  Dashboard  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐         │
│  Nouvelle   │  │ 42  │ │  5  │ │  3  │ │ 28  │ │  6  │         │
│  Archives   │  │Total│ │Brouil│ │En   │ │Valid│ │Arch │         │
│  Interv.    │  └─────┘ └─────┘ └cours┘ └─────┘ └─────┘         │
│             │                                                   │
│             │  FICHES RÉCENTES                                  │
│             │  ┌───────────────────────────────────────────┐   │
│             │  │ TST-2025-000042 │ En cours │ Batterie... │   │
│             │  │ TST-2025-000041 │ Validé   │ Pack HV...  │   │
│             │  │ TST-2025-000040 │ Archivé  │ Module...   │   │
│             │  └───────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Éléments affichés

- **Statistiques** : Nombre de fiches par statut
- **Fiches récentes** : Dernières fiches créées
- **Actions rapides** : Créer une fiche, gérer les intervenants

---

## Créer une fiche TST

### Étape 1 : Accéder au formulaire

Cliquez sur **"Nouvelle fiche"** dans la barre latérale ou sur le bouton en haut à droite.

### Étape 2 : Remplir les informations

```
┌─────────────────────────────────────────────────────────────────┐
│                    NOUVELLE FICHE TST                           │
├─────────────────────────────────────────────────────────────────┤
│  INFORMATIONS BATTERIE                                          │
│  ┌─────────────────────┐  ┌─────────────────────┐               │
│  │ Type: [Batterie...▼]│  │ BIN: [BIN123456...]│               │
│  └─────────────────────┘  └─────────────────────┘               │
├─────────────────────────────────────────────────────────────────┤
│  LIEU ET NATURE DES TRAVAUX                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Lieu: [Atelier batterie - Zone A                      ] │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Nature: [Diagnostic défaut cellule n°12...            ] │   │
│  │         [_____________________________________________] │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  INTERVENANTS                                                   │
│  ┌──────────────────────────┐  ┌──────────────────────────┐    │
│  │ Responsable: [DURET G.▼]│  │ Chargé (B2TL): [AUBE B.▼]│    │
│  └──────────────────────────┘  └──────────────────────────┘    │
├─────────────────────────────────────────────────────────────────┤
│  PÉRIODE D'AUTORISATION                                         │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │ Début: [📅    ]│  │ Fin: [📅      ]│  │ Délai: [📅    ]│    │
│  └────────────────┘  └────────────────┘  └────────────────┘    │
├─────────────────────────────────────────────────────────────────┤
│                        [Annuler]  [Créer la fiche]              │
└─────────────────────────────────────────────────────────────────┘
```

#### Champs obligatoires (*)

| Champ | Description |
|-------|-------------|
| Type de batterie | Sélectionnez le type (Li-ion 400V, 800V, etc.) |
| Identification BIN | Numéro d'identification unique de la batterie |
| Lieu d'intervention | Emplacement précis des travaux |
| Nature des travaux | Description détaillée de l'intervention |
| Responsable d'exploitation | Personne qui autorise les travaux |
| Chargé de travaux | Personne habilité B2TL |
| Période d'autorisation | Dates de début et fin |

### Étape 3 : Enregistrer

Cliquez sur **"Créer la fiche"**. La fiche est créée avec le statut **Brouillon**.

---

## Cycle de vie d'une fiche

### Les 4 statuts

```
┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐
│ BROUILLON │ ──▶ │ EN COURS  │ ──▶ │  VALIDÉ   │ ──▶ │  ARCHIVÉ  │
│   (gris)  │     │  (jaune)  │     │  (vert)   │     │  (bleu)   │
│ Modifiable│     │ Travaux   │     │ Terminé   │     │ Lecture   │
│           │     │ actifs    │     │           │     │ seule     │
└───────────┘     └───────────┘     └───────────┘     └───────────┘
    │                  │                  │                  │
    │  Démarrer        │   Terminer       │   Archiver       │
    │  les travaux     │   les travaux    │                  │
    └──────────────────┴──────────────────┴──────────────────┘
```

### Démarrer les travaux

1. Ouvrez une fiche en statut **Brouillon**
2. Cliquez sur **"Démarrer"**
3. Sélectionnez :
   - Le chargé de travaux (B2TL)
   - L'exécutant (B1TL)
   - Le surveillant sécurité (optionnel)
4. Confirmez

### Terminer les travaux

1. Ouvrez une fiche en statut **En cours**
2. Cliquez sur **"Terminer"**
3. Renseignez :
   - L'état final de la batterie
   - Le chargé de travaux
   - Le responsable d'exploitation
4. Confirmez

### Archiver

1. Ouvrez une fiche en statut **Validé**
2. Cliquez sur **"Archiver"**
3. **Attention** : Cette action est irréversible
4. Confirmez

> **Important** : Une fiche archivée est en **lecture seule définitive** pour garantir sa valeur juridique.

---

## Consulter et filtrer les fiches

### Page Archives

```
┌─────────────────────────────────────────────────────────────────┐
│                         ARCHIVES                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐  ┌─────────┐          │
│  │ 🔍 Rechercher...                    │  │ Filtres │          │
│  └─────────────────────────────────────┘  └─────────┘          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Statut: [Tous     ▼]  Date: [__/__/____] - [__/__/____]│   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  Référence    │ Statut │ Type      │ BIN      │ Date   │ ⚙️   │
│  ─────────────┼────────┼───────────┼──────────┼────────┼─────  │
│  TST-2025-042 │ 🟢     │ Li-ion    │ BIN12345 │ 15/01  │ 👁️ 📥 │
│  TST-2025-041 │ 🔵     │ Pack HV   │ BIN67890 │ 14/01  │ 👁️ 📥 │
│  TST-2025-040 │ 🟡     │ Module    │ BIN11111 │ 13/01  │ 👁️ 📥 │
└─────────────────────────────────────────────────────────────────┘
```

### Filtres disponibles

- **Recherche** : Par référence, BIN, type de batterie
- **Statut** : Brouillon, En cours, Validé, Archivé
- **Date** : Période de création

### Actions sur une fiche

- **👁️ Voir** : Ouvrir le détail
- **📥 PDF** : Télécharger le document

---

## Gérer les intervenants

### Page Intervenants

```
┌─────────────────────────────────────────────────────────────────┐
│                    ANNUAIRE DES INTERVENANTS                    │
│                                        [+ Nouvel intervenant]   │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐                        │
│  │ 🔍 Rechercher par nom, matricule... │                        │
│  └─────────────────────────────────────┘                        │
├─────────────────────────────────────────────────────────────────┤
│  Matricule │ Nom          │ Entreprise │ Habili. │ Validité    │
│  ──────────┼──────────────┼────────────┼─────────┼─────────────│
│  INT001    │ AUBE Bastien │ RENAULT    │ B2TL    │ 🟢 12/2025  │
│  INT002    │ BASSI Julien │ AMPERE     │ B2TL    │ 🟢 06/2025  │
│  INT003    │ BERKAIL F.   │ DACIA      │ B1TL    │ 🟡 02/2025  │
│  INT004    │ MARTINEAU B. │ AMPERE     │ B1TL    │ 🔴 Expiré   │
└─────────────────────────────────────────────────────────────────┘
```

### Créer un intervenant

1. Cliquez sur **"Nouvel intervenant"**
2. Remplissez :
   - Matricule
   - Nom et prénom
   - Entreprise
   - Fonction
   - Type d'habilitation (B1TL, B2TL, etc.)
   - Date de validité
3. Enregistrez

### Modifier ou désactiver

- **Modifier** : Cliquez sur l'icône ✏️
- **Désactiver** : Cliquez sur l'icône 🗑️ (l'intervenant reste en base mais n'est plus sélectionnable)

---

## Exporter en PDF

### Télécharger le PDF d'une fiche

1. Ouvrez la fiche souhaitée
2. Cliquez sur **"PDF"** en haut à droite
3. Le fichier se télécharge automatiquement

### Contenu du PDF

Le PDF généré contient :
- En-tête avec référence et statut
- Informations de la batterie
- Nature des travaux
- Intervenants et signatures
- Dates et horodatages
- Pied de page officiel Renault

> **Note** : Les fiches archivées comportent un filigrane "ARCHIVÉ".

---

## Bonnes pratiques

### Sécurité

- ⚠️ Ne partagez jamais votre mot de passe
- 🔒 Déconnectez-vous après utilisation
- 🚫 Ne laissez pas la session ouverte sans surveillance

### Utilisation

- ✅ Remplissez tous les champs obligatoires
- ✅ Vérifiez les intervenants sélectionnés
- ✅ Archivez les fiches terminées pour garantir leur intégrité
- ✅ Téléchargez les PDF pour vos archives papier

### En cas de problème

- Session expirée → Reconnectez-vous
- Erreur de permission → Contactez votre administrateur
- Bug technique → Notez le message d'erreur et contactez le support

---

## Raccourcis clavier

| Action | Raccourci |
|--------|-----------|
| Rechercher | `Ctrl + K` |
| Nouvelle fiche | `Ctrl + N` |
| Enregistrer | `Ctrl + S` |

---

## Support

En cas de question ou de problème :

- **Service** : After Sales Engineering - Service 00596
- **Email** : support-tst@renault.com

---

*Version 1.0 - Guide utilisateur TST Manager*
