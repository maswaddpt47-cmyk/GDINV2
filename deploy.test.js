/**
 * Garde-fou sur le déploiement.
 *
 * Le cache-busting est appliqué par .github/workflows/deploy.yml, qui ajoute
 * ?v=<sha> aux URLs locales d'index.html au moment du déploiement. Si le
 * <head> est réécrit dans une forme que son expression ne reconnaît plus, le
 * sed ne remplace plus rien — sans erreur, sans alerte — et les navigateurs
 * repartent sur l'ancien gdin-pure.js après chaque correctif.
 *
 * Ces tests reproduisent la transformation et vérifient qu'elle mord encore.
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');

const HTML = fs.readFileSync(require('path').join(__dirname, 'index.html'), 'utf8');
const WORKFLOW = fs.readFileSync(require('path').join(__dirname, '.github/workflows/deploy.yml'), 'utf8');

// Même expression que le workflow.
const MOTIF = /(<(?:script src|link rel="stylesheet" href)="(?:gdin-pure\.js|vendor\/[^"?]+))"/g;

describe('cache-busting au déploiement', () => {
  it('le head expose les assets locaux dans la forme attendue', () => {
    const trouves = HTML.match(MOTIF) || [];
    assert.ok(trouves.length >= 6, `attendu au moins 6 assets locaux, trouvé ${trouves.length}`);
  });

  it('gdin-pure.js est couvert — c\'est le fichier qui change le plus souvent', () => {
    assert.match(HTML, /<script src="gdin-pure\.js"><\/script>/);
  });

  it('la transformation ajoute bien une version à chaque asset', () => {
    const apres = HTML.replace(MOTIF, '$1?v=test123"');
    const versionnes = (apres.match(/\?v=test123"/g) || []).length;
    assert.equal(versionnes, (HTML.match(MOTIF) || []).length);
  });

  it('elle ne touche à rien d\'autre', () => {
    const apres = HTML.replace(MOTIF, '$1?v=test123"');
    assert.equal(apres.replace(/\?v=test123/g, ''), HTML);
  });

  it('le fichier source reste sans version figée', () => {
    // La version vient du déploiement. Une version écrite en dur ne serait
    // jamais incrémentée et le cache-busting serait illusoire.
    assert.doesNotMatch(HTML, /(?:gdin-pure\.js|vendor\/[^"]+)\?v=/);
  });

  it('le workflow injecte toujours la version avant de publier', () => {
    assert.match(WORKFLOW, /GITHUB_SHA::7/);
    assert.ok(
      WORKFLOW.indexOf('Injecter la version') < WORKFLOW.indexOf('upload-pages-artifact'),
      'l\'injection doit précéder la publication',
    );
  });
});
