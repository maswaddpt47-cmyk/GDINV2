/**
 * Tests E2E — GDIN
 * Lance le dashboard dans un vrai navigateur et vérifie les comportements UI.
 * Ces tests couvrent ce que gdin-pure.test.js ne peut PAS tester :
 * navigation, affichage après import, redirections, KPIs visibles.
 *
 * Lancer : npx playwright test tests-e2e.spec.js
 */

const { test, expect } = require('@playwright/test');
const path = require('path');

const PAGE_URL = `file://${path.resolve(__dirname, 'index.html')}`;

// Données de test minimales au format JSON GDIN
const TEST_RECORDS = [
  { date_demande:'2025-03-10', date_action:'2025-03-12', conum:'Dupont Jean',
    cms:'CMS Agen', lieu_raw:'CMS Agen', commune:'Agen', themas:['Numérique de base'],
    type_action:['Accompagnement'], orienteur:'CAF', motif:'aide tablette',
    benef_connu:false, urgence:false, etat:'Réalisée',
    date_planifiee:'2025-03-10', date_realisation:'2025-03-12', id_demande:'001' },
  { date_demande:'2025-04-05', date_action:'2025-04-07', conum:'Martin Lucie',
    cms:'CMS Marmande', lieu_raw:'CMS Marmande', commune:'Marmande', themas:['Santé'],
    type_action:['Accompagnement'], orienteur:'Mairie', motif:'aide smartphone',
    benef_connu:true, urgence:false, etat:'Réalisée',
    date_planifiee:'2025-04-05', date_realisation:'2025-04-07', id_demande:'002' },
  { date_demande:'2025-05-20', date_action:null, conum:'Dupont Jean',
    cms:'CMS Agen', lieu_raw:'CMS Agen', commune:'Agen', themas:['Emploi'],
    type_action:['Prise de contact'], orienteur:'Pôle Emploi', motif:'orientation',
    benef_connu:false, urgence:true, etat:'En attente',
    date_planifiee:null, date_realisation:null, id_demande:'003' },
];

const TEST_JSON = JSON.stringify({
  type: 'gdin-data',
  version: 1,
  source_filename: 'test_gdin.xlsx',
  data: TEST_RECORDS,
});

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Efface localStorage/IDB avant chaque test pour garantir l'isolation */
async function clearStorage(page) {
  await page.evaluate(() => new Promise((resolve) => {
    try { localStorage.clear(); } catch (_) {}
    try { sessionStorage.clear(); } catch (_) {}
    try {
      const req = indexedDB.deleteDatabase('gdin_idb_v1');
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
      req.onblocked = () => resolve();
    } catch (_) { resolve(); }
  }));
}

/** Charge la page, efface l'état persisté, attend que le boot async soit terminé */
async function loadFresh(page) {
  await page.goto(PAGE_URL);
  await page.waitForFunction(() => typeof window.switchTab === 'function', { timeout: 15000 });
  await clearStorage(page);
  await page.reload();
  await page.waitForFunction(() => typeof window.switchTab === 'function', { timeout: 15000 });
  // Attendre que le boot async (initData → updateSourceBadge → renderGlobal) soit terminé.
  // updateSourceBadge(false,null) est appelé après initData et met banner.style.display='block'.
  // C'est le signal le plus fiable que le boot est complet, y compris renderGlobal().
  await page.waitForFunction(() => {
    const banner = document.getElementById('import-banner');
    return banner && banner.style.display === 'block';
  }, { timeout: 15000 });
}

