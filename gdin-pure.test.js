const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  pct, esc, excelDate, parseDt, dayDiff, bizDays, monthLabel, typeColor,
  count, countThemas, countTypes, normKey, normCms, extractDominantCms, parseXlsText,
} = require('./gdin-pure.js');

// ─── pct ──────────────────────────────────────────────────────────────────
describe('pct', () => {
  it('25% de 4',          () => assert.equal(pct(1,4), 25));
  it('100% de 5',         () => assert.equal(pct(5,5), 100));
  it('0 sur 0 → 0',       () => assert.equal(pct(0,0), 0));
  it('0 sur n → 0',       () => assert.equal(pct(0,10), 0));
  it('arrondi 33%',       () => assert.equal(pct(1,3), 33));
});

// ─── esc ──────────────────────────────────────────────────────────────────
describe('esc', () => {
  it('balises HTML',       () => assert.equal(esc('<b>test</b>'), '&lt;b&gt;test&lt;/b&gt;'));
  it('guillemets',         () => assert.equal(esc('"hello"'), '&quot;hello&quot;'));
  it('esperluette',        () => assert.equal(esc('a&b'), 'a&amp;b'));
  it('chaîne normale',     () => assert.equal(esc('bonjour'), 'bonjour'));
});

// ─── excelDate ────────────────────────────────────────────────────────────
describe('excelDate', () => {
  it('DD/MM/YYYY',                  () => assert.equal(excelDate('01/01/2025'), '2025-01-01'));
  it('DD/MM/YYYY jour 2 chiffres',  () => assert.equal(excelDate('15/03/2025'), '2025-03-15'));
  it('YYYY-MM-DD passthrough',      () => assert.equal(excelDate('2025-06-30'), '2025-06-30'));
  it('serial Excel 45658',          () => assert.equal(excelDate(45658), '2025-01-01'));
  it('null → null',                 () => assert.equal(excelDate(null), null));
  it('vide → null',                 () => assert.equal(excelDate(''), null));
  it('zéro → null',                 () => assert.equal(excelDate(0), null));
});

// ─── parseDt ──────────────────────────────────────────────────────────────
describe('parseDt', () => {
  it('DD/MM/YYYY → Date mois=2',  () => assert.equal(parseDt('15/03/2025').getMonth(), 2));
  it('YYYY-MM-DD → Date jour=15', () => assert.equal(parseDt('2025-03-15').getDate(), 15));
  it('null → null',               () => assert.equal(parseDt(null), null));
  it('vide → null',               () => assert.equal(parseDt(''), null));
  it('Date passée telle quelle',  () => { const d=new Date(2025,0,1); assert.equal(parseDt(d).getFullYear(), 2025); });
});

// ─── dayDiff ──────────────────────────────────────────────────────────────
describe('dayDiff', () => {
  it('4 jours',        () => assert.equal(dayDiff(new Date(2025,0,6), new Date(2025,0,10)), 4));
  it('0 jours',        () => assert.equal(dayDiff(new Date(2025,3,1), new Date(2025,3,1)), 0));
  it('d2 < d1 → null', () => assert.equal(dayDiff(new Date(2025,0,10), new Date(2025,0,6)), null));
  it('null d1 → null', () => assert.equal(dayDiff(null, new Date()), null));
});

// ─── bizDays ──────────────────────────────────────────────────────────────
describe('bizDays', () => {
  it('Lun→Ven = 4',    () => assert.equal(bizDays(new Date(2025,0,6), new Date(2025,0,10)), 4));
  it('Ven→Lun = 1',    () => assert.equal(bizDays(new Date(2025,0,10), new Date(2025,0,13)), 1));
  it('même date = 0',  () => assert.equal(bizDays(new Date(2025,0,6), new Date(2025,0,6)), 0));
  it('d2 < d1 → null', () => assert.equal(bizDays(new Date(2025,0,10), new Date(2025,0,6)), null));
});

// ─── monthLabel ───────────────────────────────────────────────────────────
describe('monthLabel', () => {
  it('2025-03 → Mar 25', () => assert.equal(monthLabel('2025-03'), 'Mar 25'));
  it('2024-01 → Jan 24', () => assert.equal(monthLabel('2024-01'), 'Jan 24'));
  it('2025-12 → Déc 25', () => assert.equal(monthLabel('2025-12'), 'Déc 25'));
});

