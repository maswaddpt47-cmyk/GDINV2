# Chantiers — GDINV2

État au **20/09/2026**, commit `fe474e8` (branche de session).

Ce fichier existe pour qu'une session qui démarre sans historique sache où en
est le projet. **Il ne se supprime pas.** Ce qui s'efface, ce sont les tâches,
au fur et à mesure qu'elles sont terminées — après avoir remonté dans
« Décisions à ne pas défaire » l'invariant ou le piège qui doit survivre. Le
récit de ce qui a été fait appartient à `git log`, dont les messages portent
les mesures.

Règles permanentes : `CLAUDE.md`.

## Comment reprendre

```bash
npm test                      # 250 tests unitaires · 69 e2e
npm run audit -- export.xls   # ce que l'application retient d'un export réel
```

L'export n'est pas dans le dépôt (données personnelles) : le redemander à
l'utilisateur. **Seul le dernier export fourni fait foi** — ne pas rouvrir de
comparaison avec un fichier antérieur. Référence actuelle : septembre 2026,
24 410 lignes, 20 226 retenues, 19 290 en base après fusion.

## Chantiers ouverts

### AGORA — à éprouver

`AGORA.md` et la section « AGORA » du `CLAUDE.md` ont été propagés depuis
MD-LIB le 21/09/2026, après validation du format par le projet pilote
ATELIERS_NEWGEN — un cycle complet y a corrigé un protocole de mesure, la
session contradictrice ayant infirmé deux points de l'auteur sur pièces. Le
format n'a en revanche pas encore servi **ici**.

Deux points à vérifier au premier usage réel :

- **Auto-suffisance.** Une session qui n'aurait que ce dépôt sous les yeux —
  autre compte, MD-LIB non attaché — doit pouvoir ouvrir un bloc **et y
  répondre** avec `AGORA.md` + `CLAUDE.md` seuls. Si elle a besoin d'ouvrir
  `MD-LIB/agora.md`, la copie est incomplète.
- **Le point faible est que Claude oublie.** Aucun test n'échoue si un critère
  est rempli sans signalement. La seule vérification réelle : reprendre la
  session quand le diff montre un critère rempli resté silencieux.

Ce chantier se ferme quand un bloc a été ouvert, répondu et tranché.

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

## Décisions à ne pas défaire

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
