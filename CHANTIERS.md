# Chantiers en cours — GDINV2

État au **20/09/2026**, commit `d06b5e3`. Ce fichier existe pour qu'une
session de travail qui démarre sans historique sache où en est le projet et
ce qui reste à trancher. **Le supprimer quand tout est soldé** — ce n'est pas
de la documentation permanente, c'est un état transitoire.

Règles permanentes : voir `CLAUDE.md`. Détail de ce qui a été fait et
pourquoi : `git log`, les messages portent les mesures.

## Comment reprendre

```bash
npm test                      # 187 tests unitaires
npm run audit -- export.xls   # ce que l'appli retient d'un export réel
```

L'export de référence n'est pas dans le dépôt (données personnelles) : il
faut le redemander à l'utilisateur. Les chiffres ci-dessous viennent de
l'export de **septembre 2026** (24 410 lignes, 2022→2026), audité le
20/09/2026.

**Seul le dernier export fourni fait foi** (décision de l'utilisateur,
20/09/2026). Les exports antérieurs ne sont plus exploités : ne pas rouvrir
de comparaison avec eux, ne pas tirer de conclusion d'un écart avec un
ancien chiffre.

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

Les deux libellés en suspens ont été tranchés le 20/09/2026 :

- `micro collège` est un dispositif du collège Saint-Pierre à Casseneuil. Il a
  son entrée (60 lignes). Les 22 lignes « Micro-collège Casseneuil » gardent
  la médiathèque de Casseneuil pour lieu : l'atelier s'y tient, le
  micro-collège n'est que la structure orientrice. Le lieu prime, c'est voulu.
- `Villeneuve sur Lot` saisi comme lieu (55 lignes) **reste en « Autre
  structure »** : ce ne sont pas les ateliers de l'utilisateur. Ne pas le
  mapper — un test le verrouille.

Le collège Germillac a reçu une entrée qui ne sert à rien aujourd'hui : ses 82
lignes relèvent toutes du cycle Pass et sont écartées. Elle est conservée pour
qu'un atelier qui s'y tiendrait demain ne reparte pas en « Autre structure ».

## Résolu le 20/09/2026 — classement des libellés numériques

Un libellé numérique — « 47 », « 47000 », codes postaux saisis à la place du
nom — s'affichait en tête de tous les classements, devant « Agen » et ses
4 791 lignes. `count()` renvoie un objet, et JavaScript y replace les clés
entières en premier quel que soit leur volume : le tri appliqué juste avant
était perdu à la restitution.

**Ne pas utiliser `count()` pour un classement affiché.** `countEntries()` rend
un tableau, dont l'ordre ne dépend plus des clés ; `count()` subsiste pour les
accès par clé. Les 33 appels concernés y sont passés dans les deux HTML, et
`makeBarList()` accepte un tableau d'entrées — sans quoi un
`Object.fromEntries` réintroduit le défaut juste après l'avoir corrigé.

Vérifié dans le navigateur : deux tests e2e (`Classement des communes`)
importent un jeu où « 47 » ne pèse qu'une ligne et lisent l'ordre que la page
produit. Le second reproduit l'ancien comportement via `count()`, de sorte que
la correction cesserait d'être prouvée si elle disparaissait.

## Résolu le 20/09/2026 — gel d'import et détecteur quadratique

### IndexedDB : un gel silencieux devenu un message

`localStorage` ne tient pas les données (quota dépassé dès 6 Mo, un export en
fait ~7,7) : le repli IndexedDB est le chemin normal, pas l'exception.

`saveToStorage()` attend `_idbPut()`, qui attend `_idbOpen()`. Une ouverture
sans réponse laissait ce `await` pendant pour toujours, et **tout le code qui
suit l'import ne s'exécutait jamais** — y compris le message d'erreur déjà
prévu pour ce cas. D'où un import arrêté après « N enregistrements », sans
rien à l'écran.

Trois garde-fous : `onblocked`, qui n'était pas traité ; un délai maximum de
10 s sur l'ouverture ; le même sur les transactions, dont une qui ne se dénoue
pas figerait l'import de la même façon. La lecture est couverte aussi : au
démarrage, c'est le dashboard entier qui l'attend.

Cinq tests e2e (`Garde-fous IndexedDB`) le vérifient dans le navigateur, dont
une contre-preuve qui rejoue l'implémentation d'origine sur la même panne et
constate qu'elle reste pendante. Ne pas retirer cette contre-preuve : sans
elle, les quatre autres passeraient même si le garde-fou disparaissait.

### Doublons : 1 547 ms → 3 ms

`keys.filter((k,i)=>keys.indexOf(k)!==i)` était quadratique. Sur les 20 226
enregistrements de l'export de septembre : 1 547 ms contre 3 ms avec un `Set`,
pour un résultat identique (5 693 doublons). La note précédente mesurait
823 ms sur 17 015 lignes — le coût croît bien au carré.

