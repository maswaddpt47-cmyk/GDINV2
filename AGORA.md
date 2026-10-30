# AGORA — GDINV2

Débats soumis à une **autre session Claude** pour contradiction. Une session
dépose ici une proposition ; une autre, qui n'a pas le même contexte, lit le
vrai code et répond. Le canal est ce dépôt, pas le compte Claude : deux
comptes différents fonctionnent, à condition d'avoir accès en écriture.

Quand soumettre, et quand ne pas le faire : voir `CLAUDE.md`, section
« AGORA ». Ce fichier-ci porte de quoi **ouvrir un bloc et y répondre**, sans
rien d'autre sous les yeux.

## La phrase de relais — elle nomme toujours le dépôt

Après avoir commité un bloc, donner à l'utilisateur cette phrase, à coller
telle quelle dans l'autre session :

> pull **maswaddpt47-cmyk/GDINV2**, lis son `AGORA.md`, réponds à AG-00N, tu
> es la session B

**Le nom du dépôt n'est pas une politesse.** Chaque projet a son propre
`AGORA.md` avec sa propre numérotation : deux dépôts peuvent porter un AG-002
sans rapport. Sans le nom, la session qui répond ouvre l'AGORA du dépôt
qu'elle a sous la main. Constaté le 22/10/2026 : une phrase sans dépôt a
envoyé le contradicteur dans MD-LIB au lieu d'ici — il y a trouvé un AG-002
déjà tranché et pas d'AG-003, et a demandé plutôt que de répondre au mauvais
bloc.

Le libellé « session B » sert à remplir le champ `Auteur`, utile à la lecture.
Ce n'est pas lui qui prouve qu'on ne répond pas à son propre bloc : c'est le
trailer `Claude-Session:` du commit qui a déposé le bloc.

## Pour répondre à un bloc

Le contradicteur **complète, il ne réécrit pas** : deux propositions
concurrentes n'augmentent pas la qualité, elles augmentent la charge
d'arbitrage de l'utilisateur. Les trois verdicts et l'exigence de preuve sont
portés par le gabarit ci-dessous, ils ne sont pas répétés ici. Les trois règles
qui, elles, ne s'en déduisent pas :

- **Jamais un bloc que l'on a soi-même ouvert.** S'auto-répondre produit un
  tampon de validation, pas une contradiction. **Avant de répondre, comparer
  le trailer `Claude-Session:` du commit qui a déposé le bloc
  (`git log -1 --format=%B <sha du bloc>`) à celui de la session courante** :
  il distingue deux sessions même sous une identité GitHub unique (vérifié le
  21/09/2026, AG-001). Le champ `Auteur` n'est qu'un libellé de lecture,
  attribué à l'oral et qui ne survit pas à un compactage de contexte — pas une
  preuve. Quand le trailer est absent (commit fait à la main, session sans
  cette consigne), demander à l'utilisateur avant de répondre.
- **Append-only** : on n'édite jamais le bloc d'un autre, on ajoute le sien.
  `git pull --rebase origin main` juste avant de pousser, et on pousse
  **directement sur `main`** — deux sessions sur deux branches ne se voient
  pas. C'est du texte, ça ne casse aucun déploiement.
- **Rien qui contienne des données d'usagers** dans un bloc : pas de ligne
  d'export, pas de motif, pas de log brut. Le dépôt est public.

## Le cycle, et pourquoi il ne bloque jamais

Une session dépose un bloc et le pousse sur `main`, puis donne à l'utilisateur
la phrase à coller dans l'autre session ; celle-ci répond ; l'utilisateur
tranche. **Aucune notification ne passe d'un compte à l'autre** — sessions,
routines planifiées et messages inter-sessions sont cloisonnés par compte. Le
relais par l'utilisateur est donc obligatoire, et c'est précisément pour ça que
l'AGORA ne bloque jamais : le travail continue en parallèle, rien ne garantit
qu'une réponse arrive un jour.

## Entretien

Un bloc tranché **sort de ce fichier** : sa conclusion remonte dans
`CHANTIERS.md` (décisions à ne pas défaire) ou dans `CLAUDE.md` si elle devient
une règle. Un bloc resté sans réponse quand le sujet revient se ferme en
« tranché sans contradiction le JJ/MM/AAAA », avec la décision retenue.

Si deux sessions campent sur leurs positions, la sortie n'est pas un troisième
avis : la question devient **quelle observation les départagerait** (une
mesure, un log, un essai court). Si aucune ne le peut, c'est un choix de goût —
l'utilisateur tranche, la raison est notée, on n'y revient plus.

