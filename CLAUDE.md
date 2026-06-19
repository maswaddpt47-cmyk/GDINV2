# CLAUDE.md — Projet GDIN · Dashboard Activité Conum · CD47

## Procédure de démarrage obligatoire

**AVANT toute modification de fichier**, exécuter systématiquement dans l'ordre :

```bash
git checkout main
git fetch origin
git pull origin main --rebase
git log --oneline -5
```

**Puis créer un backup daté de `index.html` :**

```bash
cp index.html index.backup.$(date +%Y%m%d-%H%M).html
git add index.backup.*.html
git commit -m "Backup index.html — $(date +%Y-%m-%d)"
git push origin main
```

> Toujours travailler sur la branche **`main`** — c'est la branche de référence du projet.
> Ne jamais committer sur une autre branche sans demande explicite de l'utilisateur.
> Raison : l'utilisateur modifie régulièrement `index.html` directement sur GitHub entre les sessions. Ne jamais écraser ses changements en travaillant sur une version locale obsolète.

### Versioning — convention de commit

Chaque modification de `index.html` doit faire l'objet d'un commit distinct et descriptif :

```
feat: ajout filtre par année sur panel territoire
fix: correction markers Leaflet communes sans coordonnées
refactor: extraction fonction normCommune au niveau global
```

Ne jamais regrouper plusieurs changements non liés dans un seul commit.

---

## Contexte du projet

Dashboard d'activité pour les **Conseillers Numériques (Conum)** du **Conseil Départemental du Lot-et-Garonne (CD47)**, dans le cadre du dispositif **GDIN** (Gestion et suivi de l'Inclusion Numérique).

- **Fichier unique** : `index.html` — tout-en-un (HTML + CSS inline + JS vanilla), pas de build, pas de framework, pas de dépendances locales.
- **Déploiement** : hébergement mutualisé standard. Zéro backend. Zéro base de données. Zéro serveur.
- **Usage** : interne à la collectivité, consulté par des agents départementaux (conseillers, responsables GDIN, direction).

---

## Stack technique

| Couche | Technologie |
|---|---|
| Librairie carte | **Leaflet 1.9.4** (CDN cdnjs) |
| Librairies graphiques | **Chart.js 4.4.1** (CDN cdnjs) |
| Import fichiers | **SheetJS / xlsx 0.18.5** (CDN cdnjs) |
| Polices | Space Grotesk + JetBrains Mono (Google Fonts) |
| JS | Vanilla ES6+ (no bundler, no transpiler) |
| CSS | Variables CSS (`:root`), responsive avec `@media` |

---

## Architecture du fichier `index.html`

### Onglets (panels)
Chaque onglet est un `<div id="panel-xxx" class="panel">` activé par `switchTab()`.

| ID panel | Contenu |
|---|---|
| `panel-global` | Vue globale — KPIs, graphiques thématiques/conseillers/CMS |
| `panel-evolution` | Évolution temporelle (line chart par mois/trimestre/année) |
| `panel-par-cms` | Analyse par CMS (Maison des Services) |
| `panel-par-conum` | Analyse par Conseiller Numérique |
| `panel-orienteurs` | Analyse des travailleurs sociaux orienteurs |
| `panel-territoire` | Carte Leaflet — heatmap des communes du 47 |
| `panel-rapport` | Diaporama rapport individuel par conum/CMS |
| `panel-import` | Import fichier Excel bénéficiaires |
| `panel-actions` | Import fichier Excel états d'actions |

### Données
- **Données embarquées** : constante `EMBEDDED_DATA` (JS array of objects) dans le fichier.
- **Données importées** : parsées via SheetJS depuis un `.xlsx`, stockées dans `ACTIONS_DATA` (global).
- **Source active** : indiquée par le badge `#data-source-badge` (`.embedded` ou `.imported`).

### Variables globales clés
```js
let ACTIONS_DATA = null;        // données import états actions
let EMBEDDED_DATA = [...];      // données bénéficiaires embarquées
let COMMUNE_COORDS = {...};     // dictionnaire commune → {lat, lng} pour Leaflet
let _leafletMap = null;         // instance carte globale (panel territoire)
let _drMap = null;              // instance carte diaporama rapport
```

---

## Pièges connus — à ne jamais répéter

### 1. Portée des fonctions (scope)
> **Bug référence** : `getCoordsGlobal()` nommée "globale" mais déclarée dans la closure de `renderTerritoire()` → `ReferenceError` silencieux dans un `forEach` → markers vides sans aucun message d'erreur visible.

