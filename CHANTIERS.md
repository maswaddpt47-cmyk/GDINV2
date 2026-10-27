# Chantiers — GDINV2

État au **22/10/2026**, fin de session (changement de compte). Mesures des
audits du 20/10/2026, PR #3, conservées à leur date.

**À faire en premier, dans cet ordre** :
1. Faire contrôler à l'œil par l'utilisateur les **correctifs d'AG-004**
   (`6b77162`, premier chantier ci-dessous), puis établir avec lui le
   **tableau « affiché / recompté / écart »** sur son export. Aucun chiffre
   concerné n'est « vérifié » avant ce tableau.
2. Contrôler à l'œil la **mention de révisabilité**, déjà en ligne (deuxième
   chantier).

**Hors dépôt, pour l'utilisateur seul** : les deux questions au référent
archives et au DPO — où les dossiers de bilan sont déposés, combien de temps
ils sont conservés. Elles bloquent le volet B d'AG-002 et rien d'autre.

**Ce qu'aucune session suivante ne doit refaire** : relancer un audit Codex sur
AG-003 (clos), ni rouvrir la mise à jour SheetJS (faite, 0.20.3 vendorisée).

Ce fichier existe pour qu'une session qui démarre sans historique sache où en
est le projet. **Il ne se supprime pas.** Ce qui s'efface, ce sont les tâches,
au fur et à mesure qu'elles sont terminées — après avoir remonté dans
« Décisions à ne pas défaire » l'invariant ou le piège qui doit survivre. Le
récit de ce qui a été fait appartient à `git log`, dont les messages portent
les mesures.

Règles permanentes : `CLAUDE.md`.

## Comment reprendre

```bash
npm test                      # 318 tests unitaires · 82 e2e (npx playwright test)
npm run audit -- export.xls [--suivi ../suivi.json]   # parcours réel : lues, exclues, retenues, fusionnées, réimport
```

L'export n'est pas dans le dépôt (données personnelles) : le redemander à
l'utilisateur. **Seul le dernier export fourni fait foi** — ne pas rouvrir de
comparaison avec un fichier antérieur. Référence actuelle : septembre 2026,
24 410 lignes, 4 184 exclues (cycle Pass), 20 226 retenues, 7 271 demandes
distinctes, **20 226 en base après fusion** (19 290 avant le 20/10/2026 : 76
demandes perdues par l'ancienne clé), 5 478 participations d'atelier pour 596
séances (mesuré le 20/10/2026, `audit-export.js`).

## Chantiers ouverts

- **CHANGEMENT D'USAGE (27/10/2026) : le tableau de bord sera consulté en
  local**, depuis une copie sur poste ou clé USB, et plus seulement par
  GitHub Pages. Trois conséquences, à garder en tête avant toute évolution :
  - **`geo.api.gouv.fr` et les tuiles fonctionnent en `file://`** — vérifié
    par l'utilisateur le 27/10/2026 sur Chrome, copie locale extraite : aucune
    erreur CORS en console, fond de carte affiché, **268 communes placées**
    (bien au-delà des 112 en dur de `COMMUNE_COORDS`). L'API renvoie donc
    `Access-Control-Allow-Origin: *`. La crainte inverse, notée à l'ouverture
    de ce chantier, est levée : le fond vectoriel (AG-005) reste un choix de
    confidentialité et d'autonomie hors réseau, **pas une nécessité technique**.
  - **Le ZIP doit être EXTRAIT avant d'ouvrir `index.html`.** Ouvert depuis
    l'intérieur du zip, Windows n'extrait que ce fichier : `vendor/` et
    `gdin-pure.js` manquent, six `ERR_FILE_NOT_FOUND` et « parseXlsText is not
    defined » s'affichent. Constaté le 27/10/2026. Un
    `A-LIRE-AVANT-D-OUVRIR.txt` est désormais à la racine de l'archive.
  - **Pas de `?v=<sha>` en local** : le cache-busting vient du workflow de
    déploiement. Après remplacement du fichier sur une clé, un navigateur peut
    resservir l'ancienne version — Ctrl+F5 obligatoire.
  - **La CSP est la seule protection embarquée** hors serveur. Vérifiée en
    `file://` et en production sur Chrome et Edge.

- **Faille d'injection par `lieu_raw` — CORRIGÉE le 27/10/2026** (`949d2dd`,
  déployé vert). Trouvée par Codex dans AG-005. Ne pas défaire : les trois
  interpolations de `renderHeatmapAteliers()` passent par `esc()`, et le jeu du
  test « contenu importé hostile » contient des ateliers — sans eux la fonction
  sort avant son `innerHTML` et le test valide du code vulnérable.