### Sincérité — trois contraintes contre la politesse

Sur ATELIERS_NEWGEN, 12 blocs tranchés d'affilée ont reçu « amendé », aucun
« confirmé » ni « contredit » (27/09/2026). Un contradicteur qui n'emploie
jamais les deux autres verdicts a cessé de contredire : il rend un service de
politesse qui donne une fausse garantie.

1. **« Amendé » n'est valable que s'il nomme ce qui serait faux, manquant ou
   coûteux si la proposition était appliquée telle quelle.** Un amendement qui
   ne change ni le code, ni une décision, ni un chiffre n'est pas un
   amendement : le verdict est **« confirmé »**.
2. **« Confirmé » est une réponse pleine et utile**, pas un aveu d'inutilité :
   elle libère l'auteur pour agir. Ne jamais chercher un amendement pour
   justifier sa présence.
3. **Aucune appréciation de la proposition ni de son auteur** — ni compliment,
   ni « bien vu ». Une réponse commence par un constat : le compliment est le
   véhicule de la complaisance.

Porter le **verdict** de chaque bloc dans la liste des blocs tranchés, avec le
total des trois issues : le biais se voit alors au lieu d'être deviné.
**Le total est une alerte, pas un objectif** : ne jamais rendre « confirmé »
pour casser une série — le verdict découle de la contrainte 1 appliquée au
bloc. Une série se juge en relisant ce que chaque « amendé » a changé (code,
décision, chiffre) ; celui qui n'a rien changé était un « confirmé ».

## Contradicteur Codex — blocs de sécurité (06/10/2026)

Un bloc qui touche à la sécurité, aux mots de passe ou aux données personnelles
va à **Codex (OpenAI)**, pas à une session Claude : entre deux Claude, 0
« contredit » sur 23 blocs (ATELIERS_NEWGEN), quand Codex a trouvé en une passe
ce que Claude avait manqué. L'utilisateur colle le bloc dans Codex
(autorisations « Lecture seule », réflexion au plus haut) avec : « Réponds selon
le gabarit de AGORA.md, avec fichier:ligne ; ne modifie rien. » La session qui a
ouvert le bloc inscrit la réponse **telle quelle** sous
`### Réponse — Codex — JJ/MM/AAAA`, sans la reformuler ni la juger ;
l'utilisateur tranche. Codex ne modifie jamais le code — **sauf demande
explicite de l'utilisateur** (29/10/2026, retrait du `motif` et de
l'import/export JSON) : Claude relit alors le diff de Codex avant publication.
Règle complète : MD-LIB `agora.md` §12.

**Phrase de relais pour Codex** (décision de l'utilisateur, 29/10/2026 : recopier ses
réponses à la main ne se justifiait plus). Elle remplace « ne modifie rien » :

> pull **maswaddpt47-cmyk/GDINV2**, lis son `AGORA.md`, réponds à AG-00N.
> Autorisation exceptionnelle de l'utilisateur : tu peux modifier **un seul fichier,
> `AGORA.md`**, en y **ajoutant** ta réponse sous le bloc (`### Réponse — Codex —
> JJ/MM/AAAA`, gabarit du fichier, avec fichier:ligne). N'édite aucun autre bloc ni
> aucun autre fichier. Commite et pousse directement sur `main`.

Codex doit alors pouvoir écrire (lever « Lecture seule » pour cette passe). Avant de
commenter sa réponse, la session Claude contrôle `git show --stat <sha>` : seul
`AGORA.md` est touché, et `git diff` n'ajoute que des lignes (aucun bloc existant
modifié). Sinon, annuler le commit et inscrire la réponse à la main. Le code reste
interdit à Codex.

## Gabarit

