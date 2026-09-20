# Chantiers en cours — GDINV2

État au **20/09/2026**, commit `eedc3a4`. Ce fichier existe pour qu'une
session de travail qui démarre sans historique sache où en est le projet et
ce qui reste à trancher. **Le supprimer quand tout est soldé** — ce n'est pas
de la documentation permanente, c'est un état transitoire.

Règles permanentes : voir `CLAUDE.md`. Détail de ce qui a été fait et
pourquoi : `git log`, les messages portent les mesures.

## Comment reprendre

```bash
npm test                      # 88 tests unitaires
npm run audit -- export.xls   # ce que l'appli retient d'un export réel
```

L'export de référence n'est pas dans le dépôt (données personnelles) : il
faut le redemander à l'utilisateur. Les chiffres ci-dessous viennent de
l'export de **septembre 2026** (24 410 lignes, 2022→2026), audité le
20/09/2026. Les volumes de la section « 5 919 lignes sans CMS » datent de
l'export de juin (22 934 lignes) ; sur celui de septembre, 6 208 lignes
sont écartées faute de CMS.

## Décision en attente — les 5 158 lignes restantes sans CMS

**Requalifié le 20/09/2026 après un apport métier de l'utilisateur : les
ateliers ne se tiennent quasiment jamais en CMS, mais chez des partenaires.**
Cette phrase change la lecture du problème.

### Ce que « Lieu / CMS » contient vraiment

`CMS_MAP` n'est pas une liste de CMS : c'est une liste de **lieux connus**, CMS
inclus. Il contient déjà IME Fongrave, APF France Handicap, Cité Scolaire
Fumel, la Régie de Territoire, les médiathèques. Vérifié sur les 4 513 ateliers
qui passent l'import : ils ne sont pas en CMS non plus, ils sont chez ces
partenaires-là.

La règle d'exclusion ne teste donc pas « est-ce un CMS ». Elle teste **« la
case Lieu / CMS est-elle remplie »** — remplie avec n'importe quoi, la ligne
entre (sous « Autre structure » si le libellé est inconnu) ; vide, elle est
jetée même si le lieu est écrit dans la colonne d'à côté.

D'où une incohérence franche : `Club des Aînés de la Cascade - Fauillet`
(80 lignes) est **retenu** parce que saisi dans « Lieu / CMS », tandis que
`IME Montclairjoie` (324 lignes) est **jeté** parce que saisi dans
« Structure orienteur ». Même nature, sort opposé, pour une raison purement
administrative.

### Les 5 158 lignes, toutes structures renseignées

Aucune n'a les deux colonnes vides : **le lieu est toujours connu**.

| | Volume | Nature |
|---|---|---|
| **Cycle Pass** | 4 033 | `Demande suivi pass (auto)`, `Suivi pass`, `Sondage pass`, `Demande de prescription`. Plomberie du Pass Numérique, pas de l'activité. |
| **Activité réelle** | 1 125 | 965 ateliers, 86 prises de contact, 74 accompagnements, chez des partenaires non encore mappés. |

Le découpage se fait **par type d'action, jamais par nom de structure** :
`UNA 47` porte 969 lignes de cycle Pass *et* 30 lignes d'activité réelle. Un
filtre par libellé se tromperait.

### Correction proposée, non appliquée

1. Exclure le cycle Pass **par type d'action** (comme `TYPE_EXCLUS` le fait
   déjà pour `Reservation`).
2. Puis élargir le repli famille A aux libellés inconnus : ils atterriraient
   sous « Autre structure », exactement comme ils le font déjà lorsqu'ils sont
   saisis dans « Lieu / CMS ». La cohérence entre les deux colonnes est
   rétablie, et les 965 ateliers manquants entrent.
3. Au passage, mapper nommément les lieux récurrents plutôt que de les laisser
   en « Autre structure » — et corriger les doublons de casse qui en font des
   lieux distincts : `IME Montclairjoie` + `IME MONTCLAIRJOIE` (372),
   `Collège Lucie AUBRAC` (264), `France Services Pays de Lauzun` sous deux
   graphies (42).

Problème annexe : le Département apparaît sous **quatre orthographes** dans
« Structure orienteur » (~1 500 lignes éclatées), toutes dans le cycle Pass.
Sans objet si le point 1 est fait.