- **Politique de sécurité du contenu — POSÉE le 27/10/2026** (`b9d1fbd`,
  déployée verte), sur proposition de Codex dans AG-005. `img-src` et
  `connect-src` énumèrent les seules destinations autorisées : une requête
  vers un tiers n'est plus émise, ce qui coupe le chemin d'exfiltration
  démontré. Ne pas défaire, et **ne jamais y remettre `*` ni `https:` en bloc**
  — un test e2e le refuse, ainsi que l'absence de la balise.
  **Limite assumée** : `'unsafe-inline'` reste nécessaire (2 blocs `<script>`,
  83 `onclick=`), donc la CSP n'empêche pas l'exécution d'un code injecté,
  seulement son émission. Supprimer `'unsafe-inline'` demanderait de sortir
  tout le JS du fichier : hors proportion tant que l'échappement tient.
  Mesuré : n'empêche pas le chargement en `file://` (Chromium), la clé USB
  fonctionne avec. **Vérifiée en production le 27/10/2026 par l'utilisateur**,
  sur Chrome, dans la console du dashboard déployé : une requête image vers un
  tiers renvoie « violates the following Content Security Policy directive…
  The action has been blocked ». Non testé sous Firefox ni Edge.
  Manipulation reproductible, utile si la DSI veut le constater elle-même :
  F12 → Console → `allow pasting` → `new Image().src='https://exemple.com/x.png'`.

- **AG-005 — carte vectorielle, zéro appel externe** (ouvert le 27/10/2026,
  `80b4071`). **Réponse de Codex, session B, le 27/10/2026 : amendé**
  (`a82f95b`, code examiné `c6c7dbe`, preuves dans `AGORA.md`). Un lieu importé
  est inséré sans échappement dans la heatmap Ateliers : exécution de script,
  lecture d'une valeur fictive de la base et requête image contenant cette
  valeur reproduites en HTTP, requête interceptée sans envoi externe. **Cela
  contredit l'assurance d'impossibilité de sortie ; aucune fuite passée n'est
  établie.** Les tuiles du Rapport révèlent aussi une emprise dépendant des
  communes filtrées. Priorité proposée : corriger ce rendu et couvrir un vrai
  atelier hostile dans le test existant, qui n'en contient pas. Le vectoriel
  ne corrige pas cette faille ; fond local minimal recommandé sous réserve de
  l'usage, avec centres locaux partagés, licence et fonctionnement USB à
  vérifier. **Arbitrage utilisateur toujours attendu, aucun correctif ni
  changement de carte implémenté.** 318 tests unitaires passent ; essais
  navigateur ciblés exécutés, suite e2e inchangée bloquée ici par la politique
  Chromium sur `file://`. La note DSI remise par l'autre session le
  27/10/2026 (hors dépôt) doit être rectifiée ; ni accès à cette note ni envoi
  effectué par la session B.
- **Usage sur clé USB** : mesuré le 27/10/2026, l'application tourne en
  `file://` sous Chromium (`localStorage` OK, IndexedDB ouvrable, aucune erreur
  JS). 1,9 Mo à copier (`index.html`, `gdin-pure.js`, `vendor/`). Piège à
  retenir : le stockage appartient au **navigateur du poste**, pas à la clé —
  les données ne suivent pas d'un poste à l'autre, le transport passe par
  l'export JSON. Non vérifié : l'appel `geo.api.gouv.fr` depuis une origine
  `file://` (CORS probablement refusé).

