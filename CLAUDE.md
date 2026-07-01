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

### Convention de messages de commit
| Préfixe | Usage |
|---|---|
| `feat:` | Ajout d'une nouvelle fonctionnalité |
| `fix:` | Correction d'un bug |
| `refactor:` | Réécriture sans changement de comportement |

---

## Pourquoi ces règles

L'utilisateur modifie régulièrement les fichiers directement sur GitHub entre les sessions. Sans `git pull` au démarrage, les modifications locales écrasent silencieusement son travail. L'historique git sert de filet de sécurité.
