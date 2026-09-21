# AGORA — GDINV2

Débats soumis à une **autre session Claude** pour contradiction. Une session
dépose ici une proposition ; une autre, qui n'a pas le même contexte, lit le
vrai code et répond. Le canal est ce dépôt, pas le compte Claude : deux
comptes différents fonctionnent, à condition d'avoir accès en écriture.

Quand soumettre, et quand ne pas le faire : voir `CLAUDE.md`, section
« AGORA ». Ce fichier-ci porte de quoi **ouvrir un bloc et y répondre**, sans
rien d'autre sous les yeux.

## Pour répondre à un bloc

- **Jamais un bloc que l'on a soi-même ouvert.** S'auto-répondre produit un
  tampon de validation, pas une contradiction. Dans le doute — reprise de
  session, résumé de contexte, changement de compte — demander à
  l'utilisateur avant de répondre. Le champ `Auteur` est la seule distinction
  disponible quand les deux sessions poussent sous la même identité GitHub.
- **Compléter, pas réécrire.** Deux propositions concurrentes n'augmentent pas
  la qualité, elles augmentent la charge d'arbitrage. Trois issues, jamais
  « d'accord / pas d'accord » : **confirmé** (en disant ce qui n'a pas pu être
  vérifié), **amendé** (la proposition tient, il manque X — l'issue la plus
  fréquente et la plus utile), **contredit** (avec le constat qui le prouve).
- **Une réponse sans `fichier:ligne`, mesure ou log ne compte pas.** Sans
  preuve, deux textes s'accordent poliment et on obtient une fausse garantie.
- **Append-only** : on n'édite jamais le bloc d'un autre, on ajoute le sien.
  `git pull --rebase origin main` juste avant de pousser, et on pousse
  **directement sur `main`** — deux sessions sur deux branches ne se voient
  pas. C'est du texte, ça ne casse aucun déploiement.
- **Rien qui contienne des données d'usagers** dans un bloc : pas de ligne
  d'export, pas de motif, pas de log brut. Le dépôt est public.

## Entretien

Un bloc tranché **sort de ce fichier** : sa conclusion remonte dans
`CHANTIERS.md` (décisions à ne pas défaire) ou dans `CLAUDE.md` si elle devient
une règle. Un bloc resté sans réponse quand le sujet revient se ferme en
« tranché sans contradiction le JJ/MM/AAAA », avec la décision retenue.

Si deux sessions campent sur leurs positions, la sortie n'est pas un troisième
avis : la question devient **quelle observation les départagerait** (une
mesure, un log, un essai court). Si aucune ne le peut, c'est un choix de goût —
l'utilisateur tranche, la raison est notée, on n'y revient plus.

## Gabarit

```markdown
## AG-001 — Titre court — ouvert le JJ/MM/AAAA
**Auteur** : session <libellé donné par l'utilisateur> — lu sur `<sha court>`
**Proposition** : ce qui est proposé, en 3 lignes maximum.
**Critère déclencheur** : n° et lequel.
**Ce que ça engage** : ce qui serait coûteux à défaire.
**Non vérifié par l'auteur** : le champ le plus important — où l'auteur est
faible, pour orienter le contradicteur au lieu de le laisser chercher.
**Où regarder** : gdin-pure.js:120-180

### Réponse — JJ/MM/AAAA
**Auteur** : session <autre libellé> — lu sur `<sha court>`
**Verdict** : confirmé | amendé | contredit
**Constat** : avec fichier:ligne, mesure ou log.
**Amendement** : ...

### Tranché le JJ/MM/AAAA — décision : ...
```

`lu sur <sha court>` (`git log --oneline -1`) : une réponse écrite sur un état
du code différent de la proposition ne vaut pas grand-chose, et c'est invisible
autrement.

---

## Blocs ouverts

Aucun.
