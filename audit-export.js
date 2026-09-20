#!/usr/bin/env node
/**
 * Audit d'un export GDIN avant d'en tirer un rapport.
 *
 *   node audit-export.js <fichier.xls|.xlsx|.csv|.txt>
 *
 * Rejoue exactement le parseur de l'application (gdin-pure.js) et rend
 * compte de ce qui entre dans le dashboard, de ce qui est écarté et des
 * anomalies de données. Ne lit que le fichier, n'écrit rien, n'affiche
 * aucune donnée nominative.
 */
const fs = require('fs');
const path = require('path');
const P = require('./gdin-pure.js');

const NOMINATIVES = ['nom','prenom','prénom','telephone','téléphone','email','mail','adresse','naissance','observation'];

function lireLignes(fichier) {
  const ext = path.extname(fichier).toLowerCase();
  if (ext === '.xls' || ext === '.xlsx') {
    let X;
    try { X = require('xlsx'); }
    catch (e) { erreur("le module 'xlsx' est absent. Lancez : npm install"); }
    const buf = fs.readFileSync(fichier);
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    const wb = X.read(ab, { type: 'array', cellDates: false });
    const feuille = wb.SheetNames[0];
    return { feuille, rows: X.utils.sheet_to_json(wb.Sheets[feuille], { header: 1, defval: '' }) };
  }
  const texte = fs.readFileSync(fichier, 'utf-8');
  const sep = texte.indexOf('\t') >= 0 ? '\t' : ';';
  const lignes = texte.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
    .filter(l => l.trim() !== '' && !l.startsWith('## Sheet:'));
  return { feuille: '(texte)', rows: lignes.map(l => l.split(sep)) };
}

const erreur = m => { console.error('\n  ✗ ' + m + '\n'); process.exit(1); };
const titre = t => console.log('\n' + t + '\n' + '─'.repeat(t.length));
const ligne = (l, v, s) => console.log('  ' + String(l).padEnd(42) + String(v).padStart(8) + (s ? '  ' + s : ''));
const pourcent = (n, t) => t ? Math.round(n / t * 100) + ' %' : '—';

function formeDate(v) {
  const brut = String(v);
  const repare = P.demojibakeUtf16(brut);
  if (repare !== brut) return formeDate(repare) + ' (encodage réparé)';
  const s = brut.trim();
  if (s === '') return '(vide)';
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) return 'JJ/MM/AAAA';
  if (/^\d{1,2}\/\d{1,2}\/\d{4} \d{1,2}:\d{2}/.test(s)) return 'JJ/MM/AAAA HH:MM';
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return 'AAAA-MM-JJ';
  if (/^\d{4}-\d{2}-\d{2}[T ]/.test(s)) return 'AAAA-MM-JJ HH:MM';
  if (/^\d+$/.test(s)) return 'série Excel (entier)';
  if (/^\d+\.\d+$/.test(s)) return 'série Excel (décimale)';
  return 'autre';
}