`cleDoublon()` et `compterDoublons()` sont dans `gdin-pure.js`. Un test compare
les deux comptages sur un jeu construit, pour que l'équivalence reste
vérifiée. **Ne pas revenir à `indexOf()`.**

## Résolu le 20/09/2026 — un seul dashboard

`index-v2.html` a pris la place d'`index.html`. Le fichier est renommé, pas
seulement effacé : GitHub Pages sert `index.html` à la racine, une simple
suppression aurait mis le site hors ligne.

Vérifié avant : les 144 fonctions et l'intégralité des identifiants DOM
étaient présents des deux côtés. Vérifié après : page chargée sans erreur,
10 panneaux, KPI affichés, trois librairies définies, 26 tests e2e verts.

**Ne pas recréer un second dashboard.** Une variante à essayer se fait sur une
branche, pas dans un fichier parallèle.

## Résolu le 20/09/2026 — cache-busting

`?v=<sha court>` est injecté dans les six URLs locales d'`index.html` par
`.github/workflows/deploy.yml`, au déploiement. Plus besoin de tester en
navigation privée pour savoir si un correctif est réellement passé.

La version n'est pas écrite dans le fichier source, exprès : elle ne serait
jamais incrémentée, et le dépôt comme les tests chargent la page sans query.

Le risque n'est pas que la commande échoue, c'est qu'elle cesse
**silencieusement** de mordre si le `<head>` est réécrit autrement.
`deploy.test.js` rejoue la même expression et vérifie qu'elle touche les six
assets, ne touche rien d'autre, et précède la publication. La CI lance
désormais `npm test`, qui couvre les deux fichiers de tests.

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

**Signalé à l'équipe de développement de l'outil de saisie** le 20/09/2026.
Tant qu'un correctif à la source n'est pas livré, `demojibakeUtf16()` reste
indispensable : ne pas le retirer tant que le compte rendu d'import affiche
des cellules réparées. Le jour où le compte rendu affichera zéro réparation
sur un export complet, la fonction pourra être retirée — pas avant.

## CHANTIER EN COURS — Onglet « Fiabilité des données »

**Validé par l'utilisateur le 20/09/2026, non commencé.** Objectif énoncé :
protéger celui qui présente le dashboard à des élus ou à une direction. Ne
jamais inventer de marge : n'afficher que des écarts mesurés sur le fichier
importé.

Toutes les mesures ci-dessous viennent de l'export de **septembre 2026**
(24 410 lignes, 20 226 retenues). L'export n'est pas dans le dépôt — le
redemander à l'utilisateur pour rejouer les chiffres.

### À corriger AVANT de construire l'onglet — sinon il affichera du faux

**1. « Ateliers » compte des participations, pas des sessions.**
5 478 lignes d'atelier correspondent à **596 sessions**, soit 9,2 participants
en moyenne. Annoncer « 5 478 ateliers » devant des élus est indéfendable.
→ Afficher les deux : « 596 ateliers · 5 478 participations ». Le calcul des
sessions distinctes va dans `gdin-pure.js` avec ses tests.

**2. Le détecteur de doublons est faux et dessert l'utilisateur.**
Il annonce 5 693 doublons (28,1 %), dont 4 882 ateliers. Vérifié sur les
lignes brutes : sur 478 groupes d'atelier (même N° de demande + même date),
**465 ont des bénéficiaires différents** — ce sont les participants d'une même
session. Seuls 13 groupes ont le même bénéficiaire.
→ Ne pas compter les ateliers dans les doublons. Hors ateliers : **811 lignes
suspectes sur 14 748, soit 5,5 %**.
→ Le nom du bénéficiaire n'entre pas dans l'application (minimisation RGPD) :
le dashboard ne peut pas distinguer participant et doublon sur les ateliers.
C'est la raison de fond, à écrire dans l'onglet.

### Fiabilité par indicateur — mesurée, à afficher telle quelle

| Indicateur | Fiabilité | Marge | Fait mesuré |
|---|---|---|---|
| Demandes distinctes (7 271) | Solide | ±0 % | N° renseigné sur 100 % des lignes |
| Accompagnements (8 047) | Solide | −2,7 % | 219 doublons suspects |
| Prises de contact (5 444) | Solide | −1,2 % | 65 doublons |
| Ateliers | À reformuler | — | 596 sessions / 5 478 participations |
| Par lieu / CMS | Bonne | 3,1 % | 635 lignes en « Autre structure » |
| Par commune | Bonne | 1,9 % | 390 lignes hors référentiel officiel |
| Thématiques | Partielle | 24,5 % | 4 951 lignes sans thématique |
| Délais | Moyenne | 6,9 % | 1 398 réalisations antérieures à la demande |
| **Par conseiller** | **Faible** | **42,3 %** | 8 555 lignes attribuées par déduction |

Autres défauts mesurés, à lister dans l'onglet : référent absent sur 4,0 %
(813 lignes), commune absente sur 0,8 % (171), action antérieure à sa demande
sur 0,1 % (30), encodage de « Date action » réparé sur 100 % des lignes,
95 communes regroupées, 2 033 lieux lus dans la structure orienteur, 5 756
conseillers lus dans le référent.