```markdown
## AG-001 — Titre court — ouvert le JJ/MM/AAAA
**Auteur** : session <libellé donné par l'utilisateur> — lu sur `<sha court>`
**Proposition** : ce qui est proposé, en 3 lignes maximum.
**Critère déclencheur** : n° et lequel.
**Ce que ça engage** : ce qui serait coûteux à défaire.
**Non vérifié par l'auteur** : le champ le plus important — où l'auteur est
faible, pour orienter le contradicteur au lieu de le laisser chercher.
**Si personne ne répond, je fais quoi ?** — si c'est « je continue pareil », le
bloc n'avait pas lieu d'être.
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

_Aucun bloc ouvert._

---

## Blocs tranchés

- **AG-004, AG-008, AG-009** — Quels chiffres du bilan peut-on justifier avant
  projection, et les corrections sont-elles justes ? **Clos le 30/10/2026 sur
  décision de l'utilisateur, avec réserves.** Relevé « affiché / recompté / écart »
  sur **un seul couple** (un conseiller × CMS de Marmande × 2025, 222
  accompagnements) : 31 lignes sur 33 à écart nul, deux écarts de sens. Cinq
  définitions tranchées par l'utilisateur et corrigées (`46b6528`, `1a40a80`,
  `e1b4f8c`, `240e409`, `a49ca84`, sélecteur d'année `f09f964`) : contrôle sans
  population « non applicable » ; évolution annuelle sur les accompagnements seuls,
  année en cours comparée à la même date ; **orienteurs : 23**, hors conseillers,
  partout ; période de couverture = années cochées ; mention au-delà de 25 % de
  lignes déduites. Codex a relu trois fois, verdict amendé à chaque fois (`7440ab2`
  = AG-008, `3df216b` et `740b68a` = AG-009) : cas oubliés corrigés (`427bd8c`…
  `53c70b3`) ; la seconde passe a trouvé une **régression du sélecteur** (100 % et
  rang 1/1 au lieu de 43 % et 2/2 pour un conseiller présent dans deux CMS),
  corrigée par `8b135f6` avec un test navigateur dont la contre-preuve échoue sur
  l'ancien code — **cette dernière correction n'a pas été relue par Codex**.
  Diagnostic des communes (`a83c7b0`, script `scripts/diag-communes.js`) : 31
  groupes = 28 communes du référentiel (218 lignes) + 3 libellés non rattachés
  (`MARAMNDE`, `FOURQUES`, `MAUROUX`, 4 lignes) ; l'écart macro 32 / 31 vient de
  `St bazeille`, que la macro sépare de Sainte-Bazeille.
  **Réserves, non levées par la clôture** : les 12 lignes de l'ancien écart
  412 / 400, jamais expliquées ; l'export réel complet non mesuré ; **aucun autre
  couple relevé**, d'abord ceux à 53-91 % de lignes déduites ; l'écart 37 / 35 des
  graphies de communes ; la mention de bornes qui exige deux dates de filtre ; le
  test d'ancienne base qui modifie `DATA` sans passer par une sauvegarde. La macro
  de recomptage, écrite par la même session, ne vaut pas validation indépendante.
  **Rouvrir** (nouveau bloc, critère 7, contradicteur Codex) avant toute diffusion
  de chiffres aux élus : relevé d'autres couples et audit Codex de l'export réel
  (`chiffres-diffuses.md`). Texte complet des trois blocs et des réponses :
  `git log -p AGORA.md` (dernier état : `a83c7b0`).

- **AG-007** — Retirer le motif et les fichiers JSON sans perdre l'historique.
  **Clos le 29/10/2026 sur décision de l'utilisateur, verdict de la session B :
  amendé.** Le retrait (`539f74b`) est conforme au bloc, la suite navigateur
  avait bien tourné en CI. Un défaut démontré : sans date d'action, le repli de
  `cleDoublon()` ignorait le N° de demande, donc deux demandes distinctes du
  même jour, conseiller et orienteur comptaient comme « doublon suspect »,
  chiffre affiché jusque dans le Diapo rapport. **Tranché : non, ce n'est pas un
  doublon** ; le N° entre dans la clé, intitulé du panneau aligné, test
  « deux N° distincts → 0 » (`719fd2d`). Perte assumée : une même demande saisie
  sous deux numéros n'est plus repérée. Consigne « autre poste » : tous les
  fichiers source dans l'ordre, ou un seul export couvrant la période
  (`d7f8bca`, consigne V0.3), zip et V0.3 déposés sur le cloud le 29/10/2026
  (*déclaré, non vérifié*). **Non mesuré** : l'effet sur l'export réel
  (`npm run audit -- export.xls`, ligne des doublons qualité). Texte complet et
  réponse : `git log -p AGORA.md`.

- **AG-002** — Un total arrêté à une date n'est pas stable. **Clos le
  29/10/2026 sur décision de l'utilisateur.** Volet A en place depuis le
  22/10/2026 : `mentionRevisabilite()` (période, date du dernier import,
  « chiffres susceptibles d'être révisés ») sur la Vue globale, le Rapport et
  la couverture du Diapo Rapport. **Volets B (archivage des bilans diffusés) et
  C (mode « arrêté au ») abandonnés** : aucun archivage n'est créé, les deux
  questions au référent archives et au DPO (où, combien de temps) sont sans
  objet. Contre-intuitif à garder : la clôture est **sans leurs réponses** ; un
  bilan déjà diffusé ne se reproduit donc pas, et l'export JSON qui en portait
  les données est retiré (AG-007). **Rouvrir seulement sur fait nouveau** : une
  demande de reproduire un bilan diffusé, ou une consigne du référent archives.
  Texte complet du bloc et réponse de Codex : `git log -p AGORA.md`.

- **AG-006** — Un chiffre animé peut-il partir faux ? **Tranché le 28/10/2026,
  verdict de Codex : amendé** (texte complet : `git log -p AGORA.md`,
  `f19dd90`). Deux défauts démontrés, corrigés sur décision de l'utilisateur :
  la mémoire des valeurs confondait deux indicateurs au même rang de deux
  diapositives (1125 % affichés avant 75 %, reproduit dans le navigateur) →
  identité = emplacement + libellé + unité (`7fe0f10`) ; le mouvement réduit
  laissait l'animation de création des graphes → `Chart.defaults.animation`
  suit le réglage (`a078dd7`). Trouvé en vérifiant : une image horodatée avant
  le départ faisait dépasser la valeur de départ → plancher à 0 (`204cdc9`).
  **Accepté par l'utilisateur** : une copie ou une capture faite pendant le
  comptage (moins d'une seconde) peut contenir un chiffre intermédiaire ; le
  PDF, lui, est protégé et testé. Ctrl+P n'imprime pas l'écran courant :
  limite antérieure aux animations.

- **AG-005** — Faut-il supprimer les deux derniers appels réseau en passant la
  carte en vectoriel ? **Tranché le 27/10/2026 : non, on ne fait rien.**
  Décision de l'utilisateur, après contradiction de Codex et mesures.
  La raison tient en une phrase : **ces deux appels ne présentent aucun risque
  de fuite**. `TUILES_URL` et l'URL de `geo.api.gouv.fr` sont des chaînes
  littérales sans interpolation ; aucune ligne de code ne les construit à
  partir des données. Ce qui part est l'adresse IP de sortie — celle d'un
  agent, pas d'un usager, vers deux destinataires en UE — et, pour les tuiles,
  la zone de carte affichée. Restaient deux arguments réels mais jugés
  insuffisants : ne plus exposer cette IP (conformité) et ne plus dépendre
  d'un service qui peut fermer son accès (ce qui s'est produit avec CARTO le
  20/09/2026). **Ne pas rouvrir sans fait nouveau** : une fermeture d'accès
  d'OSM France, un filtrage par la DSI, ou une demande formelle de « zéro
  tiers ».
  Ce que le bloc a réellement produit n'était pas la carte : Codex y a trouvé
  une **injection HTML par `lieu_raw`**, corrigée le jour même (`949d2dd`),
  et proposé la **CSP** (`7ef5ff3`). Les deux sont en ligne. La faille
  n'avait aucun rapport avec les appels externes — elle venait d'un fichier
  importé et aurait existé sans eux.

- **AG-003** — « Thématique dominante » compte-t-il des demandes ? Tranché le
  22/10/2026 : non. `countThemas()` compte **la mention d'une thématique** —
  pas une ligne, jamais une demande distincte, et sans aucune déduplication.
  Confirmé par Codex sur le code et par reproduction, avec le rappel que
  l'argument « +120 contre +70 est impossible » ne prouvait rien. Calcul
  conservé, **12 libellés** passés à « mentions » (Codex en avait listé 8 ; les
  quatre autres disaient « participations », « % des demandes » ou n'avaient
  pas d'unité). L'unité est désormais écrite au-dessus de `countThemas()` dans
  `gdin-pure.js` : c'est là que le prochain lecteur la cherchera, et aucun test
  ne peut la verrouiller sans suivre les variables d'appel. Détail dans
  `git log`.
  **Remplacé par AG-004 (décision de l'utilisateur du 22/10/2026, `6b77162`)** :
  `countThemas()` compte désormais une thématique **une fois par ligne**, et
  ses pourcentages se disent « % des accompagnements » (toutes les lignes au
  dénominateur). Ne pas revenir aux « mentions » sur la foi de ce résumé.
- **AG-001** — Que doit contenir un `AGORA.md` de projet. Tranché le
  21/09/2026 : la section « Pour répondre à un bloc » reste, le gabarit seul ne
  porte pas les règles qui ont réellement servi. Conclusion remontée dans
  `CHANTIERS.md`. Détail dans `git log` (`a1f0ac3`, `2351a0f`).