Le filtre `typeFilter` de l'interface ne peut rien pour ces lignes : il filtre
l'affichage de ce qui est déjà en base, alors que `ECARTER_SANS_CMS` agit à
l'import. Ne pas confondre les deux étages.

## Sur quoi peut-on produire des statistiques — mesuré le 20/09/2026

Audit de fiabilité par dimension, sur les 19 252 enregistrements retenus de
l'export de septembre. À lire **avant** d'ajouter un graphe : une dimension non
fiable produit un chiffre faux sans prévenir.

| Dimension | Rempli | Libellés | Après normalisation | Verdict |
|---|---|---|---|---|
| Lieu / CMS | 100 % | 39 | 39 | **Fiable.** Zéro variante — le mapping fait son travail. |
| État de l'action | 100 % | 4 | 4 | **Fiable.** |
| Dates (demande, action) | 100 % | — | — | **Fiable** depuis la réparation d'encodage. |
| N° de demande | 100 % | 7 206 | — | **Fiable.** |
| Type d'action | 95 % | 10 | 10 | **Fiable.** |
| Thématiques | 75 % | 13 | 13 | Propre, mais un quart des lignes sans thématique. |
| Structure orienteur | 100 % | 133 | 115 | 18 variantes. À normaliser. |
| Commune | 99 % | 497 | 383 | **88 groupes éclatés** par casse et tirets. |
| Conseiller numérique | **30 %** | 7 | 7 | **Le plus fragile.** Voir ci-dessous. |

### La commune est réparable mécaniquement

497 libellés pour 383 communes réelles. L'éclatement est purement
typographique : casse et séparateurs. Une même commune apparaît jusqu'à six
fois (`VILLENEUVE-SUR-LOT`, `Villeneuve-sur-Lot`, `VILLENEUVE SUR LOT`,
`Villeneuve sur Lot`, `villeneuve sur lot`, `villeneuve-sur-lot`).

Contrairement aux partenaires, aucun arbitrage n'est nécessaire : normaliser
casse, accents et séparateurs suffit. `normKey()` fait déjà ce travail pour les
CMS. Tant que ce n'est pas fait, **toute statistique par commune est fausse**,
les volumes étant répartis entre les graphies.

### Le conseiller est la dimension la moins sûre, pas la plus sûre

La colonne « Conseiller numérique » n'est remplie que sur **30 %** des lignes.
L'application comble le reste via `CONUM_ATTRIB`, une inférence CMS →
conseiller : un rattachement géographique, pas une donnée constatée.

Or la colonne « Référent » est remplie à 99 % et porte le nom d'un conseiller
sur une grande partie des lignes. Mesures :

| | Lignes | Couverture |
|---|---|---|
| Conseiller renseigné à la source | 5 761 | 30 % |
| + Référent identifié comme conseiller | +5 254 | **57 %** |
| Restant, aujourd'hui inféré du CMS | 8 237 | 43 % |

**Contrôle de cohérence** : sur les 2 706 lignes où les deux colonnes portent
un conseiller, elles concordent à **95 %**. Le « Référent » est donc une source
solide, nettement meilleure qu'une déduction géographique.

Piste : combler depuis « Référent » avant de tomber sur `CONUM_ATTRIB`, et
distinguer dans l'interface ce qui est constaté de ce qui est déduit. Non
appliqué — à arbitrer.

## Trou de mapping — préfixes de service devant un CMS

Découvert le 20/09/2026 en écrivant les tests de la famille A : `CMS_MAP` ne
reconnaît pas un libellé préfixé par un service. 39 lignes sur l'export de
septembre, rangées à tort sous « Autre structure » :

```
14  CIP - CMS Villeneuve/Lot        5  CIP - CMS Villeneuve
 7  DSIAN / CMS Villeneuve-Fumel    3  ASE - CMS Villeneuve
 6  Centre Médico-Social d'AGEN     2  TSSI CMS Villeneuve/Lot
```

À noter aussi : le libellé nu `CMS Marmande` n'est pas une clé du mapping
(`normCms('CMS Marmande')` rend `null`). Il n'apparaît pas dans cet export,
mais le jour où il arrive, la ligne part en « Autre structure ».

Volume faible, non corrigé pour ne pas élargir le correctif famille A.
Vérifié au passage : les 782 lignes « Autre structure » restantes sont de
vraies structures externes (associations, mairies, bibliothèques), pas des CMS
mal classés.

