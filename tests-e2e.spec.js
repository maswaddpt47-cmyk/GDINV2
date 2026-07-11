/**
 * Tests E2E — GDIN v2
 * Lance le dashboard dans un vrai navigateur et vérifie les comportements UI.
 * Ces tests couvrent ce que gdin-pure.test.js ne peut PAS tester :
 * navigation, affichage après import, redirections, KPIs visibles.
 *
 * Lancer : npx playwright test tests-e2e.spec.js
 */

const { test, expect } = require('@playwright/test');
const path = require('path');

const PAGE_URL = `file://${path.resolve(__dirname, 'index-v2.html')}`;

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
