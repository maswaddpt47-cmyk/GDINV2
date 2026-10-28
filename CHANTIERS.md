# Chantiers — GDINV2

État au **28/10/2026** (mesures des audits du 20/10/2026 à leur date). Ménages
des 27 et 28/10/2026 : le fait, et ce que dit déjà `CLAUDE.md`, sont retirés ;
les décisions resserrées. Texte complet : `git log -p CHANTIERS.md`.

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

Règles permanentes, et pourquoi ce fichier ne se supprime pas : `CLAUDE.md`.

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

- **CHANGEMENT DE DIFFUSION (27/10/2026, demande du DSI) : deux modes, et
  aucun des deux n'est un serveur web.**
  Le tableau de bord sera déposé sur le **cloud du CD47 — un espace de
  stockage de fichiers, type Drive, pas un hébergement web** — et/ou
  téléchargé puis exécuté depuis le disque du poste. GitHub Pages a vocation
  à ne plus être la voie de diffusion.
  - **Conséquence : le `?v=<sha court>` n'a plus d'objet.** Il est injecté par
    `.github/workflows/deploy.yml` pour GitHub Pages, et ne sert qu'à
    contourner l'impossibilité d'y configurer des en-têtes. Sans serveur, il
    n'y a ni en-tête à poser ni adresse à versionner : **c'est le Ctrl+F5
    après mise à jour qui règle le cache**, dans les deux modes.
  - **Testé par l'utilisateur le 28/10/2026 : `index.html` ne s'ouvre pas
    depuis le cloud, il faut le télécharger.** Le cloud du CD47 est donc un
    **point de dépôt**, pas un mode d'exécution : on télécharge, on extrait,
    on ouvre depuis le disque — le même parcours que la clé USB ou le zip,
    avec les mêmes règles (extraire avant d'ouvrir, Ctrl+F5 après mise à
    jour, stockage propre au navigateur du poste). **Pas testé** : un dossier
    synchronisé sur le poste (s'il existe pour ce cloud), qui éviterait le
    téléchargement à chaque mise à jour. *Supposé* : un dossier téléchargé
    depuis un drive arrive souvent en `.zip` — dans ce cas l'extraction est
    obligatoire, sinon les `ERR_FILE_NOT_FOUND` du 27/10/2026 reviennent.
  - **Risque propre au drive, à cadrer** : un espace partagé diffuse ce qu'on
    y dépose. Si un agent y place un export JSON pour « sauvegarder » ou
    « partager », les données d'accompagnement — motif en clair compris —
    deviennent lisibles par tous ceux qui ont accès au dossier. Sur une clé le
    risque était la perte ; ici c'est la diffusion silencieuse. **Le dossier
    partagé porte l'application, jamais les données.**
  - **Les documents remis au DSI** (synthèse et note consolidée du
    27/10/2026, hors dépôt) décrivent encore ce mode comme un « hébergement
    interne ». **Test fait : à reformuler** en « dépôt sur le cloud,
    téléchargement et ouverture locale ».
  - **`deploy.yml` et `deploy.test.js` sont à revoir ensemble** le jour où
    GitHub Pages est abandonné : le premier publie sur Pages, le second
    verrouille le motif de réécriture du `<head>` qui n'aurait plus d'objet.
  Les conséquences déjà constatées du mode local :
  - **`geo.api.gouv.fr` et les tuiles fonctionnent en `file://`** (vérifié par
    l'utilisateur le 27/10/2026, Chrome : pas d'erreur CORS, 268 communes
    placées). Un fond vectoriel local serait un choix, pas une nécessité.
  - **Le ZIP doit être EXTRAIT avant d'ouvrir `index.html`.** Ouvert depuis
    l'intérieur du zip, Windows n'extrait que ce fichier : `vendor/` et
    `gdin-pure.js` manquent, six `ERR_FILE_NOT_FOUND` et « parseXlsText is not
    defined » s'affichent. Constaté le 27/10/2026. Un
    `A-LIRE-AVANT-D-OUVRIR.txt` est désormais à la racine de l'archive.
  - **La CSP est la seule protection embarquée** hors serveur. Vérifiée en
    `file://` et en production sur Chrome et Edge.
  - **Clé USB** (mesuré le 27/10/2026) : fonctionne, 1,9 Mo ; les données
    restent dans le navigateur du poste et voyagent par l'export JSON.

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
  - Chiffres de réactivité et de fiabilité projetés avant `6b77162` : non
    comparables (signalé).

- **Contrôle visuel de la mention de révisabilité** (posée le 22/10/2026,
  `3280ec2`). **En ligne** : déploiement de `89391f7` vérifié vert le
  22/10/2026 (`c93dee9`, poussé après, ne touche que ce fichier). Reste le
  contrôle à l'œil, après un Ctrl+F5, dans cet ordre : bandeau gris au-dessus des KPI de la Vue globale,
  sous-titre du Rapport après avoir choisi un conseiller et un CMS, pied de la
  première diapositive du Diapo Rapport (c'est elle qui part en PDF). Sur les
  données de démonstration la mention dit « source non datée » — voulu, pas un
  défaut : la date vient de `importMeta.date`, absent sans import.

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
- **Validation sur poste** du rendu (badges, États à 9 colonnes, « Autres
  structures », libellé de réactivité), sur le site déployé.
- **Bases déjà présentes sur les postes** : conservées, complétées (rangs
  reconstitués dans l'ordre de la base), marquées `base_heritee` ; la
  provenance du conseiller y est « inconnue » sauf déduction connue. Elles sont
  incomplètes (demandes fusionnées à tort). Un import dans une telle base
  propose de la remplacer ; la reconstruction fiable = « Réinitialiser et
  importer » l'export source, puis comparer les comptes (20 226 pour
  septembre 2026).

## À porter aux développeurs de l'outil de saisie

Par gain décroissant. L'encodage de « Date action » a été signalé le 20/09/2026.

| Action à la source | Gain mesuré |
|---|---|
| Rendre « Conseiller numérique » obligatoire | supprime 40,4 % d'attributions déduites |
| Identifiant de séance d'atelier, ou champ « nombre de participants » | rend le comptage des ateliers défendable sans contourner la minimisation |
| Liste déroulante pour « Lieu / CMS » | supprime les 3,2 % de « Autre structure » et la dérive continue |
| Liste déroulante communes (référentiel INSEE) | supprime les 2 % hors référentiel |
| Thématique obligatoire | comble 22,9 % de trous |
| Contrôle de cohérence des dates à la saisie | supprime les 7,2 % d'incohérences chronologiques |
| Rendre « Urgence » fiable (consigne de saisie, ou champ retiré) | 101 urgences en 2024, 5 en 2025, 0 en 2026 : la case n'est plus cochée depuis août 2024 |

## Décisions à ne pas défaire

Une ligne par décision ; le récit et les mesures d'origine sont dans
`git log -p CHANTIERS.md` (version complète : avant le ménage du 28/10/2026).
« Testé » = un test unitaire ou e2e échoue si on la défait.

**Identité, provenance, stockage (20/10/2026, audits Codex)**

- **Identité d'une ligne** (`cleFusion`, `cleBaseAction`) : N° demande + types
  + date d'action + CMS + rang. Jamais le conseiller (déduit après fusion :
  l'ancienne clé dupliquait à chaque réimport), ni l'état, ni les dates de
  planification/réalisation (mises à jour par `fusionnerImport()`). Limites :
  date d'action corrigée à la source = nouvelle ligne ; le rang suppose le même
  ordre d'export.
- **Provenance du conseiller** : `conum_origine` = source | referent | deduit |
  inconnu ; `attribuerConum()` idempotent ; majoritaires par secteur calculés
  sur source et referent seulement ; « inconnu » compte dans la marge Fiabilité.
- **Sauvegarde** `gdin_snap_v4` dans localStorage ET IndexedDB, la révision la
  plus récente gagne ; écritures en file invalidées par `_storageEpoch` ; ne
  jamais supprimer l'ancienne copie avant le succès de la nouvelle.
- **JSON importé** validé en entier (`validerSauvegardeJSON`) : une ligne
  invalide rejette le fichier ; « Réinitialiser et importer » =
  `pendingData.reset`, jamais une globale.
- **États** : `categorieEtat()` ; « En cours » normalisé en « En attente ».
- **Réactivité par demande** (`deriverActions`, `delaisParDemande`, seuil 20
  demandes, AG-004, 22/10/2026) ; sans contact valide = « sans contact ».
  « 48 h » = 2 jours ouvrés, fériés non retirés : jamais « délai
  réglementaire ». Filtrer sur `jour`, jamais sur des mois.
- **Taux de réalisation** = lignes « Réalisée » / lignes, jamais
  `date_action` (renseignée à 100 %). **N/N−1** à même date, avec le type du
  filtre (`evolutionAnnuelle`).
- **Diapositives du Rapport** : un seul aiguillage `drRenderSlide()` (navigation
  et PDF) ; `#diapo-overlay` doit exister ; jamais
  `options.animation = options.animation || {}` (proxy Chart.js).
- **Tout texte importé passe par `esc()`** ; l'e2e d'injection doit contenir des
  ateliers, sinon il valide du code vulnérable (faille `lieu_raw`, `949d2dd`).
- **CSP** (`b9d1fbd`, AG-005) : `img-src`/`connect-src` énumérés, jamais `*` ni
  `https:` (testé) ; `'unsafe-inline'` reste (2 `<script>`, 83 `onclick=`).
  Démo DSI : F12 → Console → `allow pasting` →
  `new Image().src='https://exemple.com/x.png'`.
- **Thématiques** (AG-004) : une fois par ligne, % de **toutes** les lignes ;
  un Top 3 se compte en union (`lignesAvecThemas`), jamais en additionnant ;
  jamais « demandes ».
- **Fiabilité** : la marge d'un indicateur porte sur sa propre population ;
  « Solide » = moins de 1 % de défauts *détectés*, jamais « chiffres exacts ».
  La synthèse nomme l'indicateur le plus sensible, ne résume pas au pire.
  `defautsSaisie()` garde deux dénominateurs (sinon 104,9 %). Aucune marge
  estimée : toutes viennent d'`indicateursFiabilite()`. Onglet validé en l'état
  le 20/09/2026 ; « Ateliers » sans marge, voulu.
- **Les deux appels externes restent** (tuiles OSM France, `geo.api.gouv.fr`,
  AG-005, 27/10/2026) : URL littérales, aucune interpolation. Rouvrir seulement
  sur fait nouveau. **Si une carte locale revient** : le référentiel complète
  `COMMUNE_COORDS` sans l'écraser, `.js` par `<script src>` (pas `fetch`, refusé
  en `file://`), pas de simplification des tracés (fentes blanches) — code
  retiré : `82a9396`, `664e275`, `fe82b95`.

**Noms d'agents**

- **Aucun nom d'agent dans le source**, ni exclusion par nom (dépôt public) :
  tout se dérive des données. **Attribution par année**, jamais globale.

**Import et fusion**

- **Un seul parseur** `parseRows()` (il y en a eu deux, 26 % d'écart).
- **Ateliers** : clé `atl:<N° demande>|<date action>|p:<rang>` (sans le rang,
  78 % des participations supprimées).
- **`demojibakeUtf16()`** : ne pas l'assouplir ; la retirer quand un export
  complet n'affiche plus aucune cellule réparée.
- **Cycle Pass écarté par type d'action**, jamais par structure (UNA 47 a aussi
  de l'activité réelle).
- **Communes : référentiel officiel**, jamais de ressemblance (Donzac → Dondas).
- **`normCms()`** : mapping explicite d'abord (testé) ; `Villeneuve sur Lot`
  saisi comme lieu reste « Autre structure » (testé).

**Comptages et affichage**

- **Une ligne d'atelier = une participation** : afficher séances et
  participations. Les participants d'une séance ne sont pas des doublons.
- **Filtre par défaut « Accompagnement »** : les graphes de types d'action
  lisent `getFilteredSansType()` (audit des 36 autres graphes le 21/09/2026).
  États et Fiabilité ne suivent pas le filtre de type (testé). **Un seul jeu de
  filtres par écran** (testé).
- **Axe d'évolution = la période** (`moisDeLaPeriode()`), pas les données.
- **`countEntries()`** pour tout classement, jamais `count()` ; pas
  d'`indexOf()` pour les doublons (1 547 ms contre 3 ms).
- **Courbes jamais empilées, titres jamais figés sur un type**
  (`libelleLignes()`) : `revue-sens.test.js`.
- **`ACTIONS_DATA` dérivé de `DATA`** : alimente Vue globale, Rapport, Bilan et
  les deux diaporamas — ne pas le supprimer en « nettoyant » l'Import.
- **Visibilité réelle du panneau États** : test « le panneau devient réellement
  visible », à garder.

**Divers**

- **AGORA** : ne pas réduire `AGORA.md` au gabarit (auto-suffisance éprouvée,
  AG-001).
- **Fond de carte** : `TUILES_URL` et `TUILES_ATTRIB` partagés par les deux
  cartes. **Options des `<select>`** : fond opaque écrit en dur (contraste
  testé dans les deux thèmes).
- **Ne pas retirer les contre-preuves** e2e (`Garde-fous IndexedDB`,
  `Classement des communes`).
- **Harnais** : générateur mulberry32 (pas un LCG en `seed % n`), combinaison
  du Rapport la plus fournie, *landing* fermé par `.lo-btn` et un seul
  `.panel.active` avant toute capture.
- **Ce que l'environnement de développement ne voit pas** : le proxy filtre
  cdnjs, `geo.api.gouv.fr` et les tuiles ; le rendu de la carte se vérifie sur
  le site.

**Limites connues, à assumer**

- **Pas de KPI « Urgences »** (saisie effondrée depuis août 2024) : le remettre
  seulement si un export montre une saisie régulière.
- **Rupture d'historique au 20/09/2026** : 2 853 lignes réattribuées ; un bilan
  individuel antérieur ne se compare pas à un postérieur.
- **Attribution déduite à 40,4 %** (`comblerConum()`, `applyConumAttrib()`) :
  jamais présentée comme une mesure individuelle (bandeau Fiabilité).
- **Saisie en texte libre** : les rattrapages sont des filets ; 39 lignes à
  préfixe de service (`CIP - CMS …`) et `CMS Marmande` nu restent en « Autre
  structure », non corrigé.

## Pistes d'amélioration

Règle dans `CLAUDE.md` (« Posture de travail ») ; ne pas reproposer une piste
écartée sans fait nouveau.

**Proposées, en attente**
_(aucune)_

**Écartées** (date — piste — raison)
_(aucune)_
