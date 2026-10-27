#!/usr/bin/env node
// Transforme les deux fichiers téléchargés depuis geo.api.gouv.fr en un seul
// fichier JS chargeable par <script src>, et non par fetch() : en file://
// l'origine de la page est « null » et un fetch d'un fichier local est refusé,
// ce qui casserait l'usage sur clé USB. Un <script> fonctionne partout.
//
//   node outils/preparer-geo.js <centres.json> <contours.geojson>
//
// Produit vendor/geo/geo47.js, qui définit la constante GEO47.
'use strict';
const fs = require('fs'), path = require('path');

const sortir = (m) => { console.error('✗ ' + m); process.exit(1); };
const [, , fCentres, fContours] = process.argv;
if (!fCentres || !fContours) sortir('usage : node outils/preparer-geo.js <centres.json> <contours.geojson>');

const lire = (f) => {
  let t; try { t = fs.readFileSync(f, 'utf-8'); } catch (e) { sortir(`illisible : ${f}`); }
  try { return JSON.parse(t); } catch (e) { sortir(`pas du JSON valide : ${f} (${e.message})`); }
};

// ── Centres ────────────────────────────────────────────────────────────────
const brutC = lire(fCentres);
const liste = Array.isArray(brutC) ? brutC : (brutC.features || []);
if (!liste.length) sortir(`aucune commune dans ${fCentres}`);
const centres = {};
for (const c of liste) {
  const nom = c.nom || (c.properties && c.properties.nom);
  const g = c.centre || c.geometry;
  if (!nom || !g || !Array.isArray(g.coordinates)) continue;
  const [lon, lat] = g.coordinates;
  if (typeof lat !== 'number' || typeof lon !== 'number') continue;
  centres[String(nom).toUpperCase()] = [+lat.toFixed(4), +lon.toFixed(4)];
}
if (Object.keys(centres).length < 300) sortir(`seulement ${Object.keys(centres).length} centres retenus — le 47 en compte plus de 300`);

// ── Contours ───────────────────────────────────────────────────────────────
const brutT = lire(fContours);
if (brutT.type !== 'FeatureCollection' || !Array.isArray(brutT.features)) sortir(`${fContours} n'est pas un FeatureCollection`);
if (brutT.features.length < 300) sortir(`seulement ${brutT.features.length} contours — le 47 en compte plus de 300`);
// On ne garde que nom et code : tout le reste est du poids inutile dans le dépôt.
const contours = {
  type: 'FeatureCollection',
  features: brutT.features.map(f => ({
    type: 'Feature',
    properties: { nom: f.properties && f.properties.nom, code: f.properties && f.properties.code },
    geometry: f.geometry,
  })),
};

// ── Contrôle de minimisation : rien d'autre que du géographique ────────────
const AUTORISES = new Set(['nom', 'code']);
for (const f of contours.features) {
  for (const k of Object.keys(f.properties)) {
    if (!AUTORISES.has(k)) sortir(`propriété inattendue « ${k} » dans les contours — vérifier la source`);
  }
}

const sortie = path.join(__dirname, '..', 'vendor', 'geo', 'geo47.js');
const js = '// Généré par outils/preparer-geo.js — ne pas éditer à la main.\n'
  + '// Source : geo.api.gouv.fr (Licence Ouverte). Régénérer après toute\n'
  + '// évolution du découpage communal.\n'
  + '// globalThis : utilisable par <script src> dans le navigateur ET\n'
  + '// vérifiable depuis Node, ce qu\'un const ne permet pas.\n'
  + 'globalThis.GEO47=' + JSON.stringify({ centres, contours }) + ';\n';
fs.writeFileSync(sortie, js);

const ko = (n) => (n / 1024).toFixed(0) + ' Ko';
console.log('✓ ' + sortie);
console.log('  ' + Object.keys(centres).length + ' centres · ' + contours.features.length + ' contours · ' + ko(js.length));