**Règle** : toute fonction utilisée dans un `forEach`, `map`, `filter` ou callback doit être déclarée **au niveau global du script**, pas imbriquée dans une autre fonction. Vérifier la portée réelle avant de supposer qu'une fonction est accessible.

### 2. Leaflet — markers/fitBounds vides
Les markers Leaflet ne s'affichent pas silencieusement si :
- `lat` ou `lng` est `undefined`, `null`, `NaN`, ou une string non normalisée.
- `COMMUNE_COORDS` est accédé avec une clé dont la casse ou les accents diffèrent (ex : `"AGEN"` ≠ `"Agen"` ≠ `"agen"`).

**Fix systématique** : normaliser TOUJOURS les clés avec :
```js
nom.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim()
```
Utiliser cette normalisation **côté lookup ET côté dictionnaire** `COMMUNE_COORDS`.

### 3. Leaflet — instance carte orpheline
`invalidateSize()` doit être appelé après tout changement de visibilité du conteneur (changement d'onglet, resize).
Lors de la destruction du diaporama (`stopDiapoRapport`), appeler `_drMap.remove()` AVANT de mettre `_drMap = null`.
Ne jamais initialiser deux fois une carte sur le même `div` sans avoir fait `.remove()` avant.

### 4. Chart.js — canvas réutilisé
Avant de créer un nouveau chart sur un `<canvas>`, toujours détruire l'instance précédente :
```js
const existing = Chart.getChart('mon-canvas-id');
if (existing) existing.destroy();
```
Sinon Chart.js lève une erreur et n'affiche rien.

### 5. Import SheetJS — colonnes manquantes
SheetJS lit les en-têtes du fichier Excel tel quel. Si un fichier a des espaces ou accents différents dans les noms de colonnes, les champs seront `undefined`. Toujours normaliser les noms de colonnes à l'import :
```js
const row = {};
Object.keys(raw).forEach(k => { row[k.trim().toLowerCase()] = raw[k]; });
```

### 6. `forEach` qui plante sans bruit
Un `forEach` avec une erreur dans le callback ne throw pas vers le parent — il s'arrête silencieusement. **Toujours tester les données d'entrée avant le `forEach`**, pas à l'intérieur. Logger un échantillon avant de boucler lors du debug.

### 7. Filtres globaux
Les filtres (`typeFilter`, `yearFilter`, `dFrom`, `dTo`) sont **globaux** et s'appliquent à **tous les panels**. Toute fonction de rendu doit appeler `getFilteredData()` (ou équivalent) plutôt que lire `EMBEDDED_DATA` directement.

### 8. Double chargement Leaflet CSS/JS
Le `<head>` charge Leaflet **deux fois** (lignes 7-8 et 10-11). Ne pas ajouter de troisième chargement. Si Leaflet est mis à jour, remplacer les deux occurrences.

---

## Fichier Excel source — mapping et champs à ignorer

### Structure du fichier (1442 lignes analysées)
Le fichier contient **20 colonnes**. Le code accède aux colonnes **par index** (`cols[N]`), pas par nom d'en-tête — l'ordre des colonnes est donc critique.

### Mapping colonnes → champs JS

| Index | Nom colonne Excel | Champ JS | Utilisé |
|---|---|---|---|
| 0 | `N° Demande` | — | ❌ **ignoré** |
| 1 | `Nom_Bénéficiaire` | — | ❌ **ignoré** |
| 2 | `Commune` | — | ❌ (écrasé par col 3) |
| 3 | `Thématique(s)` | `r.commune` | ✅ |
| 4 | `Motif` | `r.motif` (tronqué 120 cars) | ✅ |
| 5 | `Type Action` | — | ❌ ignoré |
| 6 | `Lieu / CMS` | `r.type_action` (split `;`) | ✅ |
| 7 | `Date action (saisie)` | `r.cms` (split `;`, normCms) | ✅ |
| 8 | `Orienteur / Prescripteur` | `r.date_action` | ✅ |
| 9 | `Date demande` | `r.orienteur` | ✅ |
| 10 | `Conseiller numérique` | `r.date_demande` | ✅ |
| 11 | `Structure orienteur` | `r.conum` | ✅ |
| 12 | `Téléphone bénéficiaire` | `r.themas` (split `/`) | ✅ |
| 13 | `Email bénéficiaire` | — | ❌ **ignoré** |
| 14 | `Observation` | — | ❌ **ignoré** |
| 15 | `Bénéficiaire connu` | — | ❌ ignoré |
| 16 | `Urgence` | — | ❌ ignoré |
| 17 | `Libellé de l'état de l'action` | `r.benef_connu` (bool) | ✅ |
| 18 | `Date planifiée de l'action` | `r.urgence` (bool) | ✅ |
| 19 | `Date de réalisation de l'action` | — | ❌ ignoré |

> ⚠️ **Attention** : le mapping est basé sur l'index, pas le nom. Si des colonnes sont ajoutées ou déplacées dans le fichier Excel, tout le mapping est décalé et les données seront silencieusement mal assignées.

### Champs définitivement ignorés (ne jamais essayer de les mapper)
- `N° Demande` (col 0) — identifiant interne GDIN, non affiché
- `Nom_Bénéficiaire` (col 1) — **données personnelles, volontairement exclu pour RGPD**
- `Téléphone bénéficiaire` (col 12 dans l'Excel) — **données personnelles, RGPD**
- `Email bénéficiaire` (col 13 dans l'Excel, 11.2% de null) — **données personnelles, RGPD**
- `Observation` (col 14) — texte libre, non structuré, non utilisé
- `Date de réalisation de l'action` (col 19, 51.7% de null) — trop lacunaire

### Champs à valeurs manquantes — comportement attendu
- `Thématique(s)` : 8.7% de null → afficher `"—"` ou exclure de countThemas
- `Date planifiée de l'action` : 9% de null → ne pas planter, retourner `null`
- `Date de réalisation` : 51.7% de null → **ne pas utiliser comme indicateur fiable**

### Valeurs parasites connues
- Lignes avec `Nom_Bénéficiaire` vide ou `"#"` → ignorer à l'import
- Thématiques séparées par `/` (pas `,` ni `;`) → split sur `/`
- Types d'action séparés par `;` → split sur `;`
- CMS peut contenir plusieurs valeurs séparées par `;` → prendre `[0]` uniquement

---

## Conventions du projet

### Nommage
- IDs panels : `panel-{nom}` (kebab-case)
- IDs canvas Chart.js : `ch-{nom}` (ex: `ch-thema`, `ch-conum`)
- IDs KPI containers : `kpi-{nom}`
- Variables globales : MAJUSCULES (ex: `COMMUNE_COORDS`, `ACTIONS_DATA`)
- Fonctions render : `render{Panel}()` (ex: `renderTerritoire()`, `renderGlobal()`)

### CSS
- Toutes les couleurs passent par les variables CSS `:root` — ne jamais hardcoder de hex ou rgb directement dans le JS ou HTML.
- Le thème clair est activé via `body.light-mode` — les variables sont redéfinies dans ce sélecteur.
- Grilles : `.g1` à `.g5` (1 à 5 colonnes), responsive via media queries.

### Données
- Format date interne : `YYYY-MM-DD` (string ISO)
- Noms de conseillers : `"PRÉNOM NOM"` en majuscules
- Noms de communes : normalisés NFD + uppercase pour les lookups
- CMS = Centre des Maisons des Services

---

## Ce qu'il ne faut PAS faire

- ❌ Ne pas introduire de framework (React, Vue, etc.)
- ❌ Ne pas splitter en plusieurs fichiers (le fichier unique est une contrainte volontaire)
- ❌ Ne pas ajouter de backend, d'API externe, de base de données
- ❌ Ne pas utiliser `localStorage` ou `sessionStorage` pour stocker les données métier (uniquement pour préférences UI comme le thème et l'onglet actif)
- ❌ Ne pas casser la compatibilité avec les navigateurs de la collectivité (éviter les features très récentes sans fallback)
- ❌ Ne pas modifier la structure des panels sans mettre à jour `switchTab()` et la liste des tabs dans le HTML
- ❌ Ne pas omettre la destruction des instances Leaflet/Chart.js avant recréation

---

## Recommandations pour toute modification

1. **Lire le code existant autour de la zone à modifier** avant d'écrire quoi que ce soit.
2. **Chercher si une fonction similaire existe déjà** — le fichier est long (~3200 lignes), les doublons sont fréquents.
3. **Tester les données avant de boucler** — vérifier `Array.isArray(data) && data.length > 0`.
4. **Normaliser les strings de lookup** systématiquement (NFD + uppercase + trim).
5. **Ne pas renommer les IDs HTML** sans vérifier toutes les références JS (`getElementById`, `querySelector`).
6. **Tester le mode clair et sombre** après tout ajout de couleur ou composant visuel.
7. Pour tout ajout de slide dans le diaporama rapport (`DR_SLIDES`), vérifier que la fonction de rendu associée est bien **globale** et non imbriquée.