// ─── count ────────────────────────────────────────────────────────────────
describe('count', () => {
  it('compte par clé',      () => assert.deepEqual(count([{k:'A'},{k:'B'},{k:'A'}],'k'), {A:2,B:1}));
  it('clé manquante → ?',   () => assert.deepEqual(count([{k:'A'},{k:undefined}],'k'), {A:1,'?':1}));
});

// ─── countThemas ──────────────────────────────────────────────────────────
describe('countThemas', () => {
  it('somme correcte',   () => assert.deepEqual(
    countThemas([{themas:['Web','Emploi']},{themas:['Web']},{themas:[]}]),
    {Web:2,Emploi:1}
  ));
  it('aucune → vide',    () => assert.deepEqual(countThemas([{themas:[]}]), {}));
});

// ─── countTypes ───────────────────────────────────────────────────────────
describe('countTypes', () => {
  it('exclut Reservation', () => assert.deepEqual(
    countTypes([
      {type_action:['Accompagnement','Reservation']},
      {type_action:['Accompagnement']},
      {type_action:['Prise de contact']},
    ]),
    {Accompagnement:2,'Prise de contact':1}
  ));
});

// ─── normKey ──────────────────────────────────────────────────────────────
describe('normKey', () => {
  it('accents + lowercase', () => assert.equal(normKey('Médiathèque'), 'mediatheque'));
  it('normalise espaces',   () => assert.equal(normKey('  CMS  Agen  '), 'cms agen'));
  it('chaîne vide',         () => assert.equal(normKey(''), ''));
});

// ─── normCms ──────────────────────────────────────────────────────────────
describe('normCms', () => {
  it('CMS Tonneins → lui-même',          () => assert.equal(normCms('CMS Tonneins'), 'CMS Tonneins'));
  it('CMS MONTANOU → CMS Agen Montanou', () => assert.equal(normCms('CMS MONTANOU'), 'CMS Agen Montanou'));
  it('variante accentuée',               () => assert.equal(normCms('Centre Médico-Social de Nérac'), 'CMS Nérac'));
  it('inconnu → null',                   () => assert.equal(normCms('Lieu inexistant'), null));
  it('vide → null',                      () => assert.equal(normCms(''), null));
  it('null → null',                      () => assert.equal(normCms(null), null));
});

// ─── extractDominantCms ───────────────────────────────────────────────────
describe('extractDominantCms', () => {
  it('CMS seul',             () => assert.equal(extractDominantCms('CMS Tonneins'), 'CMS Tonneins'));
  it('DSIAN exclu',          () => assert.equal(extractDominantCms('CMS Tonneins;DSIAN'), 'CMS Tonneins'));
  it('vide → ""',            () => assert.equal(extractDominantCms(''), ''));
  it('inconnu → Autre',      () => assert.equal(extractDominantCms('Lieu sans mapping'), 'Autre structure'));
  it('variante canonisée',   () => assert.equal(extractDominantCms('Centre Médico-Social Agen Montanou'), 'CMS Agen Montanou'));
});

// ─── parseXlsText ─────────────────────────────────────────────────────────
describe('parseXlsText', () => {
  const HDR = 'date demande\tdate action\ttype action\tlieu / cms\tcommune\tconseiller num\tthematique\torienteur';

  it('parse une ligne valide', () => {
    const {records} = parseXlsText([HDR, '01/01/2025\t05/01/2025\tAccompagnement\tCMS Tonneins\tTonneins\tTUAL Corentin\tInternet\t'].join('\n'));
    assert.equal(records.length, 1);
    assert.equal(records[0].date_demande, '2025-01-01');
    assert.equal(records[0].cms, 'CMS Tonneins');
    assert.equal(records[0].type_action[0], 'Accompagnement');
  });

  it('Reservation exclu des types', () => {
    const tsv = ['date demande\ttype action\tlieu / cms\tcommune\tconseiller num', '2025-01-01\tReservation\tCMS Fumel\tFumel\tTUAL Corentin'].join('\n');
    const {records} = parseXlsText(tsv);
    assert.deepEqual(records[0].type_action, []);
  });

  it('lève erreur si Date demande absente', () => {
    assert.throws(() => parseXlsText('col1\tcol2\tcol3\tcol4\tcol5\n1\t2\t3\t4\t5'));
  });

  it('lève erreur si fichier vide', () => {
    assert.throws(() => parseXlsText(''));
  });
});