/** Clique sur le bouton de la landing overlay pour entrer dans le dashboard */
async function dismissLanding(page) {
  const btn = page.locator('.lo-btn');
  await btn.waitFor({ state: 'visible', timeout: 8000 });
  await btn.click();
  await page.waitForSelector('#landing-overlay', { state: 'hidden', timeout: 5000 });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe('Landing overlay', () => {

  test('affiche l\'overlay au premier chargement', async ({ page }) => {
    await loadFresh(page);
    await expect(page.locator('#landing-overlay')).toBeVisible();
  });

  test('disparaît quand on clique "Accéder au tableau de bord"', async ({ page }) => {
    await loadFresh(page);
    await dismissLanding(page);
    await expect(page.locator('#landing-overlay')).toBeHidden();
  });

});

test.describe('Navigation sidebar', () => {

  test.beforeEach(async ({ page }) => {
    await loadFresh(page);
    await dismissLanding(page);
  });

  test('Vue globale est le panel actif par défaut', async ({ page }) => {
    await expect(page.locator('#panel-global')).toHaveClass(/active/);
  });

  test('clic Évolution → panel-evolution actif', async ({ page }) => {
    await page.locator('.sb-item[onclick*="evolution"]').click();
    await expect(page.locator('#panel-evolution')).toHaveClass(/active/);
    await expect(page.locator('#panel-global')).not.toHaveClass(/active/);
  });

  test('clic Par CMS → panel-par-cms actif', async ({ page }) => {
    await page.locator('.sb-item[onclick*="par-cms"]').click();
    await expect(page.locator('#panel-par-cms')).toHaveClass(/active/);
  });

  test('clic Import données → panel-import actif', async ({ page }) => {
    await page.locator('.sb-item[onclick*="import"]').click();
    await expect(page.locator('#panel-import')).toHaveClass(/active/);
  });

  test('item actif de la sidebar se met à jour', async ({ page }) => {
    const evolBtn = page.locator('.sb-item[onclick*="evolution"]');
    await evolBtn.click();
    await expect(evolBtn).toHaveClass(/active/);
    // Le bouton global ne doit plus être actif
    await expect(page.locator('.sb-item[onclick*="global"]')).not.toHaveClass(/active/);
  });

});

test.describe('Données intégrées (sans import)', () => {

  test.beforeEach(async ({ page }) => {
    await loadFresh(page);
    await dismissLanding(page);
  });

  test('les KPIs affichent des valeurs non vides', async ({ page }) => {
    // Au moins un KPI-value doit avoir un contenu non vide
    const kpiValues = page.locator('#kpi-global .kpi-value');
    const count = await kpiValues.count();
    expect(count).toBeGreaterThan(0);
    const firstText = await kpiValues.first().textContent();
    expect(firstText?.trim()).not.toBe('');
  });

  test('le FAB "Importer mes données" est visible', async ({ page }) => {
    await expect(page.locator('#fab-import')).toBeVisible();
  });

  test('la bannière données démo est visible dans Vue globale', async ({ page }) => {
    await expect(page.locator('#import-banner')).toBeVisible();
  });

  test('badge source indique "données intégrées"', async ({ page }) => {
    const badge = page.locator('#data-source-badge');
    await expect(badge).toContainText('données intégrées');
  });

});

test.describe('Import JSON → comportement post-import', () => {

  test.beforeEach(async ({ page }) => {
    await loadFresh(page);
    await dismissLanding(page);
  });

  /**
   * C'est le test qui aurait détecté le bug corrigé aujourd'hui :
   * après import, l'app doit naviguer vers Vue globale.
   */
  test('après import JSON → redirection automatique vers Vue globale', async ({ page }) => {
    // Naviguer vers le panel import
    await page.locator('.sb-item[onclick*="import"]').click();
    await expect(page.locator('#panel-import')).toHaveClass(/active/);

    // Injecter directement les données JSON via la fonction d'import
    await page.evaluate((jsonStr) => {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const file = new File([blob], 'test_gdin.json', { type: 'application/json' });
      window.handleAutoImport(file);
    }, TEST_JSON);

    // Après 1,5s (délai import + redirect 400ms), panel-global doit être actif
    await page.waitForTimeout(1500);
    await expect(page.locator('#panel-global')).toHaveClass(/active/, { timeout: 3000 });
  });

  test('après import JSON → KPIs affichent les données importées', async ({ page }) => {
    await page.evaluate((jsonStr) => {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const file = new File([blob], 'test_gdin.json', { type: 'application/json' });
      window.handleAutoImport(file);
    }, TEST_JSON);

    await page.waitForTimeout(1500);

    // Les KPIs doivent afficher des nombres > 0 (3 enregistrements importés)
    const kpiValues = page.locator('#kpi-global .kpi-value');
    const count = await kpiValues.count();
    expect(count).toBeGreaterThan(0);
    // Au moins un KPI doit valoir plus de 0
    let hasNonZero = false;
    for (let i = 0; i < count; i++) {
      const txt = await kpiValues.nth(i).textContent();
      const num = parseInt((txt || '').replace(/\D/g, ''), 10);
      if (num > 0) { hasNonZero = true; break; }
    }
    expect(hasNonZero).toBe(true);
  });

  test('après import JSON → FAB import disparaît', async ({ page }) => {
    await page.evaluate((jsonStr) => {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const file = new File([blob], 'test_gdin.json', { type: 'application/json' });
      window.handleAutoImport(file);
    }, TEST_JSON);

    await page.waitForTimeout(1000);
    await expect(page.locator('#fab-import')).toBeHidden();
  });

  test('après import JSON → badge source mis à jour', async ({ page }) => {
    await page.evaluate((jsonStr) => {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const file = new File([blob], 'test_gdin.json', { type: 'application/json' });
      window.handleAutoImport(file);
    }, TEST_JSON);

    await page.waitForTimeout(1000);
    const badge = page.locator('#data-source-badge');
    await expect(badge).toContainText('test_gdin.json');
  });

  test('après import JSON → bannière démo masquée', async ({ page }) => {
    await page.evaluate((jsonStr) => {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const file = new File([blob], 'test_gdin.json', { type: 'application/json' });
      window.handleAutoImport(file);
    }, TEST_JSON);

    await page.waitForTimeout(1000);
    await expect(page.locator('#import-banner')).toBeHidden();
  });

});

test.describe('Boot sans réseau externe', () => {

  // Les librairies étaient chargées depuis cdnjs : sans accès à ce domaine,
  // Chart n'était jamais défini et la page restait blanche. Ce test coupe
  // tout ce qui n'est pas file:// et vérifie que le dashboard démarre quand
  // même. Le supprimer revient à rouvrir la panne.
  test.beforeEach(async ({ page }) => {
    await page.route('**/*', route => {
      const url = route.request().url();
      return url.startsWith('file://') ? route.continue() : route.abort();
    });
  });

  test('les librairies sont définies malgré le réseau coupé', async ({ page }) => {
    await loadFresh(page);
    const libs = await page.evaluate(() => ({
      chart: typeof window.Chart,
      leaflet: typeof window.L,
      xlsx: typeof window.XLSX,
    }));
    expect(libs).toEqual({ chart: 'function', leaflet: 'object', xlsx: 'object' });
  });

  test('le dashboard affiche ses KPIs malgré le réseau coupé', async ({ page }) => {
    await loadFresh(page);
    await dismissLanding(page);
    await expect(page.locator('#panel-global')).toHaveClass(/active/);
    const kpiValues = page.locator('#kpi-global .kpi-value');
    expect(await kpiValues.count()).toBeGreaterThan(0);
    expect((await kpiValues.first().textContent())?.trim()).not.toBe('');
  });

  test('les polices sont servies depuis le dépôt', async ({ page }) => {
    await loadFresh(page);
    const loaded = await page.evaluate(async () => {
      await document.fonts.ready;
      return document.fonts.check('600 16px "Space Grotesk"');
    });
    expect(loaded).toBe(true);
  });

});

test.describe('Classement des communes', () => {

  // Un libellé numérique — « 47 », code postal saisi à la place du nom —
  // passait devant « Agen » dans tous les classements, JavaScript replaçant
  // les clés entières en tête des objets. Ce test lit l'ordre tel que la page
  // le produit, pas seulement la fonction pure.
  const RECS = ['Agen', 'Agen', 'Agen', 'Agen', 'Agen', 'Fumel', 'Fumel', '47']
    .map((commune, i) => ({
      date_demande: '2025-03-10', date_action: '2025-03-12', conum: 'MARTIN Paul',
      cms: 'CMS Agen', lieu_raw: 'CMS Agen', commune, themas: ['Numérique de base'],
      type_action: ['Accompagnement'], orienteur: 'CAF', motif: 'x',
      benef_connu: false, urgence: false, etat: 'Réalisée',
      date_planifiee: '2025-03-10', date_realisation: '2025-03-12', id_demande: 'id' + i,
    }));
  const JSON_COMMUNES = JSON.stringify({
    type: 'gdin-data', version: 1, source_filename: 'communes.json', data: RECS,
  });

  test('un libellé numérique ne passe pas devant la commune la plus fréquente', async ({ page }) => {
    await loadFresh(page);
    await dismissLanding(page);
    await page.evaluate((json) => {
      const blob = new Blob([json], { type: 'application/json' });
      window.handleAutoImport(new File([blob], 'communes.json', { type: 'application/json' }));
    }, JSON_COMMUNES);
    await page.waitForFunction(() => typeof DATA !== 'undefined' && DATA.length === 8, { timeout: 10000 });

    const classement = await page.evaluate(() => countEntries(DATA, 'commune'));
    expect(classement[0]).toEqual(['Agen', 5]);
    expect(classement.map(e => e[0])).toEqual(['Agen', 'Fumel', '47']);
  });

  test('l\'ancien comportement reste reproductible, donc la correction porte', async ({ page }) => {
    await loadFresh(page);
    await dismissLanding(page);
    await page.evaluate((json) => {
      const blob = new Blob([json], { type: 'application/json' });
      window.handleAutoImport(new File([blob], 'communes.json', { type: 'application/json' }));
    }, JSON_COMMUNES);
    await page.waitForFunction(() => typeof DATA !== 'undefined' && DATA.length === 8, { timeout: 10000 });

    // count() rend toujours un objet : « 47 » y remonte en tête. C'est
    // précisément pourquoi les classements ne doivent plus l'utiliser.
    const parObjet = await page.evaluate(() => Object.keys(count(DATA, 'commune'))[0]);
    expect(parObjet).toBe('47');
  });

});

test.describe('Garde-fous IndexedDB', () => {

  // Un import qui se fige après « N enregistrements », sans message, venait
  // d'une ouverture IndexedDB qui ne répondait jamais : le await restait
  // pendant et le code qui suit l'import — y compris son message d'erreur —
  // ne s'exécutait pas. Ces tests vérifient que l'échec se produit au lieu
  // de se taire.
  test.beforeEach(async ({ page }) => {
    await loadFresh(page);
    await dismissLanding(page);
  });

  test('une ouverture bloquée par un autre onglet échoue au lieu de rester pendante', async ({ page }) => {
    const r = await page.evaluate(async () => {
      const vrai = indexedDB.open;
      indexedDB.open = () => { const req = {}; setTimeout(() => req.onblocked && req.onblocked(), 10); return req; };
      try { await _idbOpen(); return 'résolu'; }
      catch (e) { return 'rejeté: ' + e.message; }
      finally { indexedDB.open = vrai; }
    });
    expect(r).toContain('rejeté');
    expect(r).toContain('autre onglet');
  });

  test('une écriture sur ouverture bloquée rend false, sans figer', async ({ page }) => {
    const r = await page.evaluate(async () => {
      const vrai = indexedDB.open;
      indexedDB.open = () => { const req = {}; setTimeout(() => req.onblocked && req.onblocked(), 10); return req; };
      try { return await _idbPut('cle-test', [1, 2, 3]); }
      finally { indexedDB.open = vrai; }
    });
    expect(r).toBe(false);
  });

  test('une lecture sur ouverture bloquée rend null, sans figer', async ({ page }) => {
    const r = await page.evaluate(async () => {
      const vrai = indexedDB.open;
      indexedDB.open = () => { const req = {}; setTimeout(() => req.onblocked && req.onblocked(), 10); return req; };
      try { return await _idbGet('cle-test'); }
      finally { indexedDB.open = vrai; }
    });
    expect(r).toBeNull();
  });

  test('l\'ouverture est plafonnée dans le temps', async ({ page }) => {
    // Une ouverture muette : aucun événement n'est jamais émis.
    const r = await page.evaluate(async () => {
      return { delai: typeof IDB_DELAI_MAX === 'number' ? IDB_DELAI_MAX : null };
    });
    expect(r.delai).toBeGreaterThan(0);
    expect(r.delai).toBeLessThanOrEqual(30000);
  });

});

test.describe('Garde-fous IndexedDB — contre-preuve', () => {

  test('l\'implémentation d\'origine restait pendante sur une ouverture bloquée', async ({ page }) => {
    await loadFresh(page);
    await dismissLanding(page);
    // Rejoue l'ancienne version, sans onblocked ni délai, sur la même panne.
    // Si elle se résolvait, le garde-fou ajouté ne servirait à rien.
    const issue = await page.evaluate(async () => {
      const ouvrirAncienneManiere = () => new Promise((res, rej) => {
        const r = {};
        setTimeout(() => r.onblocked && r.onblocked(), 10);
        r.onsuccess = e => res(e.target.result);
        r.onerror = e => rej(e.target.error);
      });
      return Promise.race([
        ouvrirAncienneManiere().then(() => 'résolu', () => 'rejeté'),
        new Promise(res => setTimeout(() => res('toujours pendante'), 2000)),
      ]);
    });
    expect(issue).toBe('toujours pendante');
  });

});

// ── Balayage des panneaux ────────────────────────────────────────────────────
// Les tests unitaires couvrent gdin-pure.js : ce que les fonctions calculent.
// Ils ne disent rien de ce qu'on leur donne à calculer ni de ce que la page
// affiche. Trois défauts sont passés au travers le 20/09/2026 — l'onglet
// Fiabilité lisait toute la base au lieu des données filtrées, le filtre de
// type y faisait afficher « Prises de contact : 0 », et un bandeau affirmait
// un défaut déjà corrigé. Ce balayage ouvre chaque panneau sous plusieurs
// filtres et échoue sur ce qu'aucune relecture ne garantit.

/** Jeu de référence : volumes connus, donc invariants vérifiables. */
function jeuDeTest() {
  const rec = [];
  const cms = ['CMS Marmande', 'CMS Agen Tapie', 'CMS Nérac'];
  const conseillers = ['NOM-A Prenom', 'NOM-B Prenom'];
  const themas = ['Logement', 'Emploi', 'Santé'];
  for (let a = 0; a < 3; a++) {
    const annee = 2024 + a;
    for (let i = 0; i < 30; i++) {
      const type = i % 3 === 0 ? 'Accompagnement' : i % 3 === 1 ? 'Prise de contact' : 'Atelier';
      // La qualité de saisie s'améliore d'une année sur l'autre : sans cela les
      // années seraient indiscernables et le test de réaction au filtre ne
      // prouverait rien.
      const conumVide = i % (2 + a * 3) === 0;
      rec.push({
        date_demande: `${annee}-0${(i % 9) + 1}-1${i % 9}`,
        date_action: `${annee}-0${(i % 9) + 1}-2${i % 9}`,
        id_demande: `${annee}${i}`,
        conum: conumVide ? '' : conseillers[i % 2],
        cms: cms[i % 3], lieu_raw: cms[i % 3], structure: '', commune: 'Agen',
        themas: i % 5 === 0 ? [] : [themas[i % 3]],
        type_action: [type], orienteur: 'CAF', motif: '',
        benef_connu: i % 2 === 0, urgence: i % 7 === 0,
        etat: i % 4 === 0 ? 'Non réalisée' : 'Réalisée',
        date_planifiee: null, date_realisation: `${annee}-0${(i % 9) + 1}-2${i % 9}`,
      });
    }
  }
  return { type: 'gdin-data', data: rec };
}

async function importerJeu(page) {
  await page.evaluate((payload) => { importDataJSON(payload, 'test.json'); }, jeuDeTest());
  await page.waitForFunction(() => dataSource === 'imported', { timeout: 15000 });
}

const ONGLETS = ['global', 'evolution', 'par-cms', 'par-conum', 'orienteurs', 'ateliers', 'rapport', 'fiabilite', 'etats'];
const FILTRES = [
  { nom: 'sans filtre', type: '', annees: null },
  { nom: 'année récente seule', type: '', annees: ['2026'] },
  { nom: 'année ancienne seule', type: '', annees: ['2024'] },
  { nom: 'type Atelier', type: 'Atelier', annees: null },
];

test.describe('Balayage des panneaux', () => {

  test('aucun panneau ne produit NaN, undefined ou [object Object]', async ({ page }) => {
    await loadFresh(page); await dismissLanding(page); await importerJeu(page);
    const fautifs = await page.evaluate(({ ONGLETS, FILTRES }) => {
      const out = [];
      for (const f of FILTRES) for (const o of ONGLETS) {
        document.getElementById('typeFilter').value = f.type;
        activeYears = f.annees ? new Set(f.annees) : new Set(ALL_YEARS);
        const btn = document.querySelector(`[onclick*="'${o}'"]`);
        if (btn) btn.click();
        const txt = (document.getElementById('panel-' + o) || {}).textContent || '';
        if (/\bNaN\b|undefined|\[object Object\]|Infinity/.test(txt)) out.push(`${f.nom} / ${o}`);
      }
      return out;
    }, { ONGLETS, FILTRES });
    expect(fautifs, 'valeurs cassées affichées').toEqual([]);
  });

  test('aucun panneau ne reste vide sous un filtre', async ({ page }) => {
    await loadFresh(page); await dismissLanding(page); await importerJeu(page);
    const vides = await page.evaluate(({ ONGLETS, FILTRES }) => {
      const out = [];
      for (const f of FILTRES) for (const o of ONGLETS) {
        document.getElementById('typeFilter').value = f.type;
        activeYears = f.annees ? new Set(f.annees) : new Set(ALL_YEARS);
        const btn = document.querySelector(`[onclick*="'${o}'"]`);
        if (btn) btn.click();
        const p = document.getElementById('panel-' + o);
        if (p && p.textContent.replace(/\s+/g, ' ').trim().length < 40) out.push(`${f.nom} / ${o}`);
      }
      return out;
    }, { ONGLETS, FILTRES });
    expect(vides, 'panneaux vides').toEqual([]);
  });

  // Régression du 20/09/2026 : avec un filtre de type actif, l'onglet affichait
  // « Prises de contact : 0 ». Exact pour le sous-ensemble, absurde à lire.
  test('le filtre de type ne vide aucun indicateur de fiabilité', async ({ page }) => {
    await loadFresh(page); await dismissLanding(page); await importerJeu(page);
    const zeros = await page.evaluate(() => {
      document.getElementById('typeFilter').value = 'Accompagnement';
      document.querySelector('[onclick*="\'fiabilite\'"]').click();
      const t = document.querySelector('#fia-indicateurs table');
      return [...t.querySelectorAll('tbody tr')]
        .map(tr => [...tr.querySelectorAll('td')].map(td => td.textContent.trim()))
        .filter(c => c[1] === '0').map(c => c[0]);
    });
    expect(zeros, 'indicateurs à zéro sous un filtre de type').toEqual([]);
  });

  // Régression du 20/09/2026 : renderFiabilite() lisait DATA, donc changer
  // d'année ne changeait rien à l'écran.
  test('les indicateurs de fiabilité suivent le filtre années', async ({ page }) => {
    await loadFresh(page); await dismissLanding(page); await importerJeu(page);
    const [a, b] = await page.evaluate(() => {
      const lire = () => { renderFiabilite(); return document.getElementById('fia-synthese').textContent; };
      document.querySelector('[onclick*="\'fiabilite\'"]').click();
      activeYears = new Set(['2024']); const x = lire();
      activeYears = new Set(['2026']); const y = lire();
      return [x, y];
    });
    expect(a, 'la fiabilité ne réagit pas au changement d\'année').not.toEqual(b);
  });
});

test.describe('Lisibilité des listes déroulantes', () => {

  // Le menu déroulant natif s'ouvre hors de la page, sur un fond système
  // blanc. Sans fond opaque explicite, les options héritent du color du
  // select — clair en thème sombre — et deviennent invisibles : l'utilisateur
  // voit une liste vide alors qu'elle est peuplée. Constaté le 20/09/2026 sur
  // le sélecteur de conseiller, en production.
  const LUMINANCE = `(c) => {
    const [r, g, b] = c.match(/[\\d.]+/g).map(Number);
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  }`;

  async function auditOptions(page) {
    return page.evaluate(`(() => {
      const lum = ${LUMINANCE};
      const out = [];
      document.querySelectorAll('select').forEach((sel) => {
        const opt = sel.querySelector('option');
        if (!opt) return;
        const st = getComputedStyle(opt);
        const fond = st.backgroundColor;
        const alpha = fond.startsWith('rgba') ? Number(fond.match(/[\\d.]+/g)[3]) : 1;
        const l1 = lum(st.color), l2 = lum(fond);
        const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        out.push({ id: sel.id || sel.className, fond, couleur: st.color, alpha, ratio });
      });
      return out;
    })()`);
  }

  test('le sélecteur de conseiller est peuplé après import', async ({ page }) => {
    await loadFresh(page);
    await dismissLanding(page);
    await page.evaluate((json) => {
      const blob = new Blob([json], { type: 'application/json' });
      window.handleAutoImport(new File([blob], 'test.json', { type: 'application/json' }));
    }, TEST_JSON);
    await page.waitForFunction(() => typeof DATA !== 'undefined' && DATA.length > 0, { timeout: 10000 });
    const n = await page.locator('#sel-conum option').count();
    expect(n).toBeGreaterThan(0);
  });

  test('les options ont un fond opaque et lisible en thème sombre', async ({ page }) => {
    await loadFresh(page);
    await dismissLanding(page);
    const audit = await auditOptions(page);
    expect(audit.length).toBeGreaterThan(0);
    const fautifs = audit.filter(o => o.alpha < 1 || o.ratio < 4.5);
    expect(fautifs, JSON.stringify(fautifs, null, 1)).toEqual([]);
  });

  test('les options restent lisibles en thème clair', async ({ page }) => {
    await loadFresh(page);
    await dismissLanding(page);
    await page.evaluate(() => document.body.classList.add('light-mode'));
    const audit = await auditOptions(page);
    const fautifs = audit.filter(o => o.alpha < 1 || o.ratio < 4.5);
    expect(fautifs, JSON.stringify(fautifs, null, 1)).toEqual([]);
  });

});

test.describe('Fond de carte', () => {

  // CARTO a fermé l'accès libre à ses tuiles : le serveur renvoyait un
  // filigrane « API KEY REQUIRED » en travers de la carte, en production, sans
  // qu'aucune ligne du dépôt ait changé. Ces tests verrouillent le fait que le
  // fond de carte ne dépend d'aucune clé et que les deux cartes servent la
  // même source.
  test('aucune tuile ne dépend d\'un fournisseur à clé', async ({ page }) => {
    await loadFresh(page);
    const src = await page.evaluate(() => typeof TUILES_URL !== 'undefined' ? TUILES_URL : null);
    expect(src).toBeTruthy();
    expect(src).not.toMatch(/cartocdn|apikey|api_key|access[-_]?token|\{key\}/i);
    expect(src).toMatch(/^https:\/\//);
  });

  test('les deux cartes partagent la même source', async ({ page }) => {
    await loadFresh(page);
    const appels = await page.evaluate(() => {
      const html = document.documentElement.innerHTML;
      return (html.match(/L\.tileLayer\(([^,)]+)/g) || []).map(s => s.replace('L.tileLayer(', '').trim());
    });
    expect(appels.length).toBeGreaterThanOrEqual(2);
    expect([...new Set(appels)]).toEqual(['TUILES_URL']);
  });

  test('l\'attribution du fond de carte est renseignée', async ({ page }) => {
    await loadFresh(page);
    const a = await page.evaluate(() => typeof TUILES_ATTRIB !== 'undefined' ? TUILES_ATTRIB : null);
    expect(a).toBeTruthy();
    expect(a).toMatch(/OpenStreetMap/i);
  });

});

test.describe('Lisibilité par-dessus la carte', () => {

  // Tout ce qui se pose sur le fond de carte a besoin d'un fond opaque : les
  // couleurs de la carte ne sont pas maîtrisées. Les variables de thème sont
  // translucides (--s1 vaut rgba(255,255,255,.028)) et ne conviennent pas.
  // Le défaut ne s'est vu qu'au passage de CartoDB, presque blanc, à OSM,
  // coloré : le popup laissait voir la carte au travers.
  const CLASSES = [
    'leaflet-popup-content-wrapper',
    'leaflet-popup-tip',
    'leaflet-label-dark',
  ];

  async function opacites(page, clair) {
    return page.evaluate(({ classes, clair }) => {
      document.body.classList.toggle('light-mode', clair);
      return classes.map((cls) => {
        const d = document.createElement('div');
        d.className = cls;
        document.body.appendChild(d);
        const fond = getComputedStyle(d).backgroundColor;
        d.remove();
        const m = fond.match(/[\d.]+/g) || [];
        return { cls, fond, alpha: fond.startsWith('rgba') ? Number(m[3]) : 1 };
      });
    }, { classes: CLASSES, clair });
  }

  test('les éléments posés sur la carte sont opaques en thème sombre', async ({ page }) => {
    await loadFresh(page);
    await dismissLanding(page);
    const res = await opacites(page, false);
    const transparents = res.filter(o => o.alpha < 0.85);
    expect(transparents, JSON.stringify(transparents, null, 1)).toEqual([]);
  });

  test('ils le restent en thème clair', async ({ page }) => {
    await loadFresh(page);
    await dismissLanding(page);
    const res = await opacites(page, true);
    const transparents = res.filter(o => o.alpha < 0.85);
    expect(transparents, JSON.stringify(transparents, null, 1)).toEqual([]);
  });

});

test.describe('Fond de carte neutre', () => {

  // Un fond bavard concurrence les cercles de données au lieu de les porter.
  // La désaturation ne doit toucher que le calque des tuiles : les cercles et
  // les étiquettes vivent dans overlay-pane et gardent leurs couleurs.
  async function filtreDe(page, cls, clair) {
    return page.evaluate(({ cls, clair }) => {
      document.body.classList.toggle('light-mode', clair);
      const d = document.createElement('div');
      d.className = cls;
      document.body.appendChild(d);
      const f = getComputedStyle(d).filter;
      d.remove();
      return f;
    }, { cls, clair });
  }

  test('les tuiles sont désaturées dans les deux thèmes', async ({ page }) => {
    await loadFresh(page);
    await dismissLanding(page);
    expect(await filtreDe(page, 'leaflet-tile-pane', false)).toMatch(/grayscale/);
    expect(await filtreDe(page, 'leaflet-tile-pane', true)).toMatch(/grayscale/);
  });

  test('les données posées sur la carte gardent leurs couleurs', async ({ page }) => {
    await loadFresh(page);
    await dismissLanding(page);
    for (const cls of ['leaflet-overlay-pane', 'leaflet-marker-pane', 'leaflet-tooltip-pane']) {
      const f = await filtreDe(page, cls, false);
      expect(f, `${cls} ne doit pas être désaturé`).not.toMatch(/grayscale/);
    }
  });

});

test.describe('Panneau de filtres mobile', () => {

  // Le panneau était enfant du <header>, qui porte un backdrop-filter. Or un
  // backdrop-filter sur un ancêtre crée un contexte de conteneur pour
  // position:fixed : le panneau se positionnait par rapport au header au lieu
  // de l'écran et sortait par le haut (top -216px sur un écran de 915px).
  // Panneau et croix étaient hors d'atteinte — la croix passait pour cassée.
  test.use({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });

  async function ouvrir(page) {
    await loadFresh(page);
    await dismissLanding(page);
    await page.evaluate(() => openFilterDrawer());
    await page.waitForTimeout(350);
  }

  test('le panneau ouvert tient dans l\'écran', async ({ page }) => {
    await ouvrir(page);
    const r = await page.evaluate(() => {
      const d = document.getElementById('filter-drawer').getBoundingClientRect();
      return { top: d.top, bottom: d.bottom, ecran: window.innerHeight };
    });
    expect(r.top, 'le panneau sort par le haut').toBeGreaterThanOrEqual(0);
    expect(r.bottom, 'le panneau sort par le bas').toBeLessThanOrEqual(r.ecran);
  });

  test('aucun ancêtre ne détourne le position:fixed du panneau', async ({ page }) => {
    await ouvrir(page);
    const coupables = await page.evaluate(() => {
      const out = [];
      let n = document.getElementById('filter-drawer').parentElement;
      while (n && n !== document.documentElement) {
        const s = getComputedStyle(n);
        if (s.transform !== 'none' || s.filter !== 'none' || s.backdropFilter !== 'none' || s.perspective !== 'none') {
          out.push(n.tagName + (n.id ? '#' + n.id : ''));
        }
        n = n.parentElement;
      }
      return out;
    });
    expect(coupables, JSON.stringify(coupables)).toEqual([]);
  });

  test('la croix offre une cible tactile suffisante', async ({ page }) => {
    await ouvrir(page);
    const r = await page.evaluate(() => {
      const c = document.querySelector('#filter-drawer .drawer-close').getBoundingClientRect();
      return { w: c.width, h: c.height };
    });
    expect(r.w, 'largeur de la croix').toBeGreaterThanOrEqual(44);
    expect(r.h, 'hauteur de la croix').toBeGreaterThanOrEqual(44);
  });

  test('la croix ferme réellement le panneau au doigt', async ({ page }) => {
    await ouvrir(page);
    await page.locator('#filter-drawer .drawer-close').tap();
    await page.waitForTimeout(350);
    const ouvert = await page.evaluate(() => document.getElementById('filter-drawer').classList.contains('open'));
    expect(ouvert).toBe(false);
  });

  test('le panneau ne mange pas la moitié de l\'écran', async ({ page }) => {
    await ouvrir(page);
    const pct = await page.evaluate(() => {
      const d = document.getElementById('filter-drawer').getBoundingClientRect();
      return d.height / window.innerHeight;
    });
    expect(pct).toBeLessThan(0.5);
  });

});

test.describe('Onglet États', () => {

  // Le bloc vivait dans l'onglet Import avec ses propres listes année / CMS /
  // conseiller. Deux jeux de filtres coexistaient : l'écran pouvait montrer
  // 2024 pendant que le reste du tableau de bord montrait 2026, sans que rien
  // ne le signale. Ces tests verrouillent le branchement sur les filtres
  // généraux et l'absence de filtres locaux.

  async function ouvrirEtats(page) {
    await page.evaluate(() => {
      document.querySelector('[onclick*="\'etats\'"]').click();
    });
  }

  async function totalEtats(page) {
    return page.evaluate(() => {
      const kpis = document.querySelectorAll('#act-kpi .kpi-value');
      return kpis.length ? Number(kpis[kpis.length - 1].textContent) : null;
    });
  }

  test("l'onglet existe et se peuple après import", async ({ page }) => {
    await loadFresh(page); await dismissLanding(page); await importerJeu(page);
    await ouvrirEtats(page);
    const etat = await page.evaluate(() => ({
      visible: document.getElementById('act-dashboard').style.display === 'block',
      lignesCms: document.querySelectorAll('#tbody-act-cms tr').length,
      lignesConum: document.querySelectorAll('#tbody-act-conum tr').length,
    }));
    expect(etat.visible, 'le bloc doit être affiché').toBe(true);
    expect(etat.lignesCms, 'table par structure vide').toBeGreaterThan(1);
    expect(etat.lignesConum, 'table par conseiller vide').toBeGreaterThan(0);
  });

  test('le panneau devient réellement visible, pas seulement peuplé', async ({ page }) => {
    // Une première version de ces tests ne vérifiait que le contenu des
    // tables : elle serait passée avec un panneau resté masqué.
    await loadFresh(page); await dismissLanding(page); await importerJeu(page);
    await ouvrirEtats(page);
    const vu = await page.evaluate(() => {
      const p = document.getElementById('panel-etats');
      return {
        actifs: [...document.querySelectorAll('.panel.active')].map((x) => x.id),
        display: getComputedStyle(p).display,
        onglet: document.querySelector('[onclick*="\'etats\'"]').classList.contains('active'),
      };
    });
    expect(vu.actifs, 'un seul panneau actif').toEqual(['panel-etats']);
    expect(vu.display).not.toBe('none');
    expect(vu.onglet, 'le bouton de barre latérale doit être actif').toBe(true);
  });

  test('aucun filtre local ne subsiste dans la page', async ({ page }) => {
    await loadFresh(page); await dismissLanding(page);
    const restes = await page.evaluate(() =>
      ['act-year', 'act-cms-filter', 'act-conum', 'act-year-chips']
        .filter((id) => document.getElementById(id) !== null));
    expect(restes, 'filtres locaux encore présents').toEqual([]);
  });

  test('les chiffres suivent le filtre années général', async ({ page }) => {
    await loadFresh(page); await dismissLanding(page); await importerJeu(page);
    await ouvrirEtats(page);
    const toutes = await totalEtats(page);
    await page.evaluate(() => { activeYears = new Set(['2024']); refreshAll(); });
    const une = await totalEtats(page);
    expect(toutes, 'total sur toutes les années').toBeGreaterThan(0);
    expect(une, 'une seule année doit donner moins').toBeLessThan(toutes);
  });

  test('les chiffres suivent la période générale', async ({ page }) => {
    await loadFresh(page); await dismissLanding(page); await importerJeu(page);
    await ouvrirEtats(page);
    const avant = await totalEtats(page);
    await page.evaluate(() => {
      document.getElementById('dFrom').value = '2026-01-01';
      refreshAll();
    });
    const apres = await totalEtats(page);
    expect(apres, 'une période plus courte doit donner moins').toBeLessThan(avant);
  });

  test("le filtre de type ne vide pas l'onglet", async ({ page }) => {
    // ACTIONS_DATA ne contient que des accompagnements : appliquer le type
    // global viderait l'écran dès qu'on choisit « Atelier ». Choix assumé,
    // aligné sur l'onglet Fiabilité.
    await loadFresh(page); await dismissLanding(page); await importerJeu(page);
    await ouvrirEtats(page);
    await page.evaluate(() => {
      document.getElementById('typeFilter').value = 'Atelier';
      refreshAll();
    });
    expect(await totalEtats(page), "l'onglet ne doit pas se vider").toBeGreaterThan(0);
  });

  test("le bloc a quitté l'onglet Import", async ({ page }) => {
    await loadFresh(page); await dismissLanding(page); await importerJeu(page);
    const dansImport = await page.evaluate(() =>
      document.getElementById('panel-import').contains(document.getElementById('act-dashboard')));
    expect(dansImport, 'le bloc est resté dans Import').toBe(false);
  });

});

test.describe('Graphes de types d\'action', () => {

  // Le filtre « Type d'action » vaut « Accompagnement » par défaut. Ces deux
  // graphes étaient alimentés par getFiltered(), qui applique ce filtre : à
  // l'ouverture ils ne montraient qu'une seule série, dont la valeur est déjà
  // le KPI principal. Ils lisent désormais getFilteredSansType().

  test('la répartition par type montre plusieurs types sous le filtre par défaut', async ({ page }) => {
    await loadFresh(page); await dismissLanding(page); await importerJeu(page);
    const vu = await page.evaluate(() => ({
      filtre: document.getElementById('typeFilter').value,
      labels: charts['ch-types'].data.labels,
    }));
    expect(vu.filtre, 'le filtre par défaut doit bien être un type précis').toBe('Accompagnement');
    expect(vu.labels.length, 'un seul type affiché').toBeGreaterThan(1);
  });

  test("l'évolution mensuelle par type empile plusieurs types", async ({ page }) => {
    await loadFresh(page); await dismissLanding(page); await importerJeu(page);
    await page.evaluate(() => {
      document.querySelector('[onclick*="\'evolution\'"]').click();
    });
    const series = await page.evaluate(() => charts['ch-type-monthly'].data.datasets.map((d) => d.label));
    expect(series.length, 'une seule série empilée').toBeGreaterThan(1);
  });

  test('contre-preuve : alimentés par getFiltered() ils retombent à un seul type', async ({ page }) => {
    // Sans ceci, les deux tests ci-dessus passeraient encore si le correctif
    // disparaissait et que le filtre par défaut changeait pour « Tous ».
    await loadFresh(page); await dismissLanding(page); await importerJeu(page);
    const n = await page.evaluate(() => {
      const keys = allTypeKeys(getFiltered());
      return keys.length;
    });
    expect(n, "l'implémentation d'origine doit bien être fautive").toBe(1);
  });

  test('les deux graphes suivent quand même la période et les années', async ({ page }) => {
    await loadFresh(page); await dismissLanding(page); await importerJeu(page);
    const avant = await page.evaluate(() =>
      charts['ch-types'].data.datasets[0].data.reduce((a, b) => a + b, 0));
    await page.evaluate(() => { activeYears = new Set(['2024']); refreshAll(); });
    const apres = await page.evaluate(() =>
      charts['ch-types'].data.datasets[0].data.reduce((a, b) => a + b, 0));
    expect(apres, 'une seule année doit donner moins').toBeLessThan(avant);
  });

});

test.describe('Axe des courbes d\'évolution', () => {

  // Les courbes tiraient leur axe des mois présents dans les données : un mois
  // sans activité disparaissait au lieu de s'afficher à zéro, et deux points
  // voisins à l'écran pouvaient être séparés de plusieurs mois réels. Mesuré
  // le 21/09/2026 sur le Rapport : 10 points pour une période de 36 mois.

  async function ouvrirRapportSurLaPlusGrosseCombinaison(page) {
    return page.evaluate(async () => {
      document.querySelector('[onclick*="\'rapport\'"]').click();
      await new Promise((r) => setTimeout(r, 300));
      const c = {};
      getFiltered().forEach((r) => {
        if (r.conum && r.cms) c[r.conum + '|' + r.cms] = (c[r.conum + '|' + r.cms] || 0) + 1;
      });
      const best = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
      const [cn, cm] = best[0].split('|');
      const sc = document.getElementById('sel-rpt-conum');
      sc.value = cn; sc.dispatchEvent(new Event('change'));
      await new Promise((r) => setTimeout(r, 400));
      const sm = document.getElementById('sel-rpt-cms');
      sm.value = cm; sm.dispatchEvent(new Event('change'));
      await new Promise((r) => setTimeout(r, 700));
      return best[1];
    });
  }

  test("l'évolution du Rapport couvre toute la période, mois creux compris", async ({ page }) => {
    await loadFresh(page); await dismissLanding(page); await importerJeu(page);
    await ouvrirRapportSurLaPlusGrosseCombinaison(page);
    const vu = await page.evaluate(() => {
      const f = document.getElementById('dFrom').value;
      const t = document.getElementById('dTo').value;
      return {
        attendus: moisDeLaPeriode(f, t, activeYears).length,
        affiches: charts['ch-rpt-evol'].data.labels.length,
        mensuelEtats: charts['ch-rpt-act-monthly'].data.labels.length,
      };
    });
    expect(vu.affiches, "l'axe doit couvrir la période entière").toBe(vu.attendus);
    expect(vu.mensuelEtats, 'même axe pour les réalisés / non réalisés').toBe(vu.attendus);
  });

  test('le total affiché ne change pas : on ajoute des zéros, pas des dossiers', async ({ page }) => {
    await loadFresh(page); await dismissLanding(page); await importerJeu(page);
    const dossiers = await ouvrirRapportSurLaPlusGrosseCombinaison(page);
    const total = await page.evaluate(() =>
      charts['ch-rpt-evol'].data.datasets[0].data.reduce((a, b) => a + b, 0));
    expect(total).toBe(dossiers);
  });

  test("contre-preuve : l'axe tiré des données est plus court", async ({ page }) => {
    // Sans ceci, le test ci-dessus passerait encore si l'axe redevenait celui
    // des données sur un jeu où tous les mois sont remplis.
    await loadFresh(page); await dismissLanding(page); await importerJeu(page);
    await ouvrirRapportSurLaPlusGrosseCombinaison(page);
    const vu = await page.evaluate(() => {
      const f = document.getElementById('dFrom').value;
      const t = document.getElementById('dTo').value;
      const conum = document.getElementById('sel-rpt-conum').value;
      const cms = document.getElementById('sel-rpt-cms').value;
      const cmN = normCms(cms) || cms;
      const data = getFiltered().filter((r) => r.conum === conum && (r.cms === cms || r.cms === cmN));
      return {
        depuisLesDonnees: new Set(data.map((r) => r.date_demande.slice(0, 7))).size,
        depuisLaPeriode: moisDeLaPeriode(f, t, activeYears).length,
      };
    });
    expect(vu.depuisLesDonnees, "l'ancien axe doit bien être plus court")
      .toBeLessThan(vu.depuisLaPeriode);
  });

  test('le slide « Non réalisés » du diaporama garde le même axe que le CR', async ({ page }) => {
    // Règle CR ↔ Diapo : les deux doivent montrer la même chose.
    await loadFresh(page); await dismissLanding(page); await importerJeu(page);
    const src = await page.evaluate(() => {
      const fn = String(drSlideNonReal);
      // Viser l'axe des mois seulement : la liste des ANNÉES se construit
      // légitimement depuis les données pour le graphe N vs N-1.
      return {
        axeComplet: /const months=moisDeLaPeriode/.test(fn),
        axeDonnees: /const months=\[\.\.\.new Set/.test(fn),
      };
    });
    expect(src.axeComplet, 'le slide doit utiliser moisDeLaPeriode').toBe(true);
    expect(src.axeDonnees, "l'axe tiré des données ne doit plus s'y trouver").toBe(false);
  });

});

test.describe('Info-bulles au doigt', () => {

  // Sur mobile, ni l'attribut `title` ni une règle :hover ne s'ouvrent au tap.
  // Les pastilles de vigilance des KPI portaient leur explication dans un
  // `title` : sur téléphone on voyait la pastille sans pouvoir lire ce qu'elle
  // disait. Tout passe désormais par drAfficherBulle(), déclenché au clic.

  test.use({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });

  async function preparer(page) {
    await loadFresh(page);
    await dismissLanding(page);
    await importerJeu(page);
  }

  // La fermeture se teste par un clic réel sur un élément sans info-bulle, pas
  // par un point de l'écran : la zone de contact d'un tap déborde le point
  // visé et atterrit sur un KPI voisin, qui porte son propre data-tip et
  // rouvre la bulle. Le tap réel reste couvert par les tests d'ouverture.
  async function fermerAilleurs(page) {
    await page.evaluate(() => {
      const neutre = [...document.querySelectorAll('.card-title, h2, .sb-divider')]
        .find((e) => !e.closest('[data-tip]') && !e.closest('.dr-q')) || document.body;
      neutre.click();
    });
    await page.waitForTimeout(200);
  }

  test('une pastille de vigilance ouvre sa bulle au tap', async ({ page }) => {
    await preparer(page);
    const pastille = page.locator('.pt-vig').first();
    await pastille.waitFor({ state: 'attached', timeout: 5000 });
    await pastille.scrollIntoViewIfNeeded();
    await pastille.tap();
    const vu = await page.evaluate(() => {
      const t = document.getElementById('dr-insight-tip');
      return { affichee: getComputedStyle(t).display, texte: t.textContent };
    });
    expect(vu.affichee, 'la bulle doit être visible').toBe('block');
    expect(vu.texte, "elle doit porter l'écart mesuré").toMatch(/écart mesuré/);
  });

  test('la bulle reste entièrement dans l\'écran', async ({ page }) => {
    await preparer(page);
    const pastille = page.locator('.pt-vig').first();
    await pastille.waitFor({ state: 'attached', timeout: 5000 });
    await pastille.scrollIntoViewIfNeeded();
    await pastille.tap();
    const d = await page.evaluate(() => {
      const b = document.getElementById('dr-insight-tip').getBoundingClientRect();
      return { l: b.left, r: b.right, t: b.top, b: b.bottom, w: innerWidth, h: innerHeight };
    });
    expect(d.l).toBeGreaterThanOrEqual(0);
    expect(d.r).toBeLessThanOrEqual(d.w);
    expect(d.t).toBeGreaterThanOrEqual(0);
    expect(d.b).toBeLessThanOrEqual(d.h);
  });

  test('le fond de la bulle est opaque dans les deux thèmes', async ({ page }) => {
    // --s2 vaut rgba(255,255,255,.046) en thème sombre : la bulle laissait lire
    // le KPI au travers. Même piège que les options de <select>. Le fond ne
    // dépend pas de l'ouverture, on mesure la règle appliquée à l'élément.
    await preparer(page);
    const pastille = page.locator('.pt-vig').first();
    await pastille.waitFor({ state: 'attached', timeout: 5000 });
    await pastille.scrollIntoViewIfNeeded();
    await pastille.tap();
    const alpha = () => page.evaluate(() => {
      const bg = getComputedStyle(document.getElementById('dr-insight-tip')).backgroundColor;
      const m = bg.match(/[\d.]+/g);
      return m && m.length > 3 ? parseFloat(m[3]) : 1;
    });
    expect(await alpha(), 'fond translucide en thème sombre').toBe(1);
    await page.evaluate(() => document.body.classList.add('light-mode'));
    expect(await alpha(), 'fond translucide en thème clair').toBe(1);
  });

  test('un tap ailleurs referme la bulle', async ({ page }) => {
    await preparer(page);
    const pastille = page.locator('.pt-vig').first();
    await pastille.waitFor({ state: 'attached', timeout: 5000 });
    await pastille.scrollIntoViewIfNeeded();
    await pastille.tap();
    expect(await page.evaluate(() =>
      getComputedStyle(document.getElementById('dr-insight-tip')).display)).toBe('block');
    await fermerAilleurs(page);
    expect(await page.evaluate(() =>
      getComputedStyle(document.getElementById('dr-insight-tip')).display)).toBe('none');
  });

  test('un KPI à data-tip ouvre aussi sa bulle au tap', async ({ page }) => {
    await preparer(page);
    const kpi = page.locator('.kpi[data-tip]').first();
    await kpi.scrollIntoViewIfNeeded();
    await kpi.tap();
    expect(await page.evaluate(() =>
      getComputedStyle(document.getElementById('dr-insight-tip')).display)).toBe('block');
  });

  test("contre-preuve : le seul `title` ne suffisait pas", async ({ page }) => {
    // Un title reste utile au survol souris, mais il ne doit plus être le seul
    // porteur de l'explication : la pastille doit aussi exposer data-tip.
    await preparer(page);
    const attrs = await page.evaluate(() => {
      const p = document.querySelector('.pt-vig');
      return p ? { title: !!p.getAttribute('title'), tip: !!p.getAttribute('data-tip') } : null;
    });
    expect(attrs, 'aucune pastille rendue').not.toBeNull();
    expect(attrs.tip, 'data-tip manquant : illisible sur mobile').toBe(true);
    expect(attrs.title, 'title conservé pour le survol souris').toBe(true);
  });

});

test.describe('Volume par CMS — courbes comparables', () => {

  // Le graphe était en aires empilées : chaque courbe portait le cumul des
  // précédentes, celle du haut valait le total des six CMS et non le volume du
  // sien, et toutes reprenaient mécaniquement la forme du total. Impossible de
  // comparer les CMS, ce qui est pourtant la seule raison d'être du graphe —
  // le total est déjà donné par l'évolution mensuelle au-dessus.

  async function ouvrirEvolution(page) {
    await loadFresh(page); await dismissLanding(page); await importerJeu(page);
    await page.evaluate(() => document.querySelector('[onclick*="\'evolution\'"]').click());
    await page.waitForTimeout(600);
  }

  test("le graphe n'est pas empilé", async ({ page }) => {
    await ouvrirEvolution(page);
    const c = await page.evaluate(() => {
      const ch = charts['ch-cms-monthly'];
      return {
        axeEmpile: !!(ch.options.scales.y && ch.options.scales.y.stacked),
        sériesEmpilées: ch.data.datasets.some((d) => d.stack !== undefined),
        remplissage: ch.data.datasets.some((d) => d.fill),
      };
    });
    expect(c.axeEmpile, "l'axe Y ne doit pas empiler").toBe(false);
    expect(c.sériesEmpilées, 'aucune série ne doit déclarer de stack').toBe(false);
    expect(c.remplissage, 'des aires superposées non empilées seraient illisibles').toBe(false);
  });

  test('chaque courbe porte le volume de son seul CMS', async ({ page }) => {
    await ouvrirEvolution(page);
    const ok = await page.evaluate(() => {
      const ch = charts['ch-cms-monthly'];
      const labels = ch.data.labels;
      // Recalcul indépendant depuis DATA, pour le mois le plus fourni.
      const parMois = {};
      getFiltered().forEach((r) => {
        const m = r.date_demande.slice(0, 7);
        parMois[m] = (parMois[m] || 0) + 1;
      });
      const moisPlein = Object.entries(parMois).sort((a, b) => b[1] - a[1])[0][0];
      const idx = labels.findIndex((l, i) => {
        // monthLabel() reformate : on retrouve l'index par recalcul du même libellé
        return l === monthLabel(moisPlein);
      });
      if (idx < 0) return { trouve: false };
      const ecarts = ch.data.datasets.map((d) => {
        const attendu = getFiltered()
          .filter((r) => r.cms === d.label && r.date_demande.startsWith(moisPlein)).length;
        return { cms: d.label, affiche: d.data[idx], attendu };
      });
      return { trouve: true, faux: ecarts.filter((e) => e.affiche !== e.attendu) };
    });
    expect(ok.trouve, 'mois de référence introuvable').toBe(true);
    expect(ok.faux, 'une courbe affiche autre chose que le volume de son CMS').toEqual([]);
  });

  test('contre-preuve : des courbes qui se croisent sont impossibles en empilé', async ({ page }) => {
    // En aires empilées, chaque courbe vaut la somme des précédentes : elle
    // leur est donc supérieure ou égale en TOUT point, et deux courbes ne se
    // croisent jamais. Un croisement prouve que l'empilement a bien disparu.
    // Le jeu de test commun ne porte qu'un seul CMS côté accompagnements :
    // il en faut un dédié pour que la propriété soit observable.
    await loadFresh(page); await dismissLanding(page);
    await page.evaluate(() => {
      const rec = [];
      // Deux CMS aux courbes volontairement inversées d'un mois sur l'autre.
      const plan = { 'CMS Marmande': [9, 2, 9, 2], 'CMS Nérac': [2, 9, 2, 9] };
      Object.entries(plan).forEach(([cms, vals]) => {
        vals.forEach((n, mi) => {
          for (let i = 0; i < n; i++) {
            const m = String(mi + 1).padStart(2, '0');
            rec.push({
              date_demande: `2026-${m}-05`, date_action: `2026-${m}-05`,
              id_demande: `${cms}-${mi}-${i}`, conum: 'NOM-A Prenom',
              cms, lieu_raw: cms, structure: '', commune: 'Agen',
              themas: ['Logement'], type_action: ['Accompagnement'],
              orienteur: 'CAF', motif: '', benef_connu: true, urgence: false,
              etat: 'Réalisée', date_planifiee: null, date_realisation: `2026-${m}-05`,
            });
          }
        });
      });
      importDataJSON({ type: 'gdin-data', data: rec }, 'croisement.json');
    });
    await page.waitForFunction(() => dataSource === 'imported', { timeout: 15000 });
    await page.evaluate(() => document.querySelector('[onclick*="\'evolution\'"]').click());
    await page.waitForTimeout(600);

    const r = await page.evaluate(() => {
      const ds = charts['ch-cms-monthly'].data.datasets;
      if (ds.length < 2) return { series: ds.length, croisement: false };
      let croisement = false;
      for (let a = 0; a < ds.length && !croisement; a++) {
        for (let b = a + 1; b < ds.length && !croisement; b++) {
          let auDessus = false, auDessous = false;
          for (let i = 0; i < ds[a].data.length; i++) {
            if (ds[a].data[i] > ds[b].data[i]) auDessus = true;
            if (ds[a].data[i] < ds[b].data[i]) auDessous = true;
          }
          if (auDessus && auDessous) croisement = true;
        }
      }
      return { series: ds.length, croisement };
    });
    expect(r.series, 'il faut au moins deux CMS pour observer un croisement')
      .toBeGreaterThanOrEqual(2);
    expect(r.croisement, "aucun croisement : l'empilement est peut-être revenu").toBe(true);
  });

});