function main() {
  const fichier = process.argv[2];
  if (!fichier) erreur('usage : node audit-export.js <fichier.xls>');
  if (!fs.existsSync(fichier)) erreur('fichier introuvable : ' + fichier);

  const { feuille, rows } = lireLignes(fichier);
  const enTetes = rows[0] || [];
  const stat = fs.statSync(fichier);

  console.log('\n═══ Audit d\'export GDIN ═══');
  ligne('Fichier', path.basename(fichier));
  ligne('Taille', (stat.size / 1048576).toFixed(1) + ' Mo');
  ligne('Modifié le', stat.mtime.toLocaleDateString('fr-FR'));
  ligne('Feuille', feuille);
  ligne('Lignes de données', rows.length - 1);
  ligne('Colonnes', enTetes.length);

  // ── Colonnes ───────────────────────────────────────────────────────────
  titre('Reconnaissance des colonnes');
  const I = P.mapColonnes(enTetes);
  const absentes = Object.keys(I).filter(k => I[k] < 0);
  if (absentes.length === 0) console.log('  Toutes les colonnes attendues sont reconnues.');
  else absentes.forEach(k => ligne('⚠ colonne non trouvée', k));

  // ── Import ─────────────────────────────────────────────────────────────
  titre('Ce que l\'application retient');
  let res;
  try { res = P.parseRows(rows); }
  catch (e) { erreur('le parseur refuse ce fichier : ' + e.message); }
  const st = res.stats, recs = res.records;
  ligne('Lignes lues', st.lues);
  ligne('Retenues', st.retenues, pourcent(st.retenues, st.lues));
  ligne('Écartées', st.ecartees, pourcent(st.ecartees, st.lues));
  Object.entries(st.motifs).filter(([, v]) => v > 0)
    .forEach(([k, v]) => ligne('  └ ' + k.replace(/_/g, ' '), v));

  // ── Détail des écartées ────────────────────────────────────────────────
  if (st.ecartees > 0) {
    titre('Nature des lignes écartées');
    const parType = {}, parStructure = {};
    const iType = I.type, iLieu = I.lieu, iStruct = I.structure;
    for (let i = 1; i < rows.length; i++) {
      const c = rows[i];
      if (!c || c.length < 5) continue;
      const lieu = String(iLieu >= 0 ? c[iLieu] || '' : '').trim();
      if (P.extractDominantCms(lieu)) continue;
      String(iType >= 0 ? c[iType] || '' : '').split(';').map(s => s.trim()).filter(Boolean)
        .forEach(t => parType[t] = (parType[t] || 0) + 1);
      const s = String(iStruct >= 0 ? c[iStruct] || '' : '').trim() || '(vide)';
      parStructure[s] = (parStructure[s] || 0) + 1;
    }
    console.log('  Par type d\'action :');
    Object.entries(parType).sort((a, b) => b[1] - a[1]).slice(0, 8).forEach(([k, v]) => ligne('  ' + k, v));
    console.log('  Par structure orienteur (top 6) :');
    Object.entries(parStructure).sort((a, b) => b[1] - a[1]).slice(0, 6).forEach(([k, v]) => ligne('  ' + k.slice(0, 38), v));
  }

  // ── Formats de dates ───────────────────────────────────────────────────
  titre('Formats de dates détectés');
  console.log('  Un format inattendu fait écarter les lignes concernées.');
  [['Date demande', I.dateDem], ['Date action', I.dateAct],
   ['Date planifiée', I.datePlanif], ['Date réalisation', I.dateReal]].forEach(([nom, idx]) => {
    if (idx < 0) return;
    const f = {};
    for (let i = 1; i < rows.length; i++) { const k = formeDate(rows[i][idx]); f[k] = (f[k] || 0) + 1; }
    const detail = Object.entries(f).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} (${v})`).join(', ');
    console.log('  ' + nom.padEnd(20) + detail);
  });

  // ── Volumétrie métier ──────────────────────────────────────────────────
  titre('Volumétrie');
  const demandes = P.countDemandes(recs);
  ligne('Enregistrements retenus', recs.length);
  ligne('Demandes distinctes (N° Demande)', demandes);
  ligne('Actions par demande (moyenne)', demandes ? (recs.length / demandes).toFixed(1) : '—');
  const annees = {};
  recs.forEach(r => { const a = r.date_demande.slice(0, 4); annees[a] = (annees[a] || 0) + 1; });
  Object.entries(annees).sort().forEach(([a, n]) => ligne('  ' + a, n));

  // ── États ──────────────────────────────────────────────────────────────
  titre('États des actions');
  const etats = {};
  recs.forEach(r => { const e = r.etat || '(vide)'; etats[e] = (etats[e] || 0) + 1; });
  Object.entries(etats).sort((a, b) => b[1] - a[1])
    .forEach(([e, n]) => ligne(e, n, pourcent(n, recs.length)));
  ligne('→ comptées « réalisées »', recs.filter(r => P.isRealisee(r.etat)).length);

  // ── Types et thématiques ───────────────────────────────────────────────
  titre('Types d\'action');
  const types = {};
  recs.forEach(r => (r.type_action || []).forEach(t => types[t] = (types[t] || 0) + 1));
  Object.entries(types).sort((a, b) => b[1] - a[1]).forEach(([t, n]) => ligne(t, n));
  const sansType = recs.filter(r => !r.type_action || !r.type_action.length).length;
  if (sansType) ligne('⚠ sans type d\'action (Reservation)', sansType);

  // ── CMS ────────────────────────────────────────────────────────────────
  titre('Répartition par CMS');
  const cms = {};
  recs.forEach(r => cms[r.cms] = (cms[r.cms] || 0) + 1);
  ligne('CMS distincts', Object.keys(cms).length);
  if (cms['Autre structure']) ligne('⚠ « Autre structure » (libellé non reconnu)', cms['Autre structure']);

  // ── Doublons ───────────────────────────────────────────────────────────
  titre('Doublons potentiels');
  const vus = new Set(); let dup = 0;
  recs.forEach(r => {
    const k = `${r.date_demande}|${r.date_action || ''}|${r.conum || ''}|${r.cms || ''}|${r.commune || ''}|${r.orienteur || ''}|${(r.themas || []).slice().sort().join('/')}|${(r.type_action || []).slice().sort().join('+')}`;
    if (vus.has(k)) dup++; else vus.add(k);
  });
  ligne('Lignes identiques (clé de fusion)', dup, pourcent(dup, recs.length));
  console.log('  L\'application les ignore à l\'import : ' + (recs.length - dup) + ' entreront en base.');

  // ── Délais ─────────────────────────────────────────────────────────────
  titre('Délais (jours ouvrés, demande → action)');
  const delais = [];
  let negatifs = 0;
  recs.forEach(r => {
    if (!r.date_demande || !r.date_action) return;
    const d = P.bizDays(new Date(r.date_demande), new Date(r.date_action));
    if (d === null) negatifs++; else delais.push(d);
  });
  delais.sort((a, b) => a - b);
  if (delais.length) {
    ligne('Calculables', delais.length, pourcent(delais.length, recs.length));
    ligne('Moyenne', Math.round(delais.reduce((s, d) => s + d, 0) / delais.length) + ' j');
    ligne('Médiane', delais[Math.floor(delais.length / 2)] + ' j');
    ligne('Maximum', delais[delais.length - 1] + ' j');
  }
  if (negatifs) ligne('⚠ action antérieure à la demande', negatifs, 'exclues du calcul');
  const reaAvant = recs.filter(r => r.date_realisation && r.date_realisation < r.date_demande).length;
  if (reaAvant) ligne('⚠ réalisation antérieure à la demande', reaAvant);

  // ── RGPD ───────────────────────────────────────────────────────────────
  titre('RGPD');
  const colNominatives = enTetes.map(String)
    .filter(h => NOMINATIVES.some(n => h.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(n.normalize('NFD').replace(/[̀-ͯ]/g, ''))));
  if (colNominatives.length) {
    console.log('  Colonnes nominatives présentes dans le fichier source :');
    colNominatives.forEach(c => console.log('    · ' + c));
    const champs = Object.keys(recs[0] || {});
    const fuite = champs.filter(c => NOMINATIVES.some(n => c.toLowerCase().includes(n)));
    console.log(fuite.length
      ? '  ✗ ALERTE : ces champs sont importés dans l\'application : ' + fuite.join(', ')
      : '  ✓ Aucune n\'est importée dans l\'application (minimisation respectée).');
  } else console.log('  Aucune colonne nominative détectée dans le fichier source.');
  console.log('  Rappel : le champ « motif » est du texte libre, relisez-le avant projection.\n');
}

main();
