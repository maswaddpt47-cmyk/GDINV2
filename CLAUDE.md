# CLAUDE.md — Règles de travail

## Procédure obligatoire avant toute intervention

**Étape 1 — Récupérer les dernières modifications**
```bash
git checkout main
git fetch origin main
git merge --ff-only origin/main
```
Jamais `git pull` (MD-LIB règle 63, décision de l'utilisateur du 17/11/2026) : il
peut fusionner sans le dire. Si `--ff-only` refuse, la branche a divergé :
examiner `git log --oneline --graph main origin/main` avant toute intégration.

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

Le fichier **`gdin-pure.js`** contient les fonctions pures du projet (calculs, parsing, normalisation CMS). Le fichier **`gdin-pure.test.js`** contient plus de 270 tests unitaires (`node:test`) qui les couvrent. Une suite end-to-end Playwright (`tests-e2e.spec.js`, 82 tests) couvre les parcours navigateur.

**Toute nouvelle fonction de calcul, de parsing ou de normalisation va dans `gdin-pure.js` avec ses tests, pas dans le HTML.**

Une session est significative si elle touche à la logique métier (pas une simple correction de typo ou de style).

**Règle :** après toute modification de `gdin-pure.js`, vérifier que les tests passent avant de commiter :

```bash
npm test          # 300 tests unitaires (gdin-pure + deploy + revue-sens)
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

### Revue de sens — ce que les tests ne voient pas

Les tests vérifient des calculs et des états du DOM. Ils ne savent pas ce qu'un
graphe est **censé signifier** : un graphe peut calculer juste et raconter faux,
et aucun d'eux ne le verra. Les trois défauts du 21/09/2026 étaient de cette
famille — une barre unique sous le filtre par défaut, une pastille muette au
doigt, des courbes empilées lues comme des volumes. Tous trouvés à l'œil, aucun
par la suite de tests.

`revue-sens.test.js` encode les règles qui en sont sorties, par lecture du
source, sans navigateur : pas de courbe empilée, pas de titre figé sur un type
d'action que le filtre peut démentir, mention obligatoire sur un graphe qui
ignore les filtres. Ses exceptions sont nommées une par une avec leur raison —
c'est ce qui le garde utile plutôt que bruyant.

**Il ne remplace pas de regarder l'écran.** Avant de livrer un graphe, se poser
les deux questions qu'aucun test ne pose : *qu'est-ce que son titre promet, et
qu'est-ce qu'il montre réellement ?* Une suite verte ne garantit pas que
l'affichage est correct, et ne décharge pas l'utilisateur du contrôle visuel.

### Chiffres diffusés aux élus et à la hiérarchie — Codex avant diffusion

(MD-LIB `chiffres-diffuses.md`, règle 33, 20/10/2026.) Ce tableau de bord
alimente des bilans lus par des élus : avant qu'un chiffre soit donné,
**audit Codex sur l'export réel** (lecture seule, hors dépôt public, modèle
`consigne-audit-externe.md` adapté aux calculs) à la première diffusion, après
tout changement d'import, de fusion, de calcul ou de filtre, et chaque
trimestre — plus le tableau « affiché / recompté / écart » (`npm run audit --
export.xls --suivi ../suivi.json` en fournit les agrégats). Cinq familles de
tests sont obligatoires pour tout indicateur nouveau : parcours complet
idempotent, même population sur tous les écrans, recomptage indépendant,
provenance, unité et dénominateur. 251 tests verts n'ont pas empêché 14 défauts
de calcul : une suite verte ne vaut pas validation.

### Ce que coûte un test

Chaque lancement de la suite e2e coûte du temps et des jetons. Sur ce projet :

- **Suite e2e complète : une seule fois, juste avant le commit.** Jamais à
  chaque étape intermédiaire. Les tests unitaires, eux, tournent en une
  fraction de seconde — les lancer librement.
- **Un ou deux tests ciblés par correctif**, pas quatre à six.
- **La contre-preuve** — celle qui rejoue l'implémentation fautive — est
  réservée aux pièges réellement subtils, ceux qu'on remettrait sans s'en
  apercevoir. Celles déjà en place ne se retirent pas (voir `CHANTIERS.md`).
- **Avant de conclure à une anomalie, éliminer le harnais** : générateur de
  données mal distribué, écran d'accueil non fermé, mauvaise sélection. Trois
  fausses alertes ont été produites ainsi le 21/09/2026. Réutiliser un harnais
  qui a déjà fonctionné plutôt que le réécrire.
- **Le rendu se vérifie à l'œil, le calcul garde son test.** Un changement de
  rendu pur — couleur, libellé, position, CSS, mise en page — ne justifie ni
  test ni capture : dire quoi regarder dans le dashboard déployé et laisser
  l'utilisateur confirmer coûte moins cher et voit mieux. La ligne de partage
  est **rendu / calcul**, pas visible / invisible : une fonction de
  `gdin-pure.js`, un filtre ou un format de données garde son test ciblé,
  parce que l'œil ne contrôle que le cas affiché ce jour-là — une régression
  sur une combinaison de valeurs rare passerait inaperçue. Capture avant/après
  à la demande, pas par défaut.
  **Deux précisions (17/10/2026)** : avant de livrer, *mesurer* le rendu
  (débordement, contraste, chevauchement) à 390 px et 1280x720 — la mesure
  précède le contrôle de l'utilisateur, elle ne le remplace pas ; la fonction
  nouvelle se montre là où il teste (données d'exemple comprises) et la réponse
  dit **où cliquer** en premier.

### AGORA — faire contredire une proposition par une autre session

Deux sessions Claude ne partagent ni conversation, ni mémoire, ni conteneur —
seulement ce dépôt. Elles n'ont pas lu les mêmes fichiers dans le même ordre,
et c'est ce qui rend leurs raisonnements différents. `AGORA.md` à la racine
exploite cet écart : la proposition est déposée dans le dépôt, l'autre session
lit **le vrai code** au lieu d'une reformulation qui porterait déjà le cadrage
et les angles morts de l'auteur.

**Le déclenchement ne repose pas sur un ressenti** : la confiance de Claude est
la plus haute là où il raisonne sur ce qu'il n'a pas vérifié. Soumettre dès
qu'un de ces faits est **constaté**, vérifiable ensuite dans le diff :

Rappel accroché à une habitude qui existe déjà : **toute entrée « décision à
trancher » écrite dans `CHANTIERS.md` est par définition un candidat.** Au
moment de l'écrire, dire pourquoi on ouvre un bloc ou non.

1. la décision ferme une porte — format de stockage `gdin_data_v3`, mapping
   d'import, contrat entre `gdin-pure.js` et `index.html`, nouvelle dépendance
   dans `vendor/` ;
2. deux options envisagées, une seule écrite, sans arbitrage extérieur ;
3. trois itérations sans résolution sur le même problème ;
4. proposition de défaire un existant dont la raison d'être n'est pas retrouvée
   (voir « Décisions à ne pas défaire » dans `CHANTIERS.md`) ;
5. la proposition contredit une note datée du dépôt ;
6. coût irréversible côté usager — perte du `localStorage` d'un poste, rupture
   d'un rapport déjà diffusé, changement de comptage déjà communiqué ;
7. le changement touche un calcul ou un chiffre affiché (indicateur, total,
   taux, filtre, définition ; CR, diapo, export) — **systématique, quelle que
   soit sa taille** (MD-LIB `agora.md` critère 7, 26/10/2026). Contradicteur :
   l'IA de l'autre éditeur (Codex pour un bloc de Claude, Claude pour un bloc de
   Codex, MD-LIB `agora.md` §12). Bloc ouvert avant la correction, définitions métier séparées des
   défauts démontrés et tranchées par l'utilisateur.

**N'y vont pas** : un changement de rendu pur (cf. « Ce que coûte un test »), un
correctif localisé appuyé sur une preuve, tout ce qui se défait en un commit —
**sauf calcul ou chiffre affiché : critère 7, toujours.**

**Soumettre d'office, sans demander l'autorisation**, au moment où le choix est
fait — pas après l'implémentation, sinon le contradicteur hérite d'un biais de
statu quo. **Ne jamais bloquer** : le travail continue, rien ne garantit qu'une
réponse arrive. Le bloc se pousse **directement sur `main`**, immédiatement :
deux sessions sur deux branches ne se voient pas. C'est l'exception assumée à
la règle de branche ci-dessus. Gabarit et règles de réponse : `AGORA.md`.
**Bloc pour Codex : dire « pull » à Codex suffit** (son `AGENTS.md` le fait répondre, MD-LIB `agora.md` §12, 03/11/2026) ; la session qui ouvre le bloc l'annonce quand même à l'utilisateur dès qu'il est en ligne, **sur une ligne à part en tête du message, 🔴 et en gras** : `🔴 **⚖️ AGORA : critère N — <sujet>. Bloc AG-00N publié dans maswaddpt47-cmyk/GDINV2. → Dis « pull » à <Codex ou Claude>.**` (MD-LIB `agora.md` §4, 04/11/2026 : un « pull » noyé dans un compte rendu n'a pas été vu).

**Sécurité, mots de passe, données personnelles : contradicteur Codex**
(OpenAI) au lieu d'une session Claude pour un bloc ouvert par Claude
(06/10/2026) ; un bloc ouvert par Codex est contredit par Claude, dans une autre
session (MD-LIB `agora.md` §12, 16/11/2026). Mode d'emploi : `AGORA.md`.
**Audit Codex** chaque trimestre et après tout changement structurant de
sécurité, avec le modèle MD-LIB `consigne-audit-externe.md` ; chaque point
vérifié dans le code avant d'être retenu, rapport hors dépôt public.

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
peut s'interrompre sans préavis. `scripts/check-chantiers.sh`, lancé au démarrage
par le hook `.claude/hooks/session-start.sh` (17/11/2026), signale quand le ménage
est dû (> 300 lignes ou 30 Ko, en-tête de plus de 7 jours, tâches ✅ ou barrées) ;
il n'échoue jamais.

**Au démarrage, regarder aussi `AGORA.md`** : s'il porte un bloc ouvert sans
réponse, le signaler à l'utilisateur — sans y répondre soi-même si on l'a
ouvert (comparer le trailer `Claude-Session:` du commit du bloc). Rien ne
menait à ce fichier avant le 21/09/2026 : un bloc y restait invisible, et le
dispositif dépendait entièrement de l'utilisateur pour son second temps.

**Ce fichier ne se supprime pas** : il sert aux sessions suivantes, qui ne
reprennent jamais le contexte de la précédente. Ce qui s'efface, ce sont les
**tâches, au fur et à mesure qu'elles sont terminées** — après avoir remonté
dans « Décisions à ne pas défaire » l'invariant ou le piège qui doit survivre.
Le récit de ce qui a été fait appartient à `git log`.

---

## Règles générales adaptées à ce projet

Règles communes de collaboration : MD-LIB/collaboration.md, chargé
automatiquement par MD-LIB/CLAUDE.md (04/11/2026). Ici, seulement ce qui est
propre au projet. Si l'import n'est pas disponible, lire `collaboration.md`
explicitement.

Les sections ci-dessous sont des procédures de MD-LIB (`maswaddpt47-cmyk/MD-LIB`)
réécrites pour GDINV2. Il n'y a **pas de lien automatique** : modifier la source
dans MD-LIB d'abord, puis la répercuter ici à la main.

### Branche imposée par la plateforme

La branche de travail reste `main`. Mais Claude Code sur le web impose parfois
une branche de session (`claude/...`) : dans ce cas, développer dessus puis
**merger dans `main` en fin de session**, sinon rien n'est déployé.

```bash
git checkout main && git merge <branche> --no-ff && git push origin main
```

### Déploiement et cache

`.github/workflows/deploy.yml` publie sur GitHub Pages **au push sur `main`
uniquement**, et seulement si `npm test` (tous les `*.test.js`) et la suite
Playwright passent. Une branche de feature ne déploie rien.

Le workflow injecte `?v=<sha court>` dans les URLs locales d'`index.html`
avant de publier, GitHub Pages ne permettant pas de configurer d'en-tête de
cache. **Ne pas écrire de version dans le fichier source** : elle ne serait
jamais incrémentée. Si le `<head>` est réécrit dans une forme que
l'expression du workflow ne reconnaît plus, le remplacement cesse sans erreur
— `deploy.test.js` verrouille le motif.

**Avant d'écrire « en ligne », « déployé » ou « à recharger »**,
`MD-LIB/outils/attendre-deploiement.sh` doit avoir répondu ✅ pour le commit
poussé (❌ : dire l'échec et corriger ; ⏳ : dire que ce n'est pas fini). Règle
et déclenchement automatique : MD-LIB `deploiement.md` (13/10/2026).

**Diffusion aux agents (demande du DSI, 27/10/2026) : le cloud du CD47 est un
point de dépôt, pas un mode d'exécution.** Testé par l'utilisateur le
28/10/2026 : `index.html` ne s'ouvre pas depuis le cloud, il faut le
télécharger. Parcours unique, comme pour la clé USB : **télécharger, extraire,
ouvrir `index.html` depuis le disque** (`file:///C:/…`), Ctrl+F5 après chaque
mise à jour — en `file://` le `?v=<sha>` ne sert plus. Le dossier déposé porte
**l'application, jamais les données** : un export JSON déposé là devient
lisible par tous ceux qui ont accès au dossier, `motif` en clair compris.
GitHub Pages reste en service tant que son abandon n'est pas décidé (suivi :
`CHANTIERS.md`).

