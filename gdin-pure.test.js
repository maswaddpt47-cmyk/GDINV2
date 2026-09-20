const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  pct, esc, excelDate, parseDt, dayDiff, bizDays, monthLabel, typeColor,
  count, countThemas, countTypes, normKey, normCms, extractDominantCms, parseXlsText,
  normEtat, isRealisee, countDemandes, parseRows, mapColonnes,
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

// ─── isRealisee ───────────────────────────────────────────────────────────
// Régression : "Non réalisée".includes("réalisée") === true. Le KPI
// « Demandes réalisées » affichait 100 % sur toutes les positions du filtre.
describe('isRealisee', () => {
  it('Réalisée',                 () => assert.equal(isRealisee('Réalisée'), true));
  it('realisee sans accent',     () => assert.equal(isRealisee('realisee'), true));
  it('Non réalisée → FAUX',      () => assert.equal(isRealisee('Non réalisée'), false));
  it('non realisee → FAUX',      () => assert.equal(isRealisee('non realisee'), false));
  it('En attente',               () => assert.equal(isRealisee('En attente'), false));
  it('Annulée',                  () => assert.equal(isRealisee('Annulée'), false));
  it('Excusée',                  () => assert.equal(isRealisee('Excusée'), false));
  it('chaîne vide',              () => assert.equal(isRealisee(''), false));
  it('null',                     () => assert.equal(isRealisee(null), false));
  it('undefined',                () => assert.equal(isRealisee(undefined), false));
  it('espaces autour',           () => assert.equal(isRealisee('  Réalisée  '), true));
});

// ─── normEtat ─────────────────────────────────────────────────────────────
describe('normEtat', () => {
  it('minuscule + sans accent',  () => assert.equal(normEtat('Réalisée'), 'realisee'));
  it('trim',                     () => assert.equal(normEtat(' En attente '), 'en attente'));
  it('null → chaîne vide',       () => assert.equal(normEtat(null), ''));
});

// ─── countDemandes ────────────────────────────────────────────────────────
// Une demande génère plusieurs lignes d'action (jusqu'à 186 sur l'export réel).
describe('countDemandes', () => {
  it('3 lignes, 1 demande',      () => assert.equal(countDemandes([{id_demande:'7161'},{id_demande:'7161'},{id_demande:'7161'}]), 1));
  it('2 demandes distinctes',    () => assert.equal(countDemandes([{id_demande:'1'},{id_demande:'2'}]), 2));
  it('ignore les id vides',      () => assert.equal(countDemandes([{id_demande:''},{id_demande:'1'}]), 1));
  it('tableau vide',             () => assert.equal(countDemandes([]), 0));
  it('null',                     () => assert.equal(countDemandes(null), 0));
});

// ─── parseRows : parseur d'import unique ──────────────────────────────────
const EN_TETES = ['N° Demande','Nom_Bénéficiaire','Commune','Thématique(s)','Motif','Type Action',
  'Lieu / CMS','Date action (saisie)','Orienteur / Prescripteur','Date demande','Référent',
  'Conseiller numérique','Structure orienteur','Téléphone bénéficiaire','Email bénéficiaire',
  'Observation','Bénéficiaire connu','Urgence',"Libellé de l'état de l'action",
  'Date planifiée de l\'action','Date de réalisation de l\'action'];
const ligne = (o={}) => {
  const c = new Array(21).fill('');
  c[0]=o.n||'1'; c[1]=o.nom||'DUPONT Jean'; c[2]=o.commune||'AGEN'; c[3]=o.thema||'Logement';
  c[4]=o.motif||'motif'; c[5]=o.type||'Accompagnement'; c[6]=o.lieu===undefined?'CMS Marmande':o.lieu;
  c[7]=o.dateAct===undefined?'02/01/2025':o.dateAct;
  c[9]=o.dateDem===undefined?'01/01/2025':o.dateDem;
  c[11]=o.conum||'MARTIN Paul';
  c[12]=o.structure||'CCAS'; c[13]=o.tel||'0600000000'; c[14]=o.email||'a@b.fr';
  c[15]=o.obs||'observation libre'; c[16]=o.benef||'Oui'; c[17]=o.urgence||'Non';
  c[18]=o.etat||'Réalisée';
  return c;
};