## Résolu le 20/09/2026 — « Date action (saisie) » illisible

La colonne sortait de SheetJS en mojibake UTF-16 (`"㠰〯⼳〲㈲"` au lieu de
`08/03/2022`) sur 100 % des 24 410 lignes, chemin navigateur compris.
`date_action` était donc `null` sur les 18 202 enregistrements retenus, ce qui
rendait la clé de fusion des doublons constante et **écrasait 2 826 actions
réelles à chaque import**.

Corrigé par `demojibakeUtf16()` (`gdin-pure.js`, commit `fff4554`). Mesures
après correctif, sur le même export :

| | Avant | Après |
|---|---|---|
| `date_action` renseignée | 0 | 18 202 |
| Clés de fusion distinctes | 11 548 | 14 374 |
| Délais calculables | 0 | 18 180 (moyenne 9 j, médiane 1 j) |

Le compte rendu d'import affiche le nombre de cellules réparées — une
réparation silencieuse sur 100 % d'une colonne ne doit pas passer inaperçue.
Ne pas assouplir la détection : elle ne décode que si toute la chaîne est dans
le plan supérieur Unicode et si le résultat est de l'ASCII imprimable.
Appliquée à tort, elle corromprait une donnée saine.

**Reste à vérifier** : l'export de juin 2026 portait-il déjà le défaut ? Si
oui, tous les rapports tirés avant le 20/09/2026 sous-comptaient les actions.

## Chantiers restants, par priorité

1. **Arbitrage A/B/C** ci-dessus.
2. **Garde-fou sur IndexedDB.** `localStorage` ne tient pas les données
   (quota dépassé dès 6 Mo, un export en fait ~7,7) : le repli IndexedDB est
   le chemin normal, pas l'exception. Or `_idbOpen()` ne gère ni `onblocked`
   ni délai maximum — si l'ouverture reste en attente, l'import se fige après
   « N enregistrements » sans message. Risque identifié par lecture du code,
   non reproduit.
3. **Détecteur de doublons quadratique.** `keys.indexOf(k)` dans un `filter`
   (fonction du panneau qualité) : 823 ms mesurés sur 17 015 lignes, 3 ms
   avec un `Set`. Le coût croît au carré du volume.
4. **Indicateurs de complétion restants.** Trois occurrences basées sur
   `!r.date_action` : colonne `%` du tableau mensuel (deux fois) et KPI
   « Complétion » de la vue par conseiller. Leur valeur constante venait du
   bug d'encodage ci-dessus, désormais corrigé — à revérifier sur un import
   réel avant de conclure qu'il reste quelque chose à faire.
5. **Types absents du dropdown.** `typeFilter` ne propose que
   Accompagnement, Prise de contact, Orientation tiers et Atelier. Les types
   Pass, `Orientation vers un CN du 47` et `Autre` ne sont atteignables par
   aucune position du filtre.
6. **Cache-busting.** Les scripts sont chargés sans `?v=N` : après un
   correctif, un navigateur peut continuer à servir l'ancienne version. En
   attendant, vérifier les déploiements en navigation privée.
7. **Suppression de `index.html`.** Décidé : v2 remplace v1. Tant que la
   suppression n'est pas faite, `index.html` reste servi à la racine par
   GitHub Pages et toute correction fonctionnelle doit être appliquée aux
   deux fichiers.

## Points à ne pas défaire

- **L'attribution des conseillers est déduite à 74 %.** 12 618 lignes sur
  17 015 n'ont aucun conseiller renseigné ; `applyConumAttrib()` les comble
  via `CONUM_ATTRIB`, un mapping CMS → conseiller codé en dur. Le tableau
  « par conseiller » repose donc majoritairement sur une inférence, et un
  changement de secteur réécrit l'historique rétroactivement. À assumer dans
  l'interface ou à corriger à la source, pas à ignorer.
- **`CONUM_ATTRIB` et `ORI_EXCL` contiennent des noms d'agents en clair**
  dans les HTML, donc publiés sur GitHub Pages. À arbitrer avec eux.
- **Les tests de minimisation RGPD** (`parseRows — minimisation RGPD`) sont
  ce qui empêche un champ nominatif d'entrer dans l'application. Ne jamais
  les désactiver pour faire passer un commit.