### Livrer les dernières versions pour le cloud du CD47 (demande du 29/10/2026)

L'utilisateur téléverse lui-même sur Nextcloud (Claude n'y a pas accès). **Toute
modification de l'application ou d'un document rattaché** (consigne utilisateurs,
`LISEZ-MOI`, `A-LIRE`, note et synthèse DSI, registres) **se termine par la remise
des dernières versions** : `SendUserFile` des fichiers à téléverser, en disant
lesquels remplacent lesquels, ce qui est à supprimer et pour qui (agents ou DSI
seulement). Le zip de l'application : `scripts/zip-cloud.sh` (après commit).
L'inventaire de ce qui existe, des destinataires et de l'état du dépôt est dans
`GDINV2-BACKUP/INVENTAIRE.md` : **le mettre à jour dans la même livraison**. Ne
jamais écrire « déposé » avant que l'utilisateur l'ait déclaré (*déclaré, non vérifié*).

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
public départemental. Les références CD47 canoniques (archivage, IA, charte
graphique et RGPD/sécurité) sont liées dans `AGENTS.md`. Les garde-fous
suivants sont **déjà dans le code** — les casser est le risque principal du
projet :

1. **Minimisation à l'import.** `parseXlsText()` (gdin-pure.js) et
   `parseXlsxBinary()` (dans `index.html`) ne retiennent aucune identité de
   bénéficiaire : ni nom, ni prénom, ni adresse, ni téléphone, ni date de
   naissance. Champs conservés (relevés dans `parseRows()` le 29/10/2026) :
   n° de demande, dates (demande, action, planifiée, réalisation), commune,
   lieu/CMS et structure orienteur bruts, thématiques, type d'action, conum,
   orienteur, état, urgence, bénéficiaire connu. Le texte libre « motif » est
   exclu du parsing et du CSV. L'import et l'export de fichiers JSON sont
   désactivés ; le stockage interne du navigateur reste actif. **Le n° de
   demande renvoie au dossier source : les données ne sont pas anonymes.**
   Registre RGPD (hors dépôt) : brouillon mis à jour le 29/10/2026, champs
   inconnus et durées laissés vides, à valider par le service et le DPD.
   **Ne jamais ajouter de colonne nominative au mapping**, même présente
   dans le fichier source.
