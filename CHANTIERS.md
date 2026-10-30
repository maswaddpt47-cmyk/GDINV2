# Chantiers — GDINV2

État au **30/10/2026** (mesures des audits du 20/10/2026 à leur date). Ménages
des 27, 28 et 29/10/2026 : ce qui est fait, et ce que dit déjà `CLAUDE.md`,
sont retirés. Texte complet : `git log -p CHANTIERS.md`.

**À faire en premier, dans cet ordre** (passation du 29/10/2026, changement de
session et de compte) :
1. **Livraison au cloud du CD47** (règle dans `CLAUDE.md`, état dans
   `GDINV2-BACKUP/INVENTAIRE.md`, à tenir à jour). Zip `GDIN_2026-10-29.zip`
   (`scripts/zip-cloud.sh`, appli `b07a280`) **déposé le 29/10** (*déclaré, non
   vérifié*). **Pas confirmé** : consigne utilisateurs V0.2 déposée ; V3 et
   synthèse du 29/10 à mettre à la place de la V2 et de la synthèse du 28/10, déjà
   sur le cloud, **après relecture** (décisions 3 et 4) ; vérifier que ce dossier
   n'est pas ouvert aux agents. Puis prévenir les agents (retélécharger, extraire
   au même endroit, Ctrl+F5). `LISEZ-MOI.txt` et `A-LIRE` du zip sont ceux de
   `distribution/`.
2. **Trancher l'origine partagée** (« À trancher ») : fermer la version en ligne
   (recommandé, voulu par le DSI) ou autre domaine ; **choix de l'utilisateur**.
3. **À valider par l'utilisateur** : registre RGPD GDINV2 V0.2 (avec le DPO) ;
   registre de sécurité V0.9 d'`ateliers-backups` (relire la ligne sur NextStep et
   NEWGEN, « état réel non vérifié »).
4. **Règles 53 et 54** de MD-LIB : propagées ici, à NEWGEN et NextStep le 29/10
   (reste PAPPERBOARD, pas dans cette session).
5. **AG-004, AG-008, AG-009 clos le 30/10/2026 avec réserves** (résumé dans
   « Blocs tranchés » d'`AGORA.md`). **À faire avant toute diffusion aux élus** :
   relever d'autres couples (d'abord ceux à forte part déduite), audit Codex de
   l'export réel, retrouver les 12 lignes de l'ancien écart 412/400, lever l'écart
   37/35 des graphies de communes (`scripts/diag-communes.js` sur la colonne brute).
   Procédure : `GDINV2-BACKUP/releves/GDIN_Procedure-controle-chiffres_V0.1_2026-10-29.docx`.
   Aucun autre couple n'est « vérifié » ; la macro ne vaut pas validation indépendante.
6. **AG-007 clos le 29/10/2026** (livraison `719fd2d` + consigne V0.3 déposées,
   *déclaré*). Reste à mesurer l'effet des doublons sur ton export :
   `npm run audit -- export.xls`, avant le tableau d'AG-004.
7. Contrôler à l'œil la **mention de révisabilité** (en ligne ; bandeau de la Vue
   globale, sous-titre du Rapport, pied de la première diapo).

**Ne pas refaire** : un audit Codex sur AG-003 (clos), la mise à jour SheetJS (0.20.3).

Règles permanentes, et pourquoi ce fichier ne se supprime pas : `CLAUDE.md`.

## Comment reprendre