- **AG-004 — correctifs appliqués le 22/10/2026 (`6b77162`), recomptage à
  faire.** Décisions de l'utilisateur sur les propositions de Codex (détail
  dans `AGORA.md`) : réactivité **par demande**, pourcentages de thématiques
  en **part de tous les accompagnements** (sans thématique compris),
  correctifs de libellé appliqués. 318 tests unitaires et 82 e2e passent.
  Reste :
  - **Contrôle visuel** après Ctrl+F5 : Rapport et Diapo Rapport d'un
    conseiller × CMS (KPI réactivité « X/N demandes calculables · M sans
    contact renseigné », phrase de conclusion, diapositive Thématiques,
    diapositive Fiabilité « Résultats des contrôles ») ; onglet Territoire
    (« Top 3 : X % des accompagnements »).
  - **Tableau « affiché / recompté / écart »** : tableau croisé dynamique
    Excel sur l'export source, comparé aux 11 diapositives du Diapo Rapport
    pour la période et le couple conseiller × CMS projetés. C'est la seule
    preuve d'exactitude ; les correctifs n'en sont pas une (Codex).
  - **Non traité, à proposer** : le graphe en anneau des thématiques du
    Territoire (`index.html`, `ch-terr-thema`) découpe un cercle en parts
    qui se chevauchent (une ligne à deux thématiques est dans deux parts) ;
    un anneau promet un tout. Barres horizontales à proposer à l'utilisateur.
  - Les chiffres de réactivité et de fiabilité déjà projetés avant
    `6b77162` ne sont plus comparables : signalé à l'utilisateur.

