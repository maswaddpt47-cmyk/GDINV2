#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

// Même fabrication pour Pages et pour le ZIP ; aucune lecture réseau au démarrage.
function injecterVersion(html, numero, revision) {
  if (!/^\d+(?:\.\d+){1,2}$/.test(numero)) throw new Error('Numéro de paquet invalide');
  if (!/^[a-f0-9]{7,40}$/.test(revision)) throw new Error('Identifiant de code invalide');
  const marqueur = /(<(?:span|div)\b[^>]*\bdata-gdin-version\b[^>]*>)[^<]*(<\/(?:span|div)>)/g;
  const emplacements = [...html.matchAll(marqueur)].length;
  if (emplacements !== 2) throw new Error(`Deux emplacements de version attendus, trouvé ${emplacements}`);
  return html.replace(marqueur, `$1V${numero} · code ${revision.slice(0, 7)}$2`);
}

if (require.main === module) {
  try {
    const [fichier, revision] = process.argv.slice(2);
    if (!fichier || !revision) throw new Error('Usage : node scripts/inject-version.js index.html <commit>');
    const numero = fs.readFileSync(path.join(__dirname, '../distribution/VERSION.txt'), 'utf8').trim();
    const html = fs.readFileSync(fichier, 'utf8');
    fs.writeFileSync(fichier, injecterVersion(html, numero, revision));
  } catch (erreur) {
    process.stderr.write(`${erreur.message}\n`);
    process.exitCode = 1;
  }
}

module.exports = { injecterVersion };