describe('parseRows — comptage et motifs d\'exclusion', () => {
  it('compte les lignes lues et retenues', () => {
    const r = parseRows([EN_TETES, ligne(), ligne({n:'2'})]);
    assert.equal(r.stats.lues, 2);
    assert.equal(r.stats.retenues, 2);
    assert.equal(r.stats.ecartees, 0);
  });
  it('écarte une ligne sans Lieu / CMS et le dit', () => {
    const r = parseRows([EN_TETES, ligne(), ligne({n:'2', lieu:''})]);
    assert.equal(r.stats.retenues, 1);
    assert.equal(r.stats.ecartees, 1);
    assert.equal(r.stats.motifs.lieu_cms_vide, 1);
  });
  it('écarte une ligne sans date de demande et le dit', () => {
    const r = parseRows([EN_TETES, ligne(), ligne({n:'2', dateDem:''})]);
    assert.equal(r.stats.retenues, 1);
    assert.equal(r.stats.motifs.date_demande_absente, 1);
  });
  it('écarte une ligne trop courte et le dit', () => {
    const r = parseRows([EN_TETES, ligne(), ['1','2']]);
    assert.equal(r.stats.retenues, 1);
    assert.equal(r.stats.motifs.ligne_incomplete, 1);
  });
  it('lues = retenues + écartées', () => {
    const r = parseRows([EN_TETES, ligne(), ligne({n:'2',lieu:''}), ligne({n:'3',dateDem:''}), ['x','y']]);
    assert.equal(r.stats.lues, r.stats.retenues + r.stats.ecartees);
  });
  it('signale les colonnes absentes', () => {
    const h = EN_TETES.slice(); h[12]='Colonne inconnue';
    const r = parseRows([h, ligne()]);
    assert.ok(r.stats.colonnes_absentes.includes('structure'));
  });
  it('refuse un fichier sans ligne de données', () => {
    assert.throws(() => parseRows([EN_TETES]), /vide|non reconnu/);
  });
});

// ─── RGPD : la minimisation à l'import est vérifiée, pas seulement écrite ──
// Le fichier source contient nom, téléphone, email et observations du
// bénéficiaire. Aucun de ces champs ne doit entrer dans l'application.
describe('parseRows — minimisation RGPD', () => {
  const INTERDITS = ['nom','prenom','prénom','beneficiaire','bénéficiaire','telephone','téléphone',
    'tel','email','mail','adresse','naissance','observation','nir','securite_sociale'];
  it('aucun champ nominatif dans les enregistrements produits', () => {
    const r = parseRows([EN_TETES, ligne()]);
    const champs = Object.keys(r.records[0]).map(k => k.toLowerCase());
    const fautifs = champs.filter(c => INTERDITS.some(i => c.includes(i)));
    assert.deepEqual(fautifs, [], 'champs nominatifs importés : ' + fautifs.join(', '));
  });
  it('aucune valeur nominative du fichier source ne se retrouve dans un enregistrement', () => {
    const r = parseRows([EN_TETES, ligne({nom:'DUPONT Jean', tel:'0612345678', email:'jean@exemple.fr', obs:'situation personnelle'})]);
    const dump = JSON.stringify(r.records[0]);
    ['DUPONT Jean','0612345678','jean@exemple.fr','situation personnelle']
      .forEach(v => assert.ok(!dump.includes(v), 'donnée personnelle importée : ' + v));
  });
  it('benef_connu reste un booléen, pas une identité', () => {
    const r = parseRows([EN_TETES, ligne({benef:'Oui'})]);
    assert.equal(r.records[0].benef_connu, true);
  });
});

// ─── mapColonnes ──────────────────────────────────────────────────────────
describe('mapColonnes', () => {
  it('retrouve les colonnes de l\'export réel', () => {
    const I = mapColonnes(EN_TETES);
    assert.equal(I.dateDem, 9);
    assert.equal(I.lieu, 6);
    assert.equal(I.type, 5);
    assert.equal(I.etat, 18);
    assert.equal(I.nDem, 0);
  });
  it('préfère Référent à Orienteur / Prescripteur', () => {
    assert.equal(mapColonnes(EN_TETES).orienteur, 10);
  });
  it('ne confond pas Nom_Bénéficiaire avec Bénéficiaire connu', () => {
    assert.equal(mapColonnes(EN_TETES).benef, 16);
  });
  it('retourne -1 pour une colonne absente', () => {
    assert.equal(mapColonnes(['A','B','C','D','E']).lieu, -1);
  });
});
