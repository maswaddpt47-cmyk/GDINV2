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

## Résolu le 20/09/2026 — les lignes sans CMS, et la fiabilité des dimensions

Trois chantiers menés à la suite, tous mesurés sur l'export de septembre
(24 410 lignes). Bilan : **18 202 → 20 226 enregistrements**.

### 1. Communes regroupées

497 libellés pour 366 communes réelles ; 95 groupes éclatés par casse,
accents, tirets et ST/SAINT — « Villeneuve-sur-Lot » sous six graphies. Toute
statistique par commune était répartie entre les orthographes.

`normCommuneKey()` regroupe, le libellé affiché reste la graphie la plus
fréquente du fichier. La carte normalisait déjà de son côté, dans une fonction
locale de `drawMap()` : les agrégations, elles, comptaient le brut.

### 2. Conseiller lu dans le « Référent »

« Conseiller numérique » n'est renseigné qu'à 30 %. `applyConumAttrib()`
comblait d'abord par `CONUM_ATTRIB` (CMS → conseiller) : une déduction
géographique primait sur la donnée constatée et **la contredisait sur 782
lignes**. `comblerConum()` applique le référent à l'import, avant toute
déduction. Attribution constatée : **30 % → 58 %**.

La liste des conseillers est dérivée des données, jamais codée en dur : le
dépôt est public. `ORI_EXCL`, qui inscrit six noms d'agents en clair dans les
HTML, en omettait un septième présent dans l'export.

### 3. Cycle Pass écarté, lieux partenaires admis

La règle ne testait pas la nature du lieu mais **la colonne dans laquelle il
était tapé**. Le Club des Aînés de la Cascade entrait, l'IME Montclairjoie
était jeté.

- Cycle Pass (`Demande suivi pass (auto)`, `Suivi pass`, `Sondage pass`) :
  4 184 lignes écartées **par type d'action**, jamais par nom de structure —
  UNA 47 porte 969 lignes du cycle et 30 d'activité réelle. « Demande de
  prescription de Pass » est conservée, c'est un geste de conseiller.
- Repli sur la structure élargi aux libellés inconnus → « Autre structure ».

**Ateliers dans le dashboard : 4 513 → 5 478.** Plus aucune ligne n'est
écartée faute de lieu.

## Résolu le 20/09/2026 — dérive des libellés de lieux et de communes

L'utilisateur a soulevé le vrai risque : les saisies restent libres, donc les
variantes d'un même partenaire et d'une même commune vont continuer à se
multiplier. Deux réponses, de nature différente.

### Lieux : rattrapage souple, adossé au mapping

`normCms()` a un dernier recours — jamais un premier : une clé qui neutralise
la ponctuation et les mots qui ne distinguent pas deux lieux (« association »,
« asso », « permanence », articles). Le mapping explicite garde la priorité,
il porte les décisions métier.

Vérifié sur les 181 entrées écrites à la main : cette clé n'en met jamais deux
en conflit, et aurait déduit seule 54 d'entre elles. Une clé qui désignerait
deux lieux différents n'est pas indexée — un test le vérifie sur tout le
mapping, donc à chaque ajout futur.

Onze partenaires ont par ailleurs reçu leur entrée nommée, dont ABRIS, éclaté
en dix graphies pour 181 lignes (confirmé par l'utilisateur : un seul lieu).
« Autre structure » : 1 936 → 702 lignes, de 10 % à 3 %.

### Communes : référentiel officiel, pas heuristique

Les 319 communes actuelles du département sont embarquées dans `gdin-pure.js`
(`@etalab/decoupage-administratif` 6.0.0).

**Ne pas remplacer ce référentiel par un rapprochement par ressemblance.**
Brax et Bias, Layrac et Clairac, Saint-Vite et Saint-Sixte sont à deux
caractères les unes des autres. Un premier prototype, sans référentiel,
rattachait Donzac à Dondas et Toulon à Bouglon — des chiffres faux, sans
alerte. Le référentiel les contient toutes, donc aucune ne peut être écrasée.

`rattacherCommune()` procède du plus sûr au moins sûr et ne tranche jamais une
ambiguïté. Le nom officiel n'est cherché qu'**en tête** du libellé : « Agen »
apparaît dans « Passage d'Agen » comme dans « Valence-d'Agen », qui est du 82.
Le rapprochement à deux caractères près est réservé aux libellés de plus de
dix caractères ; en deçà la ressemblance ne prouve rien.

Communes distinctes 366 → 325 ; « Le Passage » retrouve ses 440 lignes,
jusque-là coupées en deux par « LE PASSAGE D'AGEN ». Les communes s'affichent
désormais sous leur nom officiel, accentué et tireté.

Ce qui reste hors référentiel est légitime et visible : `Inconnu` (109),
`SOTURAC` (58, commune du Lot), `)` (32), `test` (7). Mieux vaut un libellé
douteux qui se voit qu'un faux rattachement silencieux.

### Ce que ça ne règle pas

La saisie reste du texte libre. Le jour où l'outil amont proposera des listes
déroulantes pour le lieu et la commune, ces trois mécanismes deviendront des
filets de sécurité au lieu d'être la seule défense.

Deux libellés restent sans arbitrage métier : `micro collège` (60 lignes) et
`Villeneuve sur Lot` (55) saisi comme lieu alors que c'est une commune.

## Bug d'affichage — les libellés numériques passent en tête des classements

Découvert le 20/09/2026 en vérifiant le regroupement des communes.
`count()` renvoie un objet construit par `Object.fromEntries` : JavaScript
replace les **clés entières** en tête, quel que soit leur volume. Le classement
des communes affiche donc `47` (2 lignes) avant `AGEN` (4 791).

Trois libellés concernés (`47`, `47000`, `47240`, codes postaux saisis à la
place du nom). Aucune autre dimension n'a de clé numérique aujourd'hui, mais le
défaut est dans `count()`, pas dans la donnée : il frappera toute dimension qui
en recevra une.

Corriger suppose de changer le type de retour de `count()`, utilisé par tous
les classements des deux HTML. Non fait pour ne pas élargir les chantiers en
cours — à arbitrer.

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

1. **Mapping nominatif des partenaires** et bug de `count()` — voir ci-dessus.
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
