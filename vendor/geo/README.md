# vendor/geo/ — référentiel géographique du Lot-et-Garonne

Ce dossier est **vide tant que les données n'ont pas été déposées**. Il
accueille `geo47.js`, qui doit permettre à la carte de fonctionner sans
appeler `geo.api.gouv.fr` ni un service de tuiles.

## Pourquoi un fichier `.js` et pas un `.json`

L'application est aussi utilisée **depuis une copie locale** (`file://`).
Dans ce mode l'origine de la page est `null` et un `fetch()` vers un fichier
local est refusé par le navigateur : un `.json` serait inutilisable. Un
`<script src>` fonctionne dans les deux cas. `geo47.js` définit donc
`globalThis.GEO47 = { centres, contours }`.

## Déposer les données

Ouvrir chaque adresse dans un navigateur et enregistrer la page (Ctrl+S) :

```
https://geo.api.gouv.fr/departements/47/communes?fields=nom,code,centre&format=json&geometry=centre
https://geo.api.gouv.fr/departements/47/communes?fields=nom,code,contour&format=geojson&geometry=contour
```

Puis, depuis la racine du dépôt :

```bash
node outils/preparer-geo.js <centres.json> <contours.geojson>
```

Le script écrit `vendor/geo/geo47.js`, ne conserve que `nom` et `code` comme
propriétés, et **échoue** si une propriété inattendue apparaît ou si le compte
de communes est anormalement bas. Les deux fichiers téléchargés n'ont pas à
être commités, seul le produit l'est.

## Source et licence

`geo.api.gouv.fr` (API Découpage administratif, DINUM), alimentée par l'INSEE
et l'IGN. Données publiques sous Licence Ouverte. **Ne pas** utiliser de
republication tierce sans licence explicite : un jeu daté de 2018 a été écarté
pour cette raison le 27/10/2026.

## À régénérer

Après toute évolution du découpage communal (fusions de communes). Le fichier
porte un millésime implicite : noter la date de génération dans le commit.

## Poids, et pourquoi on ne simplifie pas

Mesuré le 27/10/2026 sur un jeu équivalent de 319 communes, avec 4 décimales :

| Tolérance | Poids | Rendu |
|---|---|---|
| aucune (défaut) | 442 Ko | intact |
| 50 m | 312 Ko | fentes discrètes entre communes |
| 100 m | 216 Ko | fentes visibles |
| 200 m | 150 Ko | fentes marquées |

`preparer-geo.js` accepte une tolérance en quatrième argument, mais **n'en
applique aucune par défaut**. La raison est visuelle : chaque commune est
simplifiée indépendamment, donc les deux versants d'une frontière partagée
cessent de coïncider et une fente blanche s'ouvre entre communes voisines.
Invisible à l'échelle du département, criant dès le zoom cantonal — et la
carte Territoire autorise aujourd'hui le zoom maximal.

Deux façons de gagner ce poids sans ce défaut : brider le zoom de la carte, ou
passer à une simplification topologique (TopoJSON), qui traite une frontière
partagée une seule fois. Les deux restent à arbitrer.

Ne jamais réduire le **nombre** de communes pour gagner du poids : une commune
absente disparaît de la carte sans aucun message.
