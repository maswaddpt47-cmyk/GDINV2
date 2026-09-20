# vendor/ — librairies servies depuis le dépôt

Ces fichiers étaient chargés depuis `cdnjs.cloudflare.com` et
`fonts.googleapis.com`. Mesuré le 20/09/2026 : sans accès au CDN, `Chart`
n'était jamais défini, le boot s'arrêtait et la page restait **blanche**. Un
réseau de collectivité qui filtre les CDN suffisait à casser le dashboard.
Les polices Google transmettaient en plus l'IP des visiteurs à Google.

| Chemin | Version | Source (npm) |
|---|---|---|
| `leaflet/leaflet.js`, `leaflet.css`, `images/` | 1.9.4 | `leaflet@1.9.4` (`dist/`) |
| `chartjs/chart.umd.min.js` | 4.4.1 | `chart.js@4.4.1` (`dist/chart.umd.js`, déjà minifié) |
| `xlsx/xlsx.full.min.js` | 0.18.5 | `xlsx@0.18.5` (`dist/`) |
| `fonts/*.woff2` + `fonts.css` | — | `@fontsource/space-grotesk`, `@fontsource/jetbrains-mono`, sous-ensemble latin |

## Mettre à jour une librairie

```bash
npm pack leaflet@<version>
tar xzf leaflet-<version>.tgz
cp package/dist/leaflet.js package/dist/leaflet.css vendor/leaflet/
cp package/dist/images/*.png vendor/leaflet/images/
```

Même principe pour les autres. Reporter la version dans le tableau ci-dessus
et relancer `npx playwright test` avant de pousser.

`leaflet.css` référence `images/` en relatif : déplacer `leaflet.css` sans
son dossier `images/` casse les icônes silencieusement.

## Ce qui reste externe

Deux appels réseau subsistent à l'exécution, non rapatriables :

- les tuiles de la carte (`basemaps.cartocdn.com`) — transmettent l'IP des
  visiteurs à CARTO ;
- le référentiel des communes (`geo.api.gouv.fr`) — service public de l'État.

Sans eux la carte est vide ou sans fond, mais le reste du dashboard
fonctionne : ils sont appelés après le boot, pas pendant.