### Décisions d'interface — validées, ne pas les rediscuter

- **Pas de marge sur chaque KPI.** Afficher « ±x % » partout décrédibilise ce
  qui est solide : le nombre de demandes est juste à 100 %. Trois niveaux :
  rien sur les indicateurs solides ; un point orange discret avec bulle au
  survol sur les indicateurs à marge connue ; un bandeau explicite sur « par
  conseiller ».
- **Bandeau « par conseiller »** : *« 42 % des attributions sont déduites du
  CMS — à ne pas présenter comme une mesure individuelle »*. Validé, à
  afficher (point le plus sensible politiquement).
- **Un onglet dédié** dans la barre latérale, qui porte le détail et la
  méthode : c'est lui qu'on ouvre si on est challengé.
- **Une ligne de synthèse sur la landing** après import : « Fiabilité : bonne
  — 3 points de vigilance ».
- **Une mention en pied du Diapo Rapport**, puisque c'est ce qui est projeté.
  `CLAUDE.md` impose la synchronisation CR ↔ Diapo Rapport : tout ajout au CR
  exige son slide dans `DR_SLIDES` + la fonction `drSlide*()` correspondante.

### Propositions pour le fichier source, par gain décroissant

À porter auprès de l'éditeur ou du service gestionnaire de l'outil de saisie.

| Action à la source | Gain mesuré |
|---|---|
| Rendre « Conseiller numérique » obligatoire | supprime 42,3 % de déduction — le plus gros gain |
| Identifiant de session d'atelier, ou champ « nombre de participants » | rend le comptage des ateliers défendable |
| Liste déroulante pour « Lieu / CMS » | supprime les 3,1 % de « Autre structure » et la dérive continue |
| Liste déroulante communes (référentiel INSEE) | supprime les 1,9 % hors référentiel |
| ~~Corriger l'encodage de « Date action »~~ — **signalé aux devs le 20/09/2026** | supprime une réparation faite à l'import sur 100 % des lignes |
| Contrôle de cohérence des dates à la saisie | supprime les 6,9 % d'incohérences chronologiques |
| Thématique obligatoire | comble 24,5 % de trous |

### Ordre de travail

1. Sessions d'atelier distinctes → `gdin-pure.js` + tests, puis affichage
   « N ateliers · M participations » partout où « Atelier » apparaît.
2. `compterDoublons()` exclut les ateliers → mettre à jour les tests existants
   (`compterDoublons`), le panneau qualité, et dire pourquoi dans l'onglet.
3. Calcul des indicateurs de fiabilité → `gdin-pure.js`, alimenté par
   `stats` de `parseRows()` + comptages sur les records. Tests obligatoires.
4. Onglet « Fiabilité des données » + ligne sur la landing.
5. Points orange et bulles sur les KPI concernés ; bandeau « par conseiller ».
6. Slide correspondant dans `DR_SLIDES` (règle CR ↔ Diapo Rapport).

**Rappel de méthode** : ne jamais afficher une marge qui ne soit pas calculée
depuis le fichier réellement importé. Un chiffre inventé ferait exactement le
contraire de ce que l'utilisateur demande.

## Chantiers restants, par priorité

1. **Indicateurs de complétion restants.** Trois occurrences basées sur
   `!r.date_action` : colonne `%` du tableau mensuel (deux fois) et KPI
   « Complétion » de la vue par conseiller. Leur valeur constante venait du
   bug d'encodage ci-dessus, désormais corrigé — à revérifier sur un import
   réel avant de conclure qu'il reste quelque chose à faire.
2. **Types absents du dropdown.** `typeFilter` ne propose que
   Accompagnement, Prise de contact, Orientation tiers et Atelier. Les types
   Pass, `Orientation vers un CN du 47` et `Autre` ne sont atteignables par
   aucune position du filtre.

## Points à ne pas défaire

- **L'attribution des conseillers reste déduite à 42,3 %** — 8 555 lignes sur
  20 226 (export de septembre). `comblerConum()` applique d'abord le référent
  réellement saisi, puis `applyConumAttrib()` comble le reste via
  `CONUM_ATTRIB`, un mapping CMS → conseiller codé en dur. Le tableau « par
  conseiller » repose donc encore largement sur une inférence, et un
  changement de secteur réécrit l'historique rétroactivement. Réponse
  retenue : le bandeau de l'onglet Fiabilité. Ne pas présenter ces chiffres
  comme une mesure individuelle.
- **`CONUM_ATTRIB` et `ORI_EXCL` contiennent des noms d'agents en clair**
  dans les HTML, donc publiés sur GitHub Pages. À arbitrer avec eux.
- **Les tests de minimisation RGPD** (`parseRows — minimisation RGPD`) sont
  ce qui empêche un champ nominatif d'entrer dans l'application. Ne jamais
  les désactiver pour faire passer un commit.