```bash
npm test                      # 323 tests unitaires · 95 e2e (npx playwright test)
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

- **XSS — six défauts corrigés le 29/10/2026, audit Codex fait.** Retrait du
  motif et du JSON en ligne (AG-007, `539f74b` ; `validerSauvegardeJSON` retiré).
  L'e2e importe un vrai XLSX : Par CMS et aides « ? » (`e846717`, `8e483a7`).
  Audit Codex (`ateliers-backups/documents/sources/audit-codex-gdinv2-xss-2026-10-29.md`,
  rapport tel quel + vérification) : trois thématiques non échappées de plus
  (bilan du Rapport, « Bilan & Conclusion », bulle « Thématiques », `46a82c7`) ;
  aucun autre chemin trouvé (93 `innerHTML`, 1 `insertAdjacentHTML`), sans preuve
  d'absence. **Leçon** : le test hostile doit choisir un conseiller et une structure
  *proposés*, sinon le Diapo rapport ne s'ouvre pas (règle 53 de MD-LIB). Le
  diagnostic de doublons suspects peut augmenter sans motif ; fusion et volumes
  inchangés.

- **CHANGEMENT DE DIFFUSION (27/10/2026, demande du DSI) : deux modes, et
  aucun des deux n'est un serveur web.** Le tableau de bord sera déposé sur le
  **cloud du CD47 (un Nextcloud : stockage de fichiers, pas un hébergement
  web)** et/ou téléchargé puis exécuté depuis le disque. GitHub Pages a
  vocation à ne plus être la voie de diffusion.
  - **`index.html` ne s'ouvre pas depuis le cloud** (testé le 28/10/2026) :
    on télécharge, on **extrait le ZIP** (sinon six `ERR_FILE_NOT_FOUND`,
    constaté le 27/10/2026), on ouvre depuis le disque, **Ctrl+F5** après chaque
    mise à jour. Le `?v=<sha>` n'a donc plus d'objet ; `deploy.yml` et
    `deploy.test.js` se revoient ensemble le jour où Pages est abandonné.
  - **Pas testé** : un dossier synchronisé par le client de bureau Nextcloud
    (*supposé* : « Toujours disponible localement » requis). Le client n'est pas
    installé sur le poste de l'utilisateur ; ce mode dépend du DSI.
  - **Risque propre au drive** : un espace partagé diffuse ce qu'on y dépose
    (fichier source, CSV détaillé, ancien export JSON). **Le dossier partagé
    porte l'application, jamais les données.**
  - **Constaté** : `geo.api.gouv.fr` et les tuiles fonctionnent en `file://` ;
    la CSP est la seule protection embarquée ; clé USB : 1,9 Mo, données dans le
    navigateur du poste (un autre poste réimporte un fichier source).
  - **Dossier DSI** (dépôt privé `GDINV2-BACKUP`, `dsi/GDIN-DSI_2026-10-29/`,
    `SOMMAIRE.txt`) : V3 à six défauts, synthèse, consigne V0.2 ; état dans `INVENTAIRE.md`.

- **AG-004 — correctifs appliqués le 22/10/2026 (`6b77162`), recomptage à
  faire.** Décisions de l'utilisateur sur les propositions de Codex (détail
  dans `AGORA.md`) : réactivité **par demande**, pourcentages de thématiques
  en **part de tous les accompagnements** (sans thématique compris),
  correctifs de libellé appliqués. Reste :
  - **Contrôle visuel** fait le 29/10/2026 sur les 11 diapos d'un couple (relevé).
  - **Tableau « affiché / recompté / écart »** : fait le 29/10/2026 pour un couple ;
    relevé et macro de recomptage (V0.2) dans le dépôt **privé** `GDINV2-BACKUP`,
    `releves/`, jamais dans ce dépôt public. **L'utilisateur veut être guidé pas à
    pas** (il ne transmet que des nombres et noms de colonnes). C'est la seule preuve
    d'exactitude ; les correctifs n'en sont pas une (Codex). Défauts de sens
    inscrits dans le bloc ; reste d'autres couples et l'audit Codex.
  - **Non traité, à proposer** : l'anneau des thématiques du Territoire
    (`ch-terr-thema`) a des parts qui se chevauchent : barres horizontales.
    Réactivité et fiabilité projetées avant `6b77162` : non comparables.

- **AG-002 clos le 29/10/2026** (volets B et C abandonnés, sans réponse du
  référent archives ni du DPO ; voir « Blocs tranchés » de `AGORA.md`). Reste
  une cause **non vérifiée** : les écarts constatés sur l'export (7 881 → 8 313 à
  période identique), à voir avec le tableau d'AG-004.
