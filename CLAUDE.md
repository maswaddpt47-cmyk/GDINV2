# CLAUDE.md — Règles de travail

## Procédure obligatoire avant toute intervention

**Étape 1 — Récupérer les dernières modifications**
```bash
git checkout main
git fetch origin
git pull origin main --rebase
```

**Étape 2 — Modifier le fichier**

**Étape 3 — Commiter et pousser chaque modification séparément**
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

### Synchronisation CR ↔ Diapo Rapport — règle impérative

Le panneau **CR (Compte Rendu)** — `renderRapport()` — et le **Diapo Rapport** — `DR_SLIDES` + fonctions `drSlide*()` — doivent **toujours afficher les mêmes informations**.

> L'utilisateur consulte le CR pour préparer ses données, puis lance le Diapo Rapport pour les projeter. Si un élément est visible dans le CR mais absent du diapo, la projection est incomplète.

**Règle :** tout graphe, KPI ou section ajouté dans `renderRapport()` doit avoir un slide équivalent dans `DR_SLIDES` + une fonction `drSlide*()` correspondante. Ne jamais modifier le CR sans mettre à jour le diapo rapport en même temps.

Il existe deux diaporamas distincts dans l'application — **ne pas les confondre** :

| | Diapo Global | Diapo Rapport |
|---|---|---|
| Bouton | `▶ Diapo Global` (`#btn-pres`) | `▶ Diapo rapport` (`#btn-diapo-rpt`) |
| Overlay plein écran | `#diapo-overlay` | `#dr-overlay` |
| Label en plein écran | `DIAPO GLOBAL` (topbar) | `CD47 · GDIN` (`#dr-logo`) |
| Tableau de slides | `DIAPO_SLIDES` | `DR_SLIDES` |
| Fonctions de rendu | `diapoNav()`, `diapoGoTo()` | `drNav()`, `drGoTo()`, `drSlide*()` |
| Données | `getDiapoData()` (global) | `drData()` (conum × CMS) |
| Charts | `charts{}` | `drCharts{}` |

### Tests unitaires — règle obligatoire

Le fichier **`gdin-pure.js`** contient toutes les fonctions pures du projet (calculs, parsing, normalisation CMS). Le fichier **`tests.html`** contient 54 tests unitaires qui les couvrent.

**Si le projet contient des fonctions de calcul, de parsing ou de normalisation de données → créer `gdin-pure.js` (ou équivalent) + `tests.html` dès la première session significative, sans attendre qu'on le demande.**

Une session est significative si elle touche à la logique métier (pas une simple correction de typo ou de style).

**Règle :** après toute modification de `gdin-pure.js`, vérifier que les tests passent avant de commiter :

```bash
node -e "eval(require('fs').readFileSync('gdin-pure.js','utf8')); console.log('syntax OK');"
```

Ou ouvrir `tests.html` dans un navigateur pour la suite complète.

- Si un test échoue après une **correction de bug** → corriger le code, pas le test.
- Si un test échoue après un **changement intentionnel** → mettre à jour le test ET le code dans le même commit.
- Ne jamais désactiver ou supprimer un test pour faire passer le commit.

> Ne jamais modifier `gdin-pure.js` sans vérifier les tests. Ne jamais modifier les tests sans modifier le code correspondant.

### Convention de messages de commit
| Préfixe | Usage |
|---|---|
| `feat:` | Ajout d'une nouvelle fonctionnalité |
| `fix:` | Correction d'un bug |
| `refactor:` | Réécriture sans changement de comportement |

---

## Pourquoi ces règles

L'utilisateur modifie régulièrement les fichiers directement sur GitHub entre les sessions. Sans `git pull` au démarrage, les modifications locales écrasent silencieusement son travail. L'historique git sert de filet de sécurité.
