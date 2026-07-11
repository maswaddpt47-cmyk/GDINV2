const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '.',
  testMatch: 'tests-e2e.spec.js',
  timeout: 90000,
  use: {
    headless: true,
    viewport: { width: 1440, height: 900 },
    baseURL: 'file:///home/user/GDINV2',
    launchOptions: {
      executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  },
  reporter: [['list']],
});
