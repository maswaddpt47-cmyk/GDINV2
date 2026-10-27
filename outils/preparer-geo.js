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

// ── Simplification des tracés (Douglas-Peucker) ────────────────────────────
// Les contours de l'IGN ont une précision métrique. Sur une carte
// départementale affichée sur un écran, un pixel vaut environ 100 m : tout
// détail plus fin est invisible et ne fait que peser dans le fichier.
// La tolérance est en degrés ; à cette latitude 0,0005° valent environ 50 m.
function distancePerp(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  if (dx === 0 && dy === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  const t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy);
  const u = Math.max(0, Math.min(1, t));
  return Math.hypot(p[0] - (a[0] + u * dx), p[1] - (a[1] + u * dy));
}
function simplifierLigne(pts, tol) {
  if (!Array.isArray(pts) || pts.length <= 2) return pts;
  let iMax = 0, dMax = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = distancePerp(pts[i], pts[0], pts[pts.length - 1]);
    if (d > dMax) { dMax = d; iMax = i; }
  }
  if (dMax <= tol) return [pts[0], pts[pts.length - 1]];
  const g = simplifierLigne(pts.slice(0, iMax + 1), tol);
  const d = simplifierLigne(pts.slice(iMax), tol);
  return g.slice(0, -1).concat(d);
}
// Un anneau fermé qui tomberait sous 4 points ne serait plus une surface :
// on le garde tel quel plutôt que de faire disparaître une commune.
function simplifierAnneau(anneau, tol) {
  const s = simplifierLigne(anneau, tol);
  return s.length >= 4 ? s : anneau;
}
function simplifierGeometrie(g, tol) {
  if (!g || !tol) return g;
  if (g.type === 'Polygon') return { type: 'Polygon', coordinates: g.coordinates.map(a => simplifierAnneau(a, tol)) };
  if (g.type === 'MultiPolygon') return { type: 'MultiPolygon', coordinates: g.coordinates.map(p => p.map(a => simplifierAnneau(a, tol))) };
  return g;
}
function arrondirGeometrie(g, dec) {
  const r = c => [+c[0].toFixed(dec), +c[1].toFixed(dec)];
  if (!g) return g;
  if (g.type === 'Polygon') return { type: 'Polygon', coordinates: g.coordinates.map(a => a.map(r)) };
  if (g.type === 'MultiPolygon') return { type: 'MultiPolygon', coordinates: g.coordinates.map(p => p.map(a => a.map(r))) };
  return g;
}
function compterPoints(fc) {
  let n = 0;
  for (const f of fc.features) {
    const g = f.geometry; if (!g) continue;
    const anneaux = g.type === 'Polygon' ? g.coordinates : (g.type === 'MultiPolygon' ? g.coordinates.flat() : []);
    for (const a of anneaux) n += a.length;
  }
  return n;
}

// ── Contours ───────────────────────────────────────────────────────────────
const brutT = lire(fContours);
if (brutT.type !== 'FeatureCollection' || !Array.isArray(brutT.features)) sortir(`${fContours} n'est pas un FeatureCollection`);
if (brutT.features.length < 300) sortir(`seulement ${brutT.features.length} contours — le 47 en compte plus de 300`);
// On ne garde que nom et code : tout le reste est du poids inutile dans le dépôt.
// Tolérance réglable : node outils/preparer-geo.js <c> <g> [tolérance]
// Par défaut AUCUNE simplification. Mesuré le 27/10/2026 : simplifier chaque
// commune indépendamment désaligne les frontières qu'elles PARTAGENT, et des
// fentes blanches s'ouvrent entre communes voisines dès le zoom cantonal —
// invisibles à l'échelle du département, criantes au-delà. Ne passer une
// tolérance que si le zoom de la carte est bridé en conséquence, ou après
// être passé à une simplification topologique (TopoJSON), qui traite une
// frontière partagée une seule fois.
const TOL = process.argv[4] !== undefined ? Number(process.argv[4]) : 0;
if (!isFinite(TOL) || TOL < 0) sortir(`tolérance invalide : ${process.argv[4]}`);
// 5 décimales ≈ 1 m, 4 ≈ 11 m. Quatre suffisent largement et allègent de
// 30 % sans toucher à la géométrie, donc sans créer de fente.
const DEC = process.argv[5] !== undefined ? Number(process.argv[5]) : 4;
const avant = compterPoints(brutT);
const contours = {
  type: 'FeatureCollection',
  features: brutT.features.map(f => ({
    type: 'Feature',
    properties: { nom: f.properties && f.properties.nom, code: f.properties && f.properties.code },
    geometry: arrondirGeometrie(simplifierGeometrie(f.geometry, TOL), DEC),
  })),
};
const apres = compterPoints(contours);

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
console.log('  tolérance ' + TOL + '° · points ' + avant + ' → ' + apres + ' (' + Math.round(100 - apres / avant * 100) + ' % en moins)');
