// Revue de sens — contrôle statique d'index.html.
//
// Les défauts trouvés le 21/09/2026 étaient tous de la même famille : le
// graphe calculait juste mais racontait faux. Aucun test de calcul ni de DOM
// ne pouvait les voir, parce qu'ils ne savent pas ce qu'un graphe est censé
// signifier. Ce fichier encode les trois règles de lecture qui en sont
// sorties. Il lit le source, ne lance aucun navigateur, et tourne en
// millisecondes.
//
// Une alerte ici n'est pas forcément un bug : c'est un endroit où le titre et
// le contenu peuvent diverger. Chaque exception est inscrite nommément avec sa
// raison — c'est ce qui rend ce contrôle utile plutôt que bruyant.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const SRC = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// Découpe la configuration de chaque graphe.
//
// Attention : les séries sont souvent construites AVANT l'appel `new Chart`,
// dans une variable (`const areaDatasets = ...`). Une fenêtre qui part de
// `new Chart(` ne les voit pas — c'est ce qui rendait la règle « courbe
// empilée » inopérante quand on l'a éprouvée le 21/09/2026. La fenêtre
// remonte donc jusqu'au `destroyChart('<id>')` qui précède, ou à défaut de
// 2500 caractères en amont.
function graphes() {
  const re = /(?:charts|drCharts)\['([a-zA-Z0-9-]+)'\]\s*=\s*new Chart\(/g;
  const pos = [];
  let m;
  while ((m = re.exec(SRC))) pos.push({ i: m.index, id: m[1] });
  return pos.map((p, k) => {
    const ancre = SRC.lastIndexOf(`destroyChart('${p.id}')`, p.i);
    const debut = ancre >= 0 && p.i - ancre < 4000 ? ancre : Math.max(0, p.i - 2500);
    const bloc = SRC.slice(debut, k + 1 < pos.length ? pos[k + 1].i : p.i + 4000);
    return {
      id: p.id,
      type: (bloc.match(/type:'([a-z]+)'/) || [, '?'])[1],
      empile: /stacked:true/.test(bloc) || /stack:'/.test(bloc),
      rempli: /fill:true/.test(bloc),
    };
  });
}

// Titre de carte qui précède chaque support de données : <canvas>, mais aussi
// les listes à barres, qui portent des titres tout aussi affirmatifs.
function titres() {
  const out = {};
  const supports = /<(?:canvas|div class="bar-list") id="([a-zA-Z0-9-]+)"|<div id="([a-zA-Z0-9-]+)" class="bar-list"/g;
  for (const m of SRC.matchAll(supports)) {
    const id = m[1] || m[2];
    const amont = SRC.slice(Math.max(0, m.index - 900), m.index);
    const t = [...amont.matchAll(/card-title"[^>]*>([\s\S]*?)<\/div>/g)];
    const brut = t.length ? t[t.length - 1][1] : '';
    out[id] = {
      texte: brut.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
      // Un mot rendu par <span id="tt-..."> est réécrit à chaque rendu.
      dynamique: /id="tt-[a-z-]+"/.test(brut),
    };
  }
  return out;
}

describe('Revue de sens — lecture des graphes', () => {

  it('aucune courbe empilée : la hauteur se lirait comme une valeur', () => {
    // « Volume par CMS » était en aires empilées : la courbe du haut valait le
    // total des six CMS, pas le volume du sien, et toutes reprenaient la forme
    // du total. Dans une barre segmentée le découpage reste visible ; dans une
    // courbe, non.
    const fautifs = graphes()
      .filter((g) => g.type === 'line' && g.empile)
      .map((g) => g.id);
    assert.deepEqual(fautifs, [],
      'courbe(s) empilée(s) : passer en barres, ou retirer stacked/stack/fill');
  });

  it('aucun titre n\'affirme un type d\'action que le filtre peut démentir', () => {
    // Le filtre « Type d'action » vaut « Accompagnement » par défaut mais se
    // change. Un titre écrit en dur ment dès qu'on en choisit un autre.
    // Exceptions admises, chacune pour une raison vérifiée :
    const ADMIS = new Map([
      // Onglet Ateliers : les données y sont des ateliers par construction.
      ['ch-atl-evol', 'onglet Ateliers, données filtrées sur Atelier'],
      ['ch-atl-yoy', 'onglet Ateliers, données filtrées sur Atelier'],
      // « Demandes » est générique : il couvre tous les types.
      ['ch-global-evol', '« demandes » ne désigne pas un type précis'],
      ['ch-etat', '« demandes » ne désigne pas un type précis'],
      ['ch-ori-bar', '« demandes » ne désigne pas un type précis'],
      // Alimentés hors filtre de type, et le disent dans leur titre.
      ['ch-type-monthly', 'ignore le filtre de type, mention dans le titre'],
      ['ch-types', 'ignore le filtre de type, mention dans le titre'],
      // Le panneau États ne porte que des accompagnements par construction.
      ['ch-act-monthly', 'ACTIONS_DATA ne contient que des accompagnements'],
      ['ch-act-yoy', 'ACTIONS_DATA ne contient que des accompagnements'],
      ['ch-rpt-act-monthly', 'ACTIONS_DATA ne contient que des accompagnements'],
      ['ch-rpt-act-rvn', 'ACTIONS_DATA ne contient que des accompagnements'],
      ['ch-dr-yoy-nr', 'ACTIONS_DATA ne contient que des accompagnements'],
      ['ch-dr-rvn', 'ACTIONS_DATA ne contient que des accompagnements'],
    ]);
    // Un type nommé explicitement, hors mots génériques.
    const TYPE = /accompagnement|atelier|participation|prise de contact|prescription de pass/i;
    const t = titres();
    const fautifs = Object.entries(t)
      .filter(([id, o]) => o.texte && TYPE.test(o.texte) && !ADMIS.has(id) && !o.dynamique)
      .map(([id, o]) => `${id} → « ${o.texte.slice(0, 60)} »`);
    assert.deepEqual(fautifs, [],
      'titre figé sur un type : le rendre dynamique via libelleLignes(), ou l\'inscrire dans ADMIS avec sa raison');
  });

  it('tout graphe alimenté hors filtres le dit dans son titre', () => {
    // Un écran qui ignore les filtres pendant que le reste les suit donne deux
    // chiffres contradictoires sans que rien ne le signale.
    const HORS_FILTRES = ['ch-saison', 'ch-cms-saison'];
    const t = titres();
    const muets = HORS_FILTRES.filter(
      (id) => !/ind[ée]pendant des filtres|toutes donn[ée]es|ignore le filtre/i
        .test((t[id] && t[id].texte) || ''));
    assert.deepEqual(muets, [],
      'graphe hors filtres sans mention dans son titre');
  });

});
