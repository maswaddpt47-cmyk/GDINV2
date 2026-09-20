# Chantiers — GDINV2

État au **20/09/2026**, commit `a10d0c7`.

Ce fichier existe pour qu'une session qui démarre sans historique sache où en
est le projet. **Il ne se supprime pas.** Ce qui s'efface, ce sont les tâches,
au fur et à mesure qu'elles sont terminées — après avoir remonté dans
« Décisions à ne pas défaire » l'invariant ou le piège qui doit survivre. Le
récit de ce qui a été fait appartient à `git log`, dont les messages portent
les mesures.

Règles permanentes : `CLAUDE.md`.

## Comment reprendre

```bash
npm test                      # 236 tests unitaires
npm run audit -- export.xls   # ce que l'application retient d'un export réel
```

L'export n'est pas dans le dépôt (données personnelles) : le redemander à
l'utilisateur. **Seul le dernier export fourni fait foi** — ne pas rouvrir de
comparaison avec un fichier antérieur. Référence actuelle : septembre 2026,
24 410 lignes, 20 226 retenues, 19 290 en base après fusion.

## Chantiers ouverts

### Dériver l'attribution CMS → conseiller des données

**Validé par l'utilisateur le 20/09/2026.** `CONUM_ATTRIB` est codé en dur dans
`index.html` et **périmé** : il diverge des données réelles sur 4 CMS sur 12.

| CMS | Codé en dur | Constaté dans les données |
|---|---|---|
| CMS Tonneins | CAPELLE Eva | MONTOUX PARTHENAY Caroline (121) |
| CMS Nérac | CAPELLE Eva | MONTOUX PARTHENAY Caroline (117) |
| CMS Antenne Aiguillon | CAPELLE Eva | MONTOUX PARTHENAY Caroline (87) |
| CMS Agen Tapie | TUAL Corentin | PINEAU Cynthia (126) |

Conséquence mesurée sur l'export de septembre : **2 853 lignes attribuées à un
conseiller que les données démentent** — 34 % des attributions déduites,
14,8 % de la base. Le tableau « par conseiller » crédite un agent de l'activité
d'un autre. À signaler aux conseillers concernés : impossible de savoir depuis
les données si le code est périmé ou si un agent a ponctuellement couvert le
secteur d'un collègue.

Dériver le mapping des données règle trois choses à la fois : plus aucun nom
d'agent dans le code source publié, plus de mapping périmé, et le rattachement
suit les changements d'affectation.

Points à traiter en le faisant :

- **Rétroactivité** : un mapping global attribuerait l'activité de 2022 au
  conseiller actuel du secteur. Dériver par année, avec repli sur le global
  quand l'année manque.
- **CMS Casteljaloux** n'a aucune donnée : il restera sans attribution, ce qui
  est plus honnête qu'une déduction fausse.
- **`ORI_EXCL`** sert un autre usage (six noms d'agents en clair) et demande un
  traitement séparé.

### RGPD — noms d'agents dans le code source

`CONUM_ATTRIB` et `ORI_EXCL` publient nom, prénom et **secteur d'affectation**
de six agents sur un dépôt public et un site indexable.

Le fond n'est pas illicite — nom, prénom et fonction d'un agent public ne sont
pas confidentiels, et ce ne sont pas des données sensibles. Ce qui pose
problème :

- **la publication n'a aucune finalité** : ce sont des paramètres techniques
  exposés par accident d'architecture, ce que le principe de minimisation
  (art. 5.1.c) ne justifie pas ;
- **l'indexation** : une recherche sur le nom d'un agent peut faire remonter
  son secteur, ce qui n'est pas le cas d'un organigramme consulté volontairement ;
- **l'information des personnes** (art. 13) : les six agents n'ont
  vraisemblablement pas été informés.

Le DPO du Département tranche. La dérivation ci-dessus supprime le sujet pour
`CONUM_ATTRIB` ; `ORI_EXCL` reste à traiter.

## En attente de l'utilisateur

- **Noms d'agents en clair.** `CONUM_ATTRIB` et `ORI_EXCL` inscrivent des noms
  d'agents dans `index.html`, donc publiés sur GitHub Pages. À arbitrer avec
  les personnes concernées.
- **Validation en usage réel de l'onglet Fiabilité** avant d'y toucher.

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
- **`countEntries()` pour tout classement affiché**, jamais `count()` : les
  clés entières d'un objet JavaScript repassent en tête et « 47 » s'affichait
  devant Agen.
- **Ne pas revenir à `indexOf()`** pour compter les doublons : 1 547 ms contre
  3 ms, le coût croît au carré.
- **La synthèse de fiabilité ne se réduit pas au pire indicateur** : afficher
  « faible » quand quatre indicateurs sur neuf sont exacts décrédibilise ce qui
  est solide. Elle nomme le plus sensible.
- **`defautsSaisie()` utilise deux dénominateurs** — base pour les défauts
  constatés, lignes lues ou retenues pour ceux issus de l'import. Les mélanger
  affichait 104,9 % sur une colonne réparée à 100 %.
- **Aucune marge affichée ne doit être estimée.** Toutes viennent de
  `indicateursFiabilite()`, recalculées depuis le fichier importé.

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

**Limites connues, à assumer plutôt qu'à masquer**

- **L'attribution par conseiller est déduite à 40,4 %** : `comblerConum()`
  applique d'abord le référent constaté, `applyConumAttrib()` comble le reste
  depuis le CMS. Un changement de secteur réécrit l'historique. Le bandeau de
  l'onglet Fiabilité est la réponse retenue — ne pas présenter ces chiffres
  comme une mesure individuelle.
- **La saisie reste du texte libre.** Les trois mécanismes de rattrapage
  (lieux, communes, conseiller) sont des filets, pas une solution : elle se
  joue à la source.
- **Préfixes de service devant un CMS non reconnus** (`CIP - CMS
  Villeneuve/Lot`, `DSIAN / CMS Villeneuve-Fumel`…) : 39 lignes en « Autre
  structure ». Le libellé nu `CMS Marmande` n'est pas non plus une clé du
  mapping. Volume faible, non corrigé.
