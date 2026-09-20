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

Le fichier **`gdin-pure.js`** contient les fonctions pures du projet (calculs, parsing, normalisation CMS). Le fichier **`gdin-pure.test.js`** contient 181 tests unitaires (`node:test`) qui les couvrent. Une suite end-to-end Playwright (`tests-e2e.spec.js`, 26 tests) couvre les parcours navigateur.

**Toute nouvelle fonction de calcul, de parsing ou de normalisation va dans `gdin-pure.js` avec ses tests, pas dans le HTML.**

Une session est significative si elle touche à la logique métier (pas une simple correction de typo ou de style).

**Règle :** après toute modification de `gdin-pure.js`, vérifier que les tests passent avant de commiter :

```bash
npm test          # 181 tests unitaires
npm run audit -- export.xls   # audit d'un export avant d'en tirer un rapport
```

`audit-export.js` rejoue le parseur de l'application sur un fichier réel et
affiche ce qui est retenu, ce qui est écarté et pourquoi, les formats de
dates, les doublons, les délais aberrants et le contrôle de minimisation
RGPD. À lancer sur chaque nouvel export avant d'en tirer un rapport.

La CI bloque le déploiement si un test échoue — ne jamais pousser sans avoir lancé les tests localement.

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

## Où en est le projet

Les chantiers en cours, les décisions en attente et les points à ne pas
défaire sont dans **`CHANTIERS.md`**. Le lire avant d'attaquer quoi que ce
soit : une session qui démarre sans historique n'a pas d'autre source.
Ce fichier-ci porte les règles permanentes, `CHANTIERS.md` l'état du moment.
Le tenir à jour à chaque avancée significative — pas en fin de session, qui
peut s'interrompre sans préavis. Le supprimer quand tout est soldé.

---

## Règles générales adaptées à ce projet

Sections issues de la bibliothèque **MD-LIB** (`maswaddpt47-cmyk/MD-LIB`),
réécrites pour GDINV2. Il n'y a **pas de lien automatique** entre les deux :
modifier la règle dans MD-LIB d'abord, puis la répercuter ici à la main.

### Branche imposée par la plateforme

La branche de travail reste `main`. Mais Claude Code sur le web impose parfois
une branche de session (`claude/...`) : dans ce cas, développer dessus puis
**merger dans `main` en fin de session**, sinon rien n'est déployé.

```bash
git checkout main && git merge <branche> --no-ff && git push origin main
```

### Déploiement et cache

`.github/workflows/deploy.yml` publie sur GitHub Pages **au push sur `main`
uniquement**, et seulement si `node --test gdin-pure.test.js` passe. Une
branche de feature ne déploie rien.

Les scripts sont chargés sans cache-busting (`<script src="gdin-pure.js">`,
sans `?v=N`) — constaté par lecture du `<head>` le 20/09/2026, effet en
production non mesuré. Conséquence possible : après un correctif dans
`gdin-pure.js`, un navigateur peut continuer à exécuter l'ancienne version.
Si un correctif « ne passe pas », tester en navigation privée avant de
chercher un bug ailleurs.

### Un seul dashboard

`index.html` est le seul fichier servi. Il porte le design system dit « v2» :
l'ancien dashboard a été supprimé le 20/09/2026 après vérification que les
144 fonctions et tous les identifiants DOM étaient présents des deux côtés.

Avant cela, chaque évolution était écrite deux fois — les commits portaient la
mention « (v1 + v2) ». **Ne pas recréer un second dashboard.** Une variante à
essayer se fait sur une branche, pas dans un fichier parallèle : deux versions
qui divergent en silence, et dont plus personne ne sait laquelle fait foi, est
la pire situation.

### RGPD & données personnelles

Le dashboard traite des données d'accompagnement d'usagers d'un service
public départemental. Trois garde-fous sont **déjà dans le code** — les
casser est le risque principal du projet :

1. **Minimisation à l'import.** `parseXlsText()` (gdin-pure.js) et
   `parseXlsxBinary()` (dans `index.html`) ne retiennent aucune identité de
   bénéficiaire : ni nom, ni prénom, ni adresse, ni téléphone, ni date de
   naissance. Champs conservés : date, commune, CMS, thématiques, type
   d'action, conum, orienteur, état, motif tronqué à 120 caractères.
   **Ne jamais ajouter de colonne nominative au mapping**, même présente
   dans le fichier source.
