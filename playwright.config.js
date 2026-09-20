const { defineConfig } = require('@playwright/test');
const fs = require('fs');

// Chromium préinstallé dans certains environnements de développement. Ailleurs
// — poste local, runner GitHub — on laisse Playwright choisir celui qu'il a
// installé lui-même. Sans ce repli, la suite ne tournait que dans un seul
// conteneur, donc en pratique nulle part.
const CHROMIUM_PREINSTALLE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const executablePath = fs.existsSync(CHROMIUM_PREINSTALLE) ? CHROMIUM_PREINSTALLE : undefined;

module.exports = defineConfig({
  testDir: '.',
  testMatch: 'tests-e2e.spec.js',
  timeout: 90000,
  use: {
    headless: true,
    viewport: { width: 1440, height: 900 },
    launchOptions: { executablePath, args: ['--no-sandbox', '--disable-setuid-sandbox'] },
  },
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],
});
