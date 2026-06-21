# CLAUDE.md — Règles de travail

## Procédure obligatoire avant toute intervention

**Étape 1 — Récupérer les dernières modifications**
```bash
git checkout main
git fetch origin
git pull origin main --rebase
```

**Étape 2 — Créer un backup daté du fichier avant de le modifier**
```bash
cp <fichier> <fichier>.backup.$(date +%Y%m%d-%H%M)
```
Exemple pour `index.html` :
```bash
cp index.html index.html.backup.$(date +%Y%m%d-%H%M)
```
Le backup doit être **commité et poussé** sur `main` avant toute modification du fichier d'origine.

**Étape 3 — Modifier le fichier**

**Étape 4 — Commiter et pousser chaque modification séparément**
```bash
git add <fichier>
git commit -m "feat|fix|refactor: description claire de la modification"
git push origin main
```

---

## Règles

- Ces étapes s'appliquent à **tous les fichiers** du projet, sans exception.
- La branche de travail est toujours **`main`**. Ne jamais travailler sur une autre branche sans demande explicite.
- **Un commit = une modification.** Ne jamais regrouper des changements non liés dans un seul commit.
- Le backup est toujours commité et poussé **avant** de toucher le fichier.

### Convention de messages de commit
| Préfixe | Usage |
|---|---|
| `feat:` | Ajout d'une nouvelle fonctionnalité |
| `fix:` | Correction d'un bug |
| `refactor:` | Réécriture sans changement de comportement |

---

## Architecture du projet — `index.html` (fichier unique ~4 500 lignes)

Toute la logique est dans un seul fichier HTML. Pas de build, pas de framework.

### Données globales clés
| Variable | Rôle |
|---|---|
| `DATA` | Toutes les lignes importées depuis l'Excel |
| `ACTIONS_DATA` | Import optionnel du fichier Etat_Actions |
| `getFiltered()` | Applique filtre date + années actives + typeFilter |
| `CMS_MAP_RAW` | Whitelist des variantes connues de noms de CMS → nom canonique |
| `KEEP_CMS` | Dérivé auto de `CMS_MAP_RAW` (valeurs canoniques) |
| `CMS_MAIN` | Liste ordonnée des CMS pour dropdowns et graphes |
| `CONUM_ATTRIB` | Attribution conum par CMS quand col 11 est vide |
| `ORI_EXCL` | Set des noms conum exclus des comptages orienteurs |

### Deux systèmes de diapo — NE PAS LES CONFONDRE

Il existe **deux diaporamas indépendants** dans l'application. Ils se ressemblent visuellement mais n'ont rien à voir.

#### 1. Diapo Global (`▶ Diapo Global`)
- Bouton : `#btn-pres` → `startDiapo()`
- Overlay : `#diapo-overlay` (topbar : `#diapo-topbar`, titre : `#diapo-title`)
- Slides : tableau `DIAPO_SLIDES` (8 slides, stats globales toutes structures)
- Données : `getDiapoData()` = `getFiltered()` sans filtre conum/CMS
- Navigation : `diapoNav()`, `diapoGoTo()`
- Fonctions de rendu : `renderDiapoSlide()` et les fonctions `slide*()`

#### 2. Diapo Rapport (`▶ Diapo rapport`)
- Bouton : `#btn-diapo-rpt` → `startDiapoRapport()`
- Overlay : `#dr-overlay` (topbar : `#dr-topbar`, logo : `#dr-logo`)
- Slides : tableau `DR_SLIDES` (9 slides, stats d'un conum × CMS spécifique)
- Données : `drData()` = `getFiltered()` filtré par `drConum` + `drCms` + `drYears`
- Variables d'état : `drConum`, `drCms`, `drYears`, `drIdx`, `drActive`
- Navigation : `drNav()`, `drGoTo()`
- Fonctions de rendu : `drSlide*()` (préfixe `dr`)
- Charts stockés dans `drCharts{}` (pas dans `charts{}`)
- Export PDF : `exportDiapoPDF()`

**Règle** : toute modification d'un slide du Diapo Rapport touche une fonction `drSlide*()` et le tableau `DR_SLIDES`. Ne jamais modifier `DIAPO_SLIDES` par erreur.

### Panneau CR (Compte Rendu)
- Rendu par `renderRapport(conum, cms, data, allData)`
- Sélecteurs : `#sel-rpt-conum`, `#sel-rpt-cms`
- Éléments graphiques : `kpi-rpt`, `ch-rpt-evol`, `ch-rpt-thema`, `bar-rpt-ori`, `ch-rpt-comp`, `rpt-actions-section`
- `ch-rpt-comp` = graphe barres horizontales CMS comparaison → miroir du slide `drSlideComparaison()`

---

## Pourquoi ces règles

L'utilisateur modifie régulièrement les fichiers directement sur GitHub entre les sessions. Sans `git pull` au démarrage, les modifications locales écrasent silencieusement son travail. Le backup daté permet de revenir en arrière en cas d'erreur.