2. **`const EMBEDDED=[]` reste vide.** Le repo est public et déployé sur
   GitHub Pages : y commiter un extrait de données réelles les publie sur
   Internet. Les données réelles n'entrent que par import utilisateur, côté
   navigateur.
3. **Le `motif` est du texte libre** saisi par un agent : il peut contenir un
   nom ou une situation personnelle malgré la troncature. Il est stocké en
   clair dans `localStorage` (`gdin_data_v3`) sur le poste. Acceptable en
   usage local ; à relire avant toute capture, export ou diapo projeté.

Signaler explicitement en réponse tout écart constaté, même si la question
n'a pas été posée.

### Librairies servies depuis le dépôt

Chart.js, Leaflet, SheetJS et les polices sont dans `vendor/` et plus sur
`cdnjs.cloudflare.com` / `fonts.googleapis.com` : un réseau qui filtre les
CDN laissait la page blanche, et Google Fonts transmettait l'IP des
visiteurs. Ne pas réintroduire de `<script src="https://…">` dans le
`<head>` — trois tests e2e (`Boot sans réseau externe`) coupent le réseau
et échouent si ça arrive. Versions et mise à jour : `vendor/README.md`.

Restent externes à l'exécution : les tuiles `basemaps.cartocdn.com` (qui
transmettent aussi l'IP des visiteurs) et `geo.api.gouv.fr`. Appelées après
le boot : sans elles la carte est vide, le reste fonctionne.

### Si un service worker / une PWA est ajouté un jour

Aucun service worker n'existe aujourd'hui (vérifié le 20/09/2026). S'il en
faut un pour l'installabilité :

- **aucun cache** — un handler `fetch` qui ne fait rien suffit ;
- **jamais de `event.respondWith()`** : la requête est ré-émise hors de portée
  des mocks `page.route()` et toute la suite e2e casse sans rapport apparent
  avec la cause ;
- enregistrement sur `load`, en fin de `<body>`, avec un `catch` vide ;
- en PWA installée il n'y a plus de Ctrl+F5 : vérifier les en-têtes
  `Cache-Control` servis sur le HTML avant de conclure.

### Hygiène des instructions et des commentaires

- **Une contrainte formulable en test devient un test, pas un paragraphe.**
  Un `.md` espère être lu ; un test fait échouer la CI. Ce fichier garde le
  *pourquoi* et le nom du test, pas les deux en entier.
- **Dater et qualifier toute affirmation technique** (JJ/MM/AAAA, puis
  *mesuré* — avec la mesure — ou *supposé*). Une mesure qui contredit une
  note existante oblige à corriger la note, pas seulement à la contourner.
- **Budget fermé** : avant d'ajouter une section ici, vérifier qu'elle n'en
  répète pas une autre et supprimer ce qu'elle remplace. Un fichier
  d'instructions qui grossit est moins bien appliqué, pas mieux.
- **Pas de changelog en commentaire** dans `index.html` ou `gdin-pure.js` (« v11.9 : retiré / v11.10 : remis »). Ça appartient à
  `git log`. Reste légitime : la décision en vigueur et la raison qui la rend
  non négociable, surtout si elle est contre-intuitive.

### Posture de travail attendue

- Ne jamais présenter une explication plausible comme un fait : marquer
  « hypothèse non vérifiée » tant qu'aucun log, capture ou test réel ne la
  confirme.
- Ne jamais dire « c'est réparé » ou « c'est en ligne » sans avoir vérifié le
  chemin réel (test exécuté, rendu navigateur, déploiement passé) — pas une
  lecture de code qui « devrait marcher ».
- Sur une demande d'audit ou un bug de calcul, livrer l'audit systématique de
  tous les points d'impact **avant** la première correction.
- Signaler toute déviation d'une consigne ou toute décision de design prise
  seul au moment où elle est prise, jamais en note après coup.
- Utiliser des dates explicites (JJ/MM/AAAA) plutôt que « hier » ou « la
  semaine dernière ».
- En contexte multi-repo, préfixer chaque commande par `cd /chemin/complet &&`.

---

## Pourquoi ces règles

L'utilisateur modifie régulièrement les fichiers directement sur GitHub entre les sessions. Sans `git pull` au démarrage, les modifications locales écrasent silencieusement son travail. L'historique git sert de filet de sécurité.