2. **`const EMBEDDED=[]` reste vide.** Le repo est public et déployé sur
   GitHub Pages : y commiter un extrait de données réelles les publie sur
   Internet. Les données réelles n'entrent que par import utilisateur, côté
   navigateur.
3. **Anciennes bases avec `motif`** : ce champ est retiré au chargement et
   nettoyé dans les copies localStorage / IndexedDB sans supprimer de ligne
   ni modifier les rangs ou révisions. Un échec de réécriture reste signalé ;
   les fichiers source et les exports déjà téléchargés ne sont pas modifiés.
4. **Captures et fichiers envoyés aux outils d'IA** (charte IA du CD47 §4,
   06/10/2026) : jamais un export réel ni une capture du dashboard chargé de
   données réelles ; fichier de test anonymisé ou capture recadrée. Une
   capture avec des données réelles se signale en une ligne.

Signaler explicitement en réponse tout écart constaté, même si la question
n'a pas été posée.

### Librairies servies depuis le dépôt

Chart.js, Leaflet, SheetJS et les polices sont dans `vendor/` et plus sur
`cdnjs.cloudflare.com` / `fonts.googleapis.com` : un réseau qui filtre les
CDN laissait la page blanche, et Google Fonts transmettait l'IP des
visiteurs. Ne pas réintroduire de `<script src="https://…">` dans le
`<head>` — trois tests e2e (`Boot sans réseau externe`) coupent le réseau
et échouent si ça arrive. Versions et mise à jour : `vendor/README.md`.