- **Contrôle visuel de la mention de révisabilité** (posée le 22/10/2026,
  `3280ec2`). **En ligne** : déploiement de `89391f7` vérifié vert le
  22/10/2026 (`c93dee9`, poussé après, ne touche que ce fichier). Reste le
  contrôle à l'œil, après un Ctrl+F5, dans cet ordre : bandeau gris au-dessus des KPI de la Vue globale,
  sous-titre du Rapport après avoir choisi un conseiller et un CMS, pied de la
  première diapositive du Diapo Rapport (c'est elle qui part en PDF). Sur les
  données de démonstration la mention dit « source non datée » — voulu, pas un
  défaut : la date vient de `importMeta.date`, absent sans import.

- **À porter à MD-LIB** (deux constats de la session du 22/10/2026, propagation
  à demander à l'utilisateur) :
  - `outils/attendre-deploiement.sh` attend `[dossier] [branche]`, pas un sha.
    Lancé avec un sha il fait `cd <sha>`, échoue — et **sort tout de même 0**,
    avec pour seule trace un message sur stderr. Une session pressée lit le
    code 0 comme un déploiement vert. Le `cd` doit faire sortir le script en
    erreur. Constaté en réel ce jour (`deploiement.md`).
  - Le ✅ d'un déploiement **porte sur un sha, pas sur une session**. Annoncer
    « en ligne » sans nommer le commit laisse croire que le travail poussé
    ensuite l'est aussi. Nommer le sha dans l'annonce.

- **AG-002 — archivage des bilans diffusés** (volet A fait le 22/10/2026,
  volet B en attente). La mention « chiffres susceptibles d'être révisés »,
  avec la période et la date du dernier import, est posée sur la Vue globale,
  le sous-titre du Rapport et la couverture du Diapo Rapport
  (`mentionRevisabilite()`, `gdin-pure.js`, 13 tests). Elle prévient, elle
  n'archive rien.
  **Volet B — bloqué sur une question qui n'est pas technique** : reproduire un
  bilan déjà diffusé demande de conserver ses données, ses filtres et sa
  version de calcul. L'export JSON actuel ne porte ni les filtres de lecture,
  ni la version (le `?v=<sha>` du workflow n'est lisible par aucune variable
  JS), ni la date d'import. Avant d'écrire une ligne, deux réponses à obtenir
  auprès du référent archives et du DPO : **où** ces dossiers sont déposés
  (hors dépôt public, et le `motif` peut contenir un nom malgré la troncature)
  et **combien de temps** ils sont conservés — la durée doit figurer au tableau
  de gestion et toute élimination passe par le visa des Archives
  départementales, purge automatique comprise (MD-LIB `archivage-cd47.md`).
  Sans ces réponses, l'archivage créerait un stock de données personnelles non
  déclaré. Le volet C (mode « arrêté au ») en dépend entièrement.
  Reste aussi non vérifiée : la cause des écarts réels constatés sur l'export
  (7 881 → 8 313 à période identique).
- **À trancher par l'utilisateur** (ne pas décider seul) :
  - **103 lignes strictement identiques** sur tous les champs conservés (hors
    ateliers, mesuré le 20/10/2026) : gardées et signalées par le panneau
    qualité ; un doublon de saisie ou deux séances le même jour, la source ne
    permet pas de le dire.
  - **Taux de demandes closes** : le taux affiché est un taux d'*accompagnements*
    réalisés (lignes). Un taux par demande demande une règle pour les demandes
    à plusieurs actions.
- **Validation sur poste** : le rendu (badges, tableau États à 9 colonnes,
  regroupement « Autres structures », libellé de réactivité) se contrôle sur le
  site déployé.
- **Bases déjà présentes sur les postes** : conservées, complétées (rangs
  reconstitués dans l'ordre de la base), marquées `base_heritee` ; la
  provenance du conseiller y est « inconnue » sauf déduction connue. Elles sont
  incomplètes (demandes fusionnées à tort). Un import dans une telle base
  propose de la remplacer ; la reconstruction fiable = « Réinitialiser et
  importer » l'export source, puis comparer les comptes (20 226 pour
  septembre 2026).

## À porter aux développeurs de l'outil de saisie

Par gain décroissant. L'encodage a été signalé le 20/09/2026.

| Action à la source | Gain mesuré |
|---|---|
| Rendre « Conseiller numérique » obligatoire | supprime 40,4 % d'attributions déduites |
| Identifiant de séance d'atelier, ou champ « nombre de participants » | rend le comptage des ateliers défendable sans contourner la minimisation |
| Liste déroulante pour « Lieu / CMS » | supprime les 3,2 % de « Autre structure » et la dérive continue |
| Liste déroulante communes (référentiel INSEE) | supprime les 2 % hors référentiel |
| Thématique obligatoire | comble 22,9 % de trous |
| Contrôle de cohérence des dates à la saisie | supprime les 7,2 % d'incohérences chronologiques |
| ~~Corriger l'encodage de « Date action »~~ | signalé le 20/09/2026 |
| Rendre « Urgence » fiable (consigne de saisie, ou champ retiré) | 101 urgences en 2024, 5 en 2025, 0 en 2026 : la case n'est plus cochée depuis août 2024 |

## Décisions à ne pas défaire

**Identité, provenance, stockage, populations (20/10/2026, audits Codex)**

- **Identité d'une ligne** (`cleFusion`, `cleBaseAction`, gdin-pure.js) : N°
  demande + types + date d'action + CMS + rang de répétition. Elle exclut le
  conseiller (déduit après la fusion : l'ancienne clé le contenait, d'où 2 → 3 →
  4 lignes à chaque réimport), l'état et les dates de planification et de
  réalisation, mis à jour par `fusionnerImport()`. Limites : une date d'action
  corrigée à la source crée une nouvelle ligne ; le rang suppose le même ordre
  de lignes d'un export à l'autre. L'export n'a pas d'identifiant d'action.
- **Provenance du conseiller** : `conum_origine` = source | referent | deduit |
  inconnu. `attribuerConum()` est idempotent et ne remet jamais `conum_deduit`
  à faux au seul motif que le nom est rempli. Les majoritaires par secteur ne
  s'appuient que sur source et referent. « Inconnu » compte dans la marge de
  l'onglet Fiabilité.
- **Sauvegarde** : un instantané `{schema, rev, records, meta}` (`gdin_snap_v4`)
  dans localStorage ET IndexedDB ; au démarrage la révision la plus récente
  gagne. Écritures en file, invalidées par la réinitialisation (`_storageEpoch`) ;
  `_idbDel` attend `oncomplete`. Ne pas supprimer l'ancienne copie avant le
  succès de la nouvelle.
- **JSON importé** : validé en entier (`validerSauvegardeJSON`), reconstruit
  champ par champ ; une ligne invalide rejette le fichier, la base active reste
  intacte. « Réinitialiser et importer » est un paramètre de l'opération
  (`pendingData.reset`), jamais une variable globale.
- **États** : `categorieEtat()` → realisee | non_realisee | en_attente |
  autre. « En cours » de la source est normalisé en « En attente ». Aucun écran
  ne compte `=== 'En cours'`.
- **Réactivité** rattachée à la même demande (`deriverActions`), jamais à
  conseiller + CMS + date ; sans contact valide, le cas est compté « sans
  contact ». **Le taux 48 h compte des demandes** (`delaisParDemande`, seuil
  de 20 demandes, AG-004, décision de l'utilisateur du 22/10/2026) : par
  accompagnement, une demande à 20 accompagnements pesait 20 fois. « 48 h » =
  au plus 2 jours ouvrés, fériés non retirés : ne jamais écrire « délai
  réglementaire ». Les actions dérivées gardent `jour` (filtre) et `date` (mois,
  graphiques) ; ne jamais comparer des mois pour filtrer une période.
- **Taux de réalisation** = lignes à l'état Réalisée sur les lignes, jamais la
  présence de `date_action`. **Comparaison N/N−1** à même date, avec le type
  du filtre (`evolutionAnnuelle`, `filtrerParType`).
- **Un seul aiguillage des diapositives du Rapport** : `drRenderSlide()`,
  appelé par la navigation et par l'export PDF. Le conteneur `#diapo-overlay`
  du Diapo Global doit exister (il manquait : le bouton plantait) ; l'export PDF
  ne doit jamais faire `options.animation = options.animation || {}` (proxy
  Chart.js, « Maximum call stack »).
- **Tout texte importé est échappé** à l'insertion (`esc()`), `conumClass()`
  assainit le nom de classe. Un e2e injecte du HTML dans tous les champs et
  parcourt les onglets et les deux diaporamas.
- **Les chiffres diffusés passent par Codex avant d'être donnés** aux élus ou à
  la hiérarchie : MD-LIB `chiffres-diffuses.md` (règle 33 de `collaboration.md`).
  251 tests verts n'ont pas empêché 14 défauts de calcul sur le fichier réel.
- **Une valeur de thématique compte des lignes** (AG-004, décision de
  l'utilisateur du 22/10/2026, remplace la règle « mentions » d'AG-003) :
  `countThemas()` compte une thématique une fois par ligne ; son pourcentage
  se rapporte à **toutes** les lignes, sans thématique comprises (« % des
  accompagnements »). La **somme** des valeurs dépasse le nombre de lignes :
  un Top 3 se compte en union (`lignesAvecThemas`), jamais en additionnant.
  Jamais « demandes » : aucune déduplication par N° de demande.
- **Fiabilité** (AG-004) : la marge d'un indicateur se rapporte à sa propre
  population (les doublons d'un type aux lignes de ce type), et chaque constat
  la nomme. « Solide » = moins de 1 % de défauts *détectés* : jamais
  « chiffres exacts », jamais « aucun défaut » s'il y en a un.

**Noms d'agents**

- **Aucun nom d'agent dans le code source**, et aucune exclusion par nom : elle
  publierait ce nom et se périmerait d'elle-même. Le dépôt est public et
  indexable : une publication sans finalité ne se justifie pas au regard de la
  minimisation. Le rattachement CMS → conseiller, la liste des conseillers et
  leurs couleurs sont dérivés des données.
- **L'attribution se dérive par année**, jamais globalement : les affectations
  changent, et un mapping figé réécrit rétroactivement cinq ans d'historique.

**Import et fusion**

- **Un seul parseur.** `parseRows()` porte le mapping pour tous les chemins.
  Il en existait deux, qui divergeaient de 26 % sur le même fichier. Ne jamais
  recopier le mapping ailleurs.
- **Clé de fusion des ateliers** : `atl:<N° demande>|<date action>|p:<rang>`.
  La clé générique ne porte pas le N° de demande et fait entrer deux séances
  en collision. Sans le rang, 78 % des participations étaient supprimées à
  l'import.
- **`demojibakeUtf16()`** répare l'encodage UTF-16 de « Date action », cassée
  sur 100 % des lignes. Ne pas l'assouplir : elle ne décode que si toute la
  chaîne est dans le plan supérieur Unicode et que le résultat est de l'ASCII
  imprimable. Elle pourra être retirée le jour où un export complet n'affiche
  plus aucune cellule réparée — pas avant.
- **Cycle Pass écarté par type d'action**, jamais par nom de structure : UNA 47
  porte 969 lignes du cycle et 30 d'activité réelle.
- **Communes : référentiel officiel**, pas de rapprochement par ressemblance.
  Brax et Bias, Layrac et Clairac sont à deux caractères l'un de l'autre ; un
  prototype sans référentiel rattachait Donzac à Dondas, sans alerte.
- **`normCms()` : le mapping explicite d'abord**, la clé souple en dernier
  recours seulement. Un test vérifie qu'aucune clé souple ne désigne deux
  lieux.
- **`Villeneuve sur Lot` saisi comme lieu reste en « Autre structure »** : ce
  ne sont pas les ateliers de l'utilisateur. Un test le verrouille.

**Comptages et affichage**

- **Une ligne d'atelier est une participation, pas un atelier.** Toujours
  afficher les deux : 596 séances pour 5 478 participations.
- **Les participants d'une séance ne sont pas des doublons.** Le nom du
  bénéficiaire n'entre pas dans l'application (minimisation RGPD), rien ne les
  distingue : le dashboard s'abstient plutôt que d'accuser à tort. Les compter
  faisait annoncer 25 % de doublons là où il y en a 0,1 %.
- **Ne pas fonder d'indicateur sur `!r.date_action`** : la colonne est
  renseignée à 100 %, la valeur serait constante. Le taux de réalisation, lui,
  varie de 38 % à 83 %.
- **Un filtre par défaut peut vider un graphe sans que rien ne le signale.**
  `typeFilter` vaut « Accompagnement » à l'ouverture : les deux graphes de
  types d'action, alimentés par `getFiltered()`, n'affichaient qu'une barre —
  déjà le KPI principal. Ils lisent `getFilteredSansType()`. Audit systématique
  du 21/09/2026 : les 36 autres graphes, listes et tables de neuf onglets ont
  été relevés sous filtre par défaut puis filtre levé, aucun autre n'est
  concerné. Ateliers, États et Territoire sont indépendants du type par
  construction.
- **L'axe d'une courbe d'évolution vient de la période, pas des données.**
  `moisDeLaPeriode()` : un mois sans activité s'affiche à zéro au lieu de
  disparaître. Sans cela deux points voisins à l'écran pouvaient être séparés
  de plusieurs mois réels — 10 points pour 36 mois sur un Rapport mesuré le
  21/09/2026. Appliqué au Rapport et au slide « Non réalisés » ; le slide
  « Évolution » trace déjà 12 mois calendaires. Les autres écrans ne sont pas
  concernés, leur volume remplit tous les mois.
- **`countEntries()` pour tout classement affiché**, jamais `count()` : les
  clés entières d'un objet JavaScript repassent en tête et « 47 » s'affichait
  devant Agen.
- **Ne pas revenir à `indexOf()`** pour compter les doublons : 1 547 ms contre
  3 ms, le coût croît au carré.
- **L'onglet États ne suit pas le filtre de type**, comme l'onglet Fiabilité :
  `ACTIONS_DATA` ne porte que des accompagnements, appliquer le type viderait
  l'écran dès que « Atelier » est choisi. Un test e2e le verrouille.
- **Un seul jeu de filtres par écran.** Le bloc d'états a vécu dans l'onglet
  Import avec ses propres listes année / CMS / conseiller : il pouvait afficher
  2024 pendant que le reste du tableau de bord affichait 2026, sans alerte. Ne
  pas réintroduire de filtres locaux sur un écran qui porte les mêmes données
  que les autres ; un test vérifie qu'aucun ne revient.
- **Un test de contenu ne prouve pas l'affichage.** Les premiers tests de
  l'onglet États vérifiaient les tables mais pas la visibilité du panneau : ils
  seraient passés sur un écran resté masqué. Le test « le panneau devient
  réellement visible » comble ce trou — ne pas le retirer.
- **Les courbes ne s'empilent pas, les barres peuvent.** « Volume par CMS »
  était en aires empilées : la courbe du haut valait le total des six CMS et
  non le volume du sien, et toutes reprenaient la forme du total. Dans une
  barre segmentée le découpage reste visible ; dans une courbe, la hauteur se
  lit comme une valeur. `revue-sens.test.js` refuse le retour de l'empilement
  sur un graphe en lignes.
- **Un titre ne fige pas un type d'action** que le filtre peut démentir :
  `libelleLignes()` rend « Accompagnements par CMS » et « Accompagnements
  N/N-1/N-2 », qui mentaient sous le filtre « Atelier ». Même test.
- **`ACTIONS_DATA` est dérivé de `DATA`**, pas importé séparément
  (index.html, `DATA.forEach` sur `type_action` commençant par
  « accompagnement » et `cms` non vide), et il y ajoute `delai_reactivite`
  et `delai_total`. Il alimente la Vue globale, le Rapport, le Bilan, le
  Diapo Global et le Diapo Rapport : **ne pas le supprimer** en croyant
  nettoyer l'onglet Import.
- **La synthèse de fiabilité ne se réduit pas au pire indicateur** : afficher
  « faible » quand quatre indicateurs sur neuf sont exacts décrédibilise ce qui
  est solide. Elle nomme le plus sensible.
- **`defautsSaisie()` utilise deux dénominateurs** — base pour les défauts
  constatés, lignes lues ou retenues pour ceux issus de l'import. Les mélanger
  affichait 104,9 % sur une colonne réparée à 100 %.
- **Aucune marge affichée ne doit être estimée.** Toutes viennent de
  `indicateursFiabilite()`, recalculées depuis le fichier importé.

**AGORA**

- **AGORA a servi une fois, et ça a marché** (AG-001, 21/09/2026). Une seconde
  session, sans accès à MD-LIB, a confirmé le fond, infirmé un argument et
  trouvé un défaut que l'auteur n'avait pas vu. L'auto-suffisance d'`AGORA.md`
  + `CLAUDE.md` est donc **éprouvée, pas supposée** : trois règles hors gabarit
  ont réellement servi à répondre. Ne pas réduire `AGORA.md` au seul gabarit.
- **Le trailer `Claude-Session:` distingue deux sessions**, même sous une
  identité GitHub unique — c'est lui qui vérifie qu'on ne répond pas à son
  propre bloc, pas le champ `Auteur`, qui n'est qu'un libellé oral. Quand le
  trailer manque, demander.
- **Un bloc ouvert est invisible si rien n'y mène.** `CLAUDE.md` envoyait une
  session qui démarre vers `CHANTIERS.md` et lui seul ; `AGORA.md` est
  désormais cité dans « Où en est le projet ». Le point faible du dispositif
  joue des deux côtés : Claude oublie de soumettre, et oublie de répondre.

**Dépendances externes et affichage**

- **Le fond de carte ne doit dépendre d'aucune clé.** CARTO a fermé l'accès
  libre à ses tuiles le 20/09/2026 : un filigrane « API KEY REQUIRED » barrait
  les deux cartes en production, sans qu'une ligne du dépôt ait changé. Source
  actuelle : OpenStreetMap France, libre et hébergé en UE. `TUILES_URL` et
  `TUILES_ATTRIB` sont partagées par les deux cartes — elles déclaraient
  chacune la leur, l'une pouvait casser sans l'autre. Trois tests e2e refusent
  une URL contenant `cartocdn`, `apikey` ou `access_token`.
- **Les options des `<select>` ont besoin d'un fond opaque écrit en dur.** Le
  menu natif s'ouvre hors de la page, sur un fond système blanc : sans fond
  explicite, les options héritent du `color` clair du select et deviennent
  invisibles — la liste paraît vide alors qu'elle est peuplée. Les variables de
  thème sont translucides et ne conviennent pas. Des tests e2e mesurent le
  contraste réel dans les deux thèmes.
- **Ce que le réseau de développement ne permet pas de vérifier.** Le proxy
  filtre cdnjs, geo.api.gouv.fr et les serveurs de tuiles. Le rendu réel d'un
  fond de carte ne peut donc pas être constaté ici : il se vérifie sur le site
  déployé, jamais par lecture de code.

**Structure**

- **Un seul dashboard.** `index.html`. Une variante à essayer se fait sur une
  branche, jamais dans un fichier parallèle.
- **Pas de `<script src="https://…">`** dans le `<head>` : sans accès au CDN la
  page restait blanche. Trois tests e2e coupent le réseau et échouent si ça
  revient. Versions : `vendor/README.md`.
- **Pas de version écrite en dur dans le source** : `?v=<sha>` est injecté au
  déploiement, `deploy.test.js` verrouille le motif.
- **Les tests de minimisation RGPD** (`parseRows — minimisation RGPD`)
  empêchent un champ nominatif d'entrer dans l'application. Ne jamais les
  désactiver pour faire passer un commit.
- **Ne pas retirer les contre-preuves** des tests e2e (`Garde-fous IndexedDB`,
  `Classement des communes`) : elles rejouent l'implémentation fautive et sans
  elles les autres tests passeraient même si le correctif disparaissait.

**Mesurer l'application, pas son instrument**

- **Ne jamais conclure à une anomalie sans avoir éliminé le jeu de test.** Un
  audit du 21/09/2026 a signalé « un seul conseiller sur 262 lignes » puis
  « graphes du Rapport à une seule valeur » : les deux venaient du harnais, pas
  du code. Le générateur pseudo-aléatoire était un LCG lu en `seed % n`, dont
  les bits de poids faible se corrèlent — il ne produisait que quatre CMS sur
  six et presque toujours le même conseiller ; et la combinaison du Rapport
  avait été choisie par `selectedIndex=1`, qui tombait sur un couple à un seul
  dossier. Pour un jeu synthétique, utiliser un générateur à bits de poids fort
  (mulberry32) et vérifier sa distribution avant de l'exploiter ; pour le
  Rapport, sélectionner la combinaison la plus fournie, jamais la première.
- **Une capture ne vaut que si l'écran capturé est celui qu'on croit.** Deux
  captures de l'onglet États ont montré le diaporama et l'écran d'accueil.
  Fermer le *landing* par `.lo-btn` comme le font les tests e2e, et vérifier
  dans la même passe que le panneau visé est bien le seul `.panel.active`.

**Limites connues, à assumer plutôt qu'à masquer**

- **Pas de KPI « Urgences »** (retiré le 23/09/2026). Le champ est toujours
  importé, mais la saisie s'est effondrée en août 2024 (mesuré sur l'export du
  21/09/2026). Ne le réafficher que si un nouvel export montre une saisie
  régulière.

- **Rupture d'historique au 20/09/2026.** Jusqu'à cette date, 2 853 lignes
  étaient attribuées au conseiller en poste aujourd'hui sur un secteur, et non
  à celui qui l'occupait à l'époque — principalement Tonneins, Nérac, Antenne
  Aiguillon et Agen Tapie. Corrigé depuis. Un bilan individuel antérieur au
  20/09/2026 ne se compare donc pas à un bilan tiré après : l'écart vient de
  la correction, pas de l'activité.
- **L'onglet Fiabilité est validé en l'état** (20/09/2026). Trois choix y sont
  délibérés et ne se défont pas sans raison mesurée : la synthèse nomme
  l'indicateur le plus sensible au lieu de résumer au pire, « Ateliers »
  s'affiche sans marge parce que séances et participations sont une
  reformulation et non une incertitude, et la marge de 40,4 % porte sur
  l'attribution individuelle, jamais sur le volume d'activité.
- **L'attribution par conseiller est déduite à 40,4 %** : `comblerConum()`
  applique d'abord le référent constaté, `applyConumAttrib()` comble le reste
  depuis le secteur — le conseiller majoritaire de ce secteur pour l'année
  concernée, donc un changement d'affectation ne réécrit plus l'historique,
  mais cela reste une inférence. Le bandeau de
  l'onglet Fiabilité est la réponse retenue — ne pas présenter ces chiffres
  comme une mesure individuelle.
- **La saisie reste du texte libre.** Les trois mécanismes de rattrapage
  (lieux, communes, conseiller) sont des filets, pas une solution : elle se
  joue à la source.
- **Préfixes de service devant un CMS non reconnus** (`CIP - CMS
  Villeneuve/Lot`, `DSIAN / CMS Villeneuve-Fumel`…) : 39 lignes en « Autre
  structure ». Le libellé nu `CMS Marmande` n'est pas non plus une clé du
  mapping. Volume faible, non corrigé.

## Pistes d'amélioration

Consigne renforcée et propagation approuvée par l'utilisateur le 25/10/2026 :
initiative dès l'analyse, recommandations argumentées et examen de la pertinence
de l'existant. Règle 22 de MD-LIB copiée dans `CLAUDE.md` ; ce registre garde
les pistes et les décisions, sans reproposer une piste écartée sans fait nouveau.

**Proposées, en attente**
_(aucune)_

**Écartées** (date — piste — raison)
_(aucune)_
