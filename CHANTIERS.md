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
l'export de **juin 2026** (22 934 lignes, 2022→2026), mesurés le 20/09/2026.

## Décision en attente — les 5 919 lignes sans CMS

L'import écarte toute ligne dont « Lieu / CMS » est vide : 5 919 sur 22 934,
soit **2 963 demandes entières absentes du dashboard** (aucune n'est
rattachable à une demande déjà présente — vérifié). La règle est isolée dans
`ECARTER_SANS_CMS` (`gdin-pure.js`), le compte rendu d'import affiche le
nombre concerné dans les deux cas.

Trois familles, à traiter différemment :

| Famille | Volume | Nature | Traitement proposé |
|---|---|---|---|
| **A** | 882 | Le CMS est renseigné dans « Structure orienteur » au lieu de « Lieu / CMS » (549 DSIAN, 333 CMS nommés). Dont 179 accompagnements et 85 prises de contact. | Lire `structure` en repli quand `lieu_raw` est vide. Correction franche, sans arbitrage. |
| **B** | ~3 900 | Cycle de vie du Pass Numérique : `Demande suivi pass (auto)`, `Suivi pass`, `Sondage pass`. Ni conseiller, ni thématique, ni lieu. | Exclure **par type d'action**, pas par champ vide. |
| **C** | ~1 100 | Ateliers et accompagnements chez des partenaires hors CMS (UNA 47, IME Montclairjoie, Collège Lucie Aubrac, CCAS, EVS…). | Conserver sous un libellé explicite, hors des vues « par CMS ». |

Le champ `structure` est déjà importé par `parseRows()`, la famille A est
donc réalisable sans toucher au mapping.

Problème annexe : le Département apparaît sous **quatre orthographes** dans
« Structure orienteur » (~1 460 lignes éclatées). À normaliser si cette
colonne est exploitée.

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
4. **Indicateurs de complétion restants.** Trois occurrences encore basées
   sur `!r.date_action`, donc à 100 % constant : colonne `%` du tableau
   mensuel (deux fois) et KPI « Complétion » de la vue par conseiller.
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