Restent externes à l'exécution, appelées après le boot — sans elles la carte
est vide, le reste fonctionne :

- **les tuiles `tile.openstreetmap.fr/osmfr`** (`TUILES_URL`), libres, sans
  clé, hébergées en UE. CARTO les servait jusqu'au 20/09/2026, date à laquelle
  il a fermé son accès libre : un filigrane « API KEY REQUIRED » a barré les
  deux cartes en production sans qu'une ligne du dépôt ait changé. Trois tests
  e2e refusent désormais une URL contenant `cartocdn`, `apikey` ou
  `access_token` ;
- **`geo.api.gouv.fr`** pour le **nom et le centre** des communes du 47 —
  des points, pas des contours : l'appel demande
  `fields=nom,centre&geometry=centre` (`index.html:4044`, corrigé le
  27/10/2026 ; la note disait « contours », ce que le code ne fait pas).

Les deux reçoivent l'**adresse IP des visiteurs** et la zone regardée — aucune
donnée d'accompagnement ne leur est transmise.

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

### Ce qui s'ajoute aux règles communes

- **Archiver un document : ce dépôt est public** (règle 50) et GitHub Pages
  publie tout le dépôt (`path: '.'`). Un document pour un tiers va dans
  `GDINV2-BACKUP` (privé), et jamais une donnée personnelle, même là. Constat du
  28/10/2026 : un PDF destiné au DSI y aurait été lisible sur Internet.

---

## Pourquoi ces règles

L'utilisateur modifie régulièrement les fichiers directement sur GitHub entre les sessions. Sans actualisation au démarrage (`git fetch` puis `git merge --ff-only`), les modifications locales écrasent silencieusement son travail. L'historique git sert de filet de sécurité.