- **À trancher par l'utilisateur** (ne pas décider seul) :
  - **Origine partagée (audit Codex, 29/10/2026)** : GDINV2 est servi sous
    `maswaddpt47-cmyk.github.io`, comme d'autres applications (planification :
    jeton de session et préférences). Un code exécuté dans GDINV2 peut lire
    leur `localStorage` ; la CSP ne l'empêche pas (confirmé sur pages
    fictives, état réel non vérifié). Options : fermer la version en ligne au
    profit de la copie téléchargée (décision 4 de la synthèse DSI), ou un autre
    domaine. Une copie ouverte depuis le disque n'a pas cette origine (*supposé*).
  - **103 lignes strictement identiques** sur tous les champs conservés (hors
    ateliers, mesuré le 20/10/2026) : gardées et signalées par le panneau
    qualité ; un doublon de saisie ou deux séances le même jour, la source ne
    permet pas de le dire.
  - **Taux de demandes closes** : le taux affiché est un taux d'*accompagnements*
    réalisés (lignes). Un taux par demande demande une règle pour les demandes
    à plusieurs actions.
- **Validation sur poste** du rendu (badges, États à 9 colonnes, « Autres
  structures », libellé de réactivité), sur le site déployé. **Bases déjà
  présentes** : conservées, marquées `base_heritee`, mais incomplètes ;
  reconstruction fiable = « Réinitialiser et importer » l'export source, puis
  comparer les comptes (20 226 pour septembre 2026).

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
- **Fichiers JSON** : import/export désactivés sur demande de l'utilisateur,
  y compris glisser-déposer et remplacement ; sérialisation interne du
  navigateur conservée. « Réinitialiser et importer » = `pendingData.reset`,
  jamais une globale. Ne pas confondre copie du fichier XLSX et base source.
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
- **Tout texte importé passe par `esc()`**, y compris dans les textes d'aide
  « ? » (`setInsightQ`, écrits en HTML au clic). L'e2e d'injection doit passer
  par un **vrai import XLSX**, contenir des ateliers, et un CMS que le parseur
  reconnaît : avec un CMS hostile le sélecteur reste vide et `renderCms()` sort
  tôt (failles `lieu_raw` `949d2dd`, Par CMS et aides le 29/10/2026).
- **Un canvas Chart.js ne lit pas `var(--text)`** : couleur d'axe par
  `legendColor()`. **Une tuile à valeur texte** (`.kpi-texte`) prend la taille des
  chiffres voisins et ne rétrécit que si le libellé déborde.
- **CSP** (`b9d1fbd`, AG-005) : `img-src`/`connect-src` énumérés, jamais `*` ni
  `https:` (testé) ; `'unsafe-inline'` reste (2 `<script>`, 83 `onclick=`).
  Démo DSI : F12 → Console → `allow pasting` →
  `new Image().src='https://exemple.com/x.png'`.
- **Thématiques** (AG-004) : une fois par ligne, % de **toutes** les lignes ;
  un Top 3 se compte en union (`lignesAvecThemas`), jamais en additionnant ;
  jamais « demandes ».
- **Animations** (validées à l'œil sur téléphone le 28/10/2026 ; limite acceptée :
  une capture pendant le comptage peut montrer un chiffre intermédiaire). Un graphe
  rejoue **toujours** à son arrivée à l'écran ; la fermeture de l'écran d'accueil
  rejoue la Vue globale ; une barre de liste se vide **sans transition** avant de
  pousser ; tuiles en cascade (80 ms) (`NombreAnime`, `quandVisible`) ; jamais
  pendant l'export PDF ni l'impression (`ANIM.suspendu`, contre-preuve e2e) ; e2e
  en mouvement réduit via `contextOptions`. Un KPI ne glisse que depuis **le même
  indicateur** (emplacement + libellé + unité : 1125 % sinon) ; tout chiffre de
  18 px et plus est animé (test de balayage).
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
  du Rapport la plus fournie, *landing* fermé par `.lo-btn`, un seul
  `.panel.active` avant toute capture. Le proxy de développement filtre cdnjs,
  `geo.api.gouv.fr` et les tuiles : la carte se vérifie sur le site.

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

Règle dans `CLAUDE.md`. Proposées : aucune. Écartées : aucune.
