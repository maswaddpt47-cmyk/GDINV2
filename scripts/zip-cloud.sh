#!/usr/bin/env bash
# Fabrique le zip de l'application à téléverser sur le cloud du CD47 (Nextcloud).
# Usage : scripts/zip-cloud.sh [dossier de sortie]   (défaut : le dossier courant)
# Contenu : dossier GDIN/ = index.html, gdin-pure.js, vendor/ (versionnés dans git,
# état de HEAD) + distribution/ (A-LIRE-AVANT-D-OUVRIR.txt, LISEZ-MOI.txt avec la
# version). Aucune donnée, aucun test, aucune note. Le zip porte la date du jour
# (heure de Paris) et le numéro de version est le dernier commit touchant l'appli.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
sortie="$(cd "${1:-.}" && pwd)"
if [ -n "$(git status --porcelain -- index.html gdin-pure.js vendor distribution)" ]; then
  echo "❌ Modifications non commitées dans l'application : commitez avant de fabriquer le zip." >&2
  exit 1
fi
version="$(git log -1 --format=%h -- index.html gdin-pure.js vendor)"
date_fr="$(TZ=Europe/Paris date +%d/%m/%Y)"
date_iso="$(TZ=Europe/Paris date +%Y-%m-%d)"
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
mkdir "$tmp/GDIN"
git archive HEAD index.html gdin-pure.js vendor | tar -x -C "$tmp/GDIN"
cp distribution/A-LIRE-AVANT-D-OUVRIR.txt "$tmp/GDIN/"
sed "s/@VERSION@/$version/; s#@DATE@#$date_fr#" distribution/LISEZ-MOI.txt > "$tmp/GDIN/LISEZ-MOI.txt"
rm -f "$sortie/GDIN_$date_iso.zip"
(cd "$tmp" && zip -qr "$sortie/GDIN_$date_iso.zip" GDIN)
echo "✅ $sortie/GDIN_$date_iso.zip — application $version, $(unzip -l "$sortie/GDIN_$date_iso.zip" | tail -1 | awk '{print $2}') fichiers"
