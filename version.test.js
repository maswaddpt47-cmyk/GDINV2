'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { injecterVersion } = require('./scripts/inject-version.js');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

describe('version visible du paquet', () => {
  it('injecte la même référence dans les deux emplacements sans changer les autres parties de la page', () => {
    const apres = injecterVersion(html, '2.7', 'abcdef1234567890');
    assert.equal((apres.match(/V2\.7 · code abcdef1/g) || []).length, 2);
    assert.equal(apres.replaceAll('V2.7 · code abcdef1', 'Source non empaquetée'), html);
    assert.throws(() => injecterVersion(html, '2.7<script>', 'abcdef1'), /Numéro/);
    assert.throws(() => injecterVersion(html, '2.7', 'nom-de-branche'), /Identifiant/);
    assert.throws(() => injecterVersion(html.replaceAll('data-gdin-version', 'autre'), '2.7', 'abcdef1'), /Deux emplacements/);
  });

  it('fabrique un vrai ZIP autonome dont le nom, la page et LISEZ-MOI concordent', () => {
    const depot = fs.mkdtempSync(path.join(os.tmpdir(), 'gdin-version-'));
    const lancer = (cmd, args) => execFileSync(cmd, args, { cwd: depot, encoding: 'utf8' }).trim();
    try {
      for (const dossier of ['scripts', 'distribution', 'vendor', 'sortie']) fs.mkdirSync(path.join(depot, dossier));
      for (const fichier of ['scripts/zip-cloud.sh', 'scripts/inject-version.js', 'distribution/LISEZ-MOI.txt', 'distribution/A-LIRE-AVANT-D-OUVRIR.txt']) {
        fs.copyFileSync(path.join(__dirname, fichier), path.join(depot, fichier));
      }
      fs.writeFileSync(path.join(depot, 'distribution/VERSION.txt'), '2.7\n');
      fs.writeFileSync(path.join(depot, 'index.html'), html);
      fs.writeFileSync(path.join(depot, 'gdin-pure.js'), '// Jeu fictif, aucun usager\n');
      fs.writeFileSync(path.join(depot, 'vendor/exemple.js'), '// Bibliothèque fictive\n');
      lancer('git', ['init', '-q']);
      lancer('git', ['add', '.']);
      lancer('git', ['-c', 'user.name=Test fictif', '-c', 'user.email=test@example.invalid', 'commit', '-qm', 'fixture']);
      const revision = lancer('git', ['log', '-1', '--format=%h', '--', 'index.html', 'gdin-pure.js', 'vendor']);
      lancer('bash', ['scripts/zip-cloud.sh', 'sortie']);
      const noms = fs.readdirSync(path.join(depot, 'sortie'));
      assert.equal(noms.length, 1);
      assert.match(noms[0], new RegExp(`^GDIN_V2\\.7_\\d{4}-\\d{2}-\\d{2}_${revision}\\.zip$`));
      const archive = path.join(depot, 'sortie', noms[0]);
      const page = lancer('unzip', ['-p', archive, 'GDIN/index.html']);
      const notice = lancer('unzip', ['-p', archive, 'GDIN/LISEZ-MOI.txt']);
      assert.equal((page.match(new RegExp(`V2\\.7 · code ${revision}`, 'g')) || []).length, 2);
      assert.match(notice, new RegExp(`Paquet : V2\\.7 — code ${revision}`));
      assert.doesNotMatch(page, /Source non empaquetée|@VERSION@|@PAQUET@/);
      assert.match(lancer('git', ['show', 'HEAD:index.html']), /Source non empaquetée/);
      fs.appendFileSync(path.join(depot, 'scripts/inject-version.js'), '\n// modification non committée\n');
      assert.throws(() => lancer('bash', ['scripts/zip-cloud.sh', 'sortie']), /Modifications non commitées/);
    } finally {
      fs.rmSync(depot, { recursive: true, force: true });
    }
  });
});
