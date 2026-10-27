const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  pct, esc, excelDate, parseDt, dayDiff, bizDays, monthLabel, typeColor,
  count, countEntries, countThemas, lignesAvecThemas, countTypes, normKey, normCms, extractDominantCms, parseXlsText,
  normEtat, isRealisee, countDemandes, dateFr, mentionRevisabilite, parseRows, mapColonnes, demojibakeUtf16, moisDeLaPeriode, libelleLignes,
  cleDoublon, compterDoublons,
  estAtelier, cleSessionAtelier, compterSessionsAtelier, statsAteliers,
  numeroterParticipants, cleFusion, numeroterLignes, fusionnerImport, attribuerConum, deriverAttributionCms,
  neutraliserFormule, celluleCSV, validerSauvegardeJSON, baseAncienne, completerRangs,
  categorieEtat, repartitionEtats, deriverActions, delaisParDemande, reactivite48, dansPeriode, tauxRealisation, filtrerParType, evolutionAnnuelle,
  indicateursFiabilite, defautsSaisie, syntheseFiabilite, niveauFiabilite,
  formatResumeImport, normCommuneKey, comblerConum, normKeySouple, CMS_MAP_RAW,
  rattacherCommune, COMMUNES_47,
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
  // AG-004 : une valeur se rapporte aux lignes, une saisie répétée donnait 200 %.
  it('thématique répétée sur une ligne → comptée une fois', () =>
    assert.deepEqual(countThemas([{themas:['Logement','Logement']}]), {Logement:1}));
});
describe('lignesAvecThemas', () => {
  // AG-004 : additionner les parts du Top 3 donnait 200 % sur ce jeu.
  it('union : une ligne portant deux thématiques du top compte une fois', () => {
    const l = [{themas:['A','B']},{themas:['A','C']},{themas:['B','C']},{themas:[]}];
    assert.equal(lignesAvecThemas(l, ['A','B','C']), 3);
  });
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
  c[10]=o.orienteur===undefined?'':o.orienteur;
  c[11]=o.conum===undefined?'MARTIN Paul':o.conum;
  c[12]=o.structure===undefined?'CCAS':o.structure; c[13]=o.tel||'0600000000'; c[14]=o.email||'a@b.fr';
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
  it('écarte une ligne sans Lieu / CMS ni structure et le dit', () => {
    const r = parseRows([EN_TETES, ligne(), ligne({n:'2', lieu:'', structure:''})]);
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


// ─── demojibakeUtf16 ──────────────────────────────────────────────────────
// Défaut mesuré le 20/09/2026 sur l'export de septembre : la colonne
// « Date action (saisie) » arrive avec deux octets ASCII inversés par
// caractère. Sans réparation, date_action est null sur 100 % des lignes.
describe('demojibakeUtf16', () => {
  it('répare une date de l\'export réel', () => {
    assert.equal(demojibakeUtf16('\u3830\u302f\u2f33\u3032\u3232'), '08/03/2022');
  });
  it('laisse une date saine intacte', () => {
    assert.equal(demojibakeUtf16('08/03/2022'), '08/03/2022');
  });
  it('laisse le texte accentué intact', () => {
    assert.equal(demojibakeUtf16('Réalisée'), 'Réalisée');
    assert.equal(demojibakeUtf16('CMS Marmande'), 'CMS Marmande');
    assert.equal(demojibakeUtf16('Numérique de base'), 'Numérique de base');
  });
  it('laisse une chaîne vide intacte', () => {
    assert.equal(demojibakeUtf16(''), '');
  });
  it('renonce si le décodage ne donne pas de l\'ASCII imprimable', () => {
    assert.equal(demojibakeUtf16('東京都'), '東京都');
  });
  it('tolère un octet nul final (longueur impaire)', () => {
    // "abc" en UTF-16LE mal lu : 0x6261, 0x0063
    assert.equal(demojibakeUtf16('\u6261\u0063'), 'abc');
  });
});

describe('parseRows — réparation d\'encodage', () => {
  const moji = '\u3830\u302f\u2f33\u3032\u3232'; // 08/03/2022
  it('décode une Date action illisible au lieu de la perdre', () => {
    const r = parseRows([EN_TETES, ligne({ dateAct: moji, dateDem: '01/03/2022' })]);
    assert.equal(r.records[0].date_action, '2022-03-08');
  });
  it('compte les cellules réparées dans les stats', () => {
    const r = parseRows([EN_TETES, ligne({ dateAct: moji, dateDem: '01/03/2022' })]);
    assert.equal(r.stats.cellules_reparees, 1);
  });
  it('ne répare rien sur un export sain', () => {
    const r = parseRows([EN_TETES, ligne()]);
    assert.equal(r.stats.cellules_reparees, 0);
  });
  it('le compte rendu d\'import signale les réparations', () => {
    const r = parseRows([EN_TETES, ligne({ dateAct: moji, dateDem: '01/03/2022' })]);
    assert.match(formatResumeImport(r.stats), /1 cellules réparées \(encodage\)/);
  });
  it('le compte rendu reste muet sans réparation', () => {
    const r = parseRows([EN_TETES, ligne()]);
    assert.doesNotMatch(formatResumeImport(r.stats), /réparées/);
  });
});

// ─── parseRows — famille A : CMS saisi dans « Structure orienteur » ───────
// Sur l'export de septembre 2026, 1 050 lignes portent un CMS identifiable
// dans « Structure orienteur » alors que « Lieu / CMS » est vide. Le repli
// doit rester strict : extractDominantCms() rangerait tout libellé inconnu
// sous « Autre structure » et ferait entrer 5 158 lignes de plus.
describe('parseRows — CMS lu dans la structure orienteur', () => {
  it('récupère une ligne dont le CMS est dans la structure', () => {
    const r = parseRows([EN_TETES, ligne({ lieu: '', structure: 'CMS Tonneins' })]);
    assert.equal(r.records.length, 1);
    assert.equal(r.records[0].cms, 'CMS Tonneins');
  });
  it('normalise une variante connue du libellé', () => {
    const r = parseRows([EN_TETES, ligne({ lieu: '', structure: 'Centre Médico-Social de Marmande' })]);
    assert.equal(r.records[0].cms, 'CMS Marmande');
  });
  it('accepte une structure inconnue sous « Autre structure »', () => {
    const r = parseRows([EN_TETES, ligne({ lieu: '', structure: 'Foyer inconnu de Test' })]);
    assert.equal(r.records.length, 1);
    assert.equal(r.records[0].cms, 'Autre structure');
  });
  it('écarte toujours une ligne sans lieu ni structure', () => {
    const r = parseRows([EN_TETES, ligne({ lieu: '', structure: '' }), ligne({ n: '2' })]);
    assert.equal(r.records.length, 1);
    assert.equal(r.stats.motifs.lieu_cms_vide, 1);
  });
  it('ne touche pas une ligne dont le lieu est renseigné', () => {
    const r = parseRows([EN_TETES, ligne({ lieu: 'CMS Tonneins', structure: 'CMS Nérac' })]);
    assert.equal(r.records[0].cms, 'CMS Tonneins');
    assert.equal(r.stats.cms_via_structure, 0);
  });
  it('compte les reprises dans les stats', () => {
    const r = parseRows([EN_TETES, ligne({ lieu: '', structure: 'CMS Tonneins' })]);
    assert.equal(r.stats.cms_via_structure, 1);
  });
  it('le compte rendu d\'import signale les reprises', () => {
    const r = parseRows([EN_TETES, ligne({ lieu: '', structure: 'CMS Tonneins' })]);
    assert.match(formatResumeImport(r.stats), /1 lieux lus dans la structure orienteur/);
  });
});

// ─── normCommuneKey ───────────────────────────────────────────────────────
describe('normCommuneKey', () => {
  it('neutralise la casse',      () => assert.equal(normCommuneKey('agen'), normCommuneKey('AGEN')));
  it('neutralise les accents',   () => assert.equal(normCommuneKey('Nérac'), normCommuneKey('NERAC')));
  it('neutralise les tirets',    () => assert.equal(normCommuneKey('VILLENEUVE-SUR-LOT'), normCommuneKey('Villeneuve sur Lot')));
  it('rapproche ST et SAINT',    () => assert.equal(normCommuneKey('ST-SYLVESTRE-SUR-LOT'), normCommuneKey('Saint-Sylvestre-sur-Lot')));
  it('rapproche STE et SAINTE',  () => assert.equal(normCommuneKey('STE BAZEILLE'), normCommuneKey('Sainte-Bazeille')));
  it('ne confond pas deux communes distinctes', () => {
    assert.notEqual(normCommuneKey('Agen'), normCommuneKey('Nérac'));
  });
  it('ne mange pas ST à l\'intérieur d\'un mot', () => {
    assert.equal(normCommuneKey('ESTILLAC'), 'ESTILLAC');
  });
});

// ─── parseRows — regroupement des communes ────────────────────────────────
describe('parseRows — communes', () => {
  it('regroupe les graphies sur la plus fréquente', () => {
    const r = parseRows([EN_TETES,
      ligne({ n: '1', commune: 'AGEN' }), ligne({ n: '2', commune: 'AGEN' }),
      ligne({ n: '3', commune: 'agen' })]);
    assert.deepEqual([...new Set(r.records.map(x => x.commune))], ['Agen']);
  });
  it('conserve tirets et accents de la graphie dominante', () => {
    const r = parseRows([EN_TETES,
      ligne({ n: '1', commune: 'Villeneuve-sur-Lot' }), ligne({ n: '2', commune: 'Villeneuve-sur-Lot' }),
      ligne({ n: '3', commune: 'VILLENEUVE SUR LOT' })]);
    assert.equal(r.records[2].commune, 'Villeneuve-sur-Lot');
  });
  it('compte les regroupements dans les stats', () => {
    const r = parseRows([EN_TETES, ligne({ n: '1', commune: 'AGEN' }), ligne({ n: '2', commune: 'Agen' })]);
    assert.equal(r.stats.communes_fusionnees, 1);
  });
  it('ne regroupe rien quand les graphies sont déjà cohérentes', () => {
    const r = parseRows([EN_TETES, ligne({ n: '1', commune: 'AGEN' }), ligne({ n: '2', commune: 'FUMEL' })]);
    assert.equal(r.stats.communes_fusionnees, 0);
  });
  it('départage les ex æquo de façon déterministe hors référentiel', () => {
    const r = parseRows([EN_TETES,
      ligne({ n: '1', commune: 'HAMEAU DE NULLE PART' }),
      ligne({ n: '2', commune: 'Hameau de Nulle Part' })]);
    assert.equal(r.records[0].commune, 'HAMEAU DE NULLE PART');
    assert.equal(r.stats.communes_officielles, 0);
  });
});

// ─── comblerConum ─────────────────────────────────────────────────────────
// « Conseiller numérique » n'est rempli qu'à 30 % ; « Référent » l'est à 99 %
// et porte souvent un conseiller. Combler ici fait primer le constaté sur la
// déduction géographique de CONUM_ATTRIB, qui contredisait le référent sur
// 782 lignes de l'export de septembre.
describe('comblerConum', () => {
  it('comble depuis le référent quand c\'est un conseiller connu', () => {
    const recs = [{ conum: 'MARTIN Paul' }, { conum: '', orienteur: 'MARTIN Paul' }];
    assert.equal(comblerConum(recs), 1);
    assert.equal(recs[1].conum, 'MARTIN Paul');
  });
  it('ignore un référent qui n\'est pas un conseiller', () => {
    const recs = [{ conum: 'MARTIN Paul' }, { conum: '', orienteur: 'CAF' }];
    assert.equal(comblerConum(recs), 0);
    assert.equal(recs[1].conum, '');
  });
  it('ne réécrit jamais un conseiller déjà renseigné', () => {
    const recs = [{ conum: 'MARTIN Paul' }, { conum: 'DURAND Eva', orienteur: 'MARTIN Paul' }];
    comblerConum(recs);
    assert.equal(recs[1].conum, 'DURAND Eva');
  });
  it('traite « ? » comme une absence', () => {
    const recs = [{ conum: 'MARTIN Paul' }, { conum: '?', orienteur: 'MARTIN Paul' }];
    assert.equal(comblerConum(recs), 1);
    assert.equal(recs[1].conum, 'MARTIN Paul');
  });
  it('ne comble rien si aucun conseiller n\'est connu', () => {
    const recs = [{ conum: '', orienteur: 'MARTIN Paul' }];
    assert.equal(comblerConum(recs), 0);
  });
  it('s\'applique à l\'import et alimente les stats', () => {
    const r = parseRows([EN_TETES,
      ligne({ n: '1', conum: 'MARTIN Paul' }),
      ligne({ n: '2', conum: '', orienteur: 'MARTIN Paul' })]);
    assert.equal(r.stats.conum_via_referent, 1);
    assert.equal(r.records[1].conum, 'MARTIN Paul');
  });
});

// ─── parseRows — cycle de vie du Pass Numérique ───────────────────────────
// 4 184 lignes de l'export de septembre. Générées par l'outil, sans
// conseiller ni thématique ni lieu : à écarter par type d'action, jamais par
// nom de structure (UNA 47 porte les deux).
describe('parseRows — cycle Pass', () => {
  it('écarte une ligne purement technique', () => {
    const r = parseRows([EN_TETES, ligne({ n: '1', type: 'Suivi pass' }), ligne({ n: '2' })]);
    assert.equal(r.records.length, 1);
    assert.equal(r.stats.motifs.cycle_pass, 1);
  });
  it('écarte le suivi automatique et le sondage', () => {
    const r = parseRows([EN_TETES,
      ligne({ n: '1', type: 'Demande suivi pass (auto)' }),
      ligne({ n: '2', type: 'Sondage pass' }),
      ligne({ n: '3' })]);
    assert.equal(r.stats.motifs.cycle_pass, 2);
  });
  it('conserve la demande de prescription, qui est un geste de conseiller', () => {
    const r = parseRows([EN_TETES, ligne({ type: 'Demande de prescription de Pass' })]);
    assert.equal(r.records.length, 1);
  });
  it('conserve une ligne mêlant un type technique et une vraie action', () => {
    const r = parseRows([EN_TETES, ligne({ type: 'Suivi pass;Accompagnement' })]);
    assert.equal(r.records.length, 1);
    assert.deepEqual(r.records[0].type_action, ['Suivi pass', 'Accompagnement']);
  });
  it('n\'écarte pas sur le nom de la structure', () => {
    const r = parseRows([EN_TETES, ligne({ type: 'Atelier', lieu: '', structure: 'Foyer inconnu de Test' })]);
    assert.equal(r.records.length, 1);
    assert.equal(r.stats.motifs.cycle_pass, 0);
  });
  it('le compte rendu d\'import détaille le motif', () => {
    const r = parseRows([EN_TETES, ligne({ n: '1', type: 'Suivi pass' }), ligne({ n: '2' })]);
    assert.match(formatResumeImport(r.stats), /1 du cycle Pass/);
  });
});

// ─── normCms — lieux partenaires ajoutés le 20/09/2026 ────────────────────
// ABRIS arrivait dans « Autre structure » sous dix graphies pour 181 lignes.
// normKey() ne neutralise ni ponctuation ni mot surnuméraire : chaque graphie
// a sa propre clé, et ces tests garantissent qu'aucune ne se reperd.
describe('normCms — partenaires', () => {
  const abris = ['ABRIS', 'Association ABRIS', 'Association Abris Casseneuil',
    'Association ABRIS (Casseneuil)', 'Association ABRIS ( Casseneuil)',
    'Association ABRIS - Casseneuil', 'Asso ABRIS (Casseneuil)',
    'Asso ABRIS Casseneuil', 'ABRIS - CASSENEUIL', 'Association ABRIS Casseneuil'];
  abris.forEach(v => {
    it(`regroupe « ${v} »`, () => assert.equal(normCms(v), 'Association ABRIS Casseneuil'));
  });
  it('regroupe les deux graphies de l\'IME', () => {
    assert.equal(normCms('IME MONTCLAIRJOIE'), 'IME Montclairjoie');
    assert.equal(normCms('IME Montclairjoie'), 'IME Montclairjoie');
  });
  it('regroupe France Services Pays de Lauzun avec et sans « du »', () => {
    assert.equal(normCms('FRANCE SERVICES DU PAYS DE LAUZUN'), 'France Services Pays de Lauzun');
    assert.equal(normCms('France Services Pays de Lauzun'), 'France Services Pays de Lauzun');
  });
  it('regroupe Service Environnement avec et sans la commune', () => {
    assert.equal(normCms('Association Service Environnement - Sainte-Bazeille'), 'Association Service Environnement');
    assert.equal(normCms('Association  Service Environnement'), 'Association Service Environnement');
  });
  it('sort le collège et le club des aînés de « Autre structure »', () => {
    assert.equal(normCms('collège lucie aubrac'), 'Collège Lucie Aubrac');
    assert.equal(normCms('Club des Aînés de la Cascade - Fauillet'), 'Club des Aînés Fauillet');
  });
  it('laisse inconnu ce qui n\'a pas été tranché', () => {
    // « Villeneuve sur Lot » est une commune saisie dans la case du lieu.
    // Tranché par l'utilisateur le 20/09/2026 : ces lignes ne sont pas son
    // activité, elles restent en « Autre structure ». Ne pas la mapper.
    assert.equal(normCms('Villeneuve sur Lot'), null);
  });
});

// ─── normCms — rattrapage souple ──────────────────────────────────────────
// Les saisies restent libres : chaque export apporte de nouvelles façons
// d'écrire un partenaire déjà connu. Sans dernier recours, chacune retombe
// dans « Autre structure » et la dérive est continue.
describe('normCms — rattrapage des graphies nouvelles', () => {
  it('rattrape une ponctuation inédite', () => {
    assert.equal(normCms('Association ABRIS / Casseneuil'), 'Association ABRIS Casseneuil');
  });
  it('rattrape « asso » écrit autrement', () => {
    assert.equal(normCms("l'association ABRIS de Casseneuil"), 'Association ABRIS Casseneuil');
  });
  it('rattrape une variante de médiathèque', () => {
    assert.equal(normCms('Médiathèque, municipale de Foulayronnes'), 'Médiathèque Foulayronnes');
  });
  it('laisse le mapping explicite décider en premier', () => {
    assert.equal(normCms('CCAS Fumel'), 'CMS Fumel');
  });
  it('ne rattache pas un lieu réellement inconnu', () => {
    assert.equal(normCms('Foyer rural de Nulle Part'), null);
  });
  it('ne rattache pas sur une clé vide', () => {
    assert.equal(normCms('de la'), null);
  });
  it('ne rattache jamais deux lieux différents à la même clé souple', () => {
    // Construit depuis CMS_MAP_RAW : toute clé ambiguë est neutralisée.
    const vus = {};
    const conflits = [];
    Object.entries(CMS_MAP_RAW).forEach(([k, v]) => {
      const ks = normKeySouple(k);
      if (!ks) return;
      if (vus[ks] && vus[ks] !== v) conflits.push([ks, vus[ks], v]);
      vus[ks] = v;
    });
    assert.deepEqual(conflits, []);
  });
});

// ─── rattacherCommune ─────────────────────────────────────────────────────
// Le référentiel officiel est ce qui rend le rapprochement sûr : sans lui,
// une simple ressemblance fusionnerait des communes bien distinctes.
describe('rattacherCommune', () => {
  it('connaît les 319 communes du département', () => {
    assert.equal(COMMUNES_47.length, 319);
  });
  it('reconnaît une commune quelle que soit la casse', () => {
    assert.equal(rattacherCommune('AGEN'), 'Agen');
    assert.equal(rattacherCommune('nérac'), 'Nérac');
  });
  it('rend le nom officiel accentué et tireté', () => {
    assert.equal(rattacherCommune('VILLENEUVE SUR LOT'), 'Villeneuve-sur-Lot');
    assert.equal(rattacherCommune('ST-SYLVESTRE-SUR-LOT'), 'Saint-Sylvestre-sur-Lot');
  });
  it('retire le bruit de saisie', () => {
    assert.equal(rattacherCommune('47180 SAINTE-BAZEILLE'), 'Sainte-Bazeille');
    assert.equal(rattacherCommune('AGEN CEDEX 9'), 'Agen');
    assert.equal(rattacherCommune('BOURGOUGNAGUE 0553844902'), 'Bourgougnague');
  });
  it('tolère l\'article initial manquant', () => {
    assert.equal(rattacherCommune("MAS D'AGENAIS"), "Le Mas-d'Agenais");
    assert.equal(rattacherCommune('LE LEDAT'), 'Lédat');
  });
  it('rattache un suffixe surnuméraire au nom officiel', () => {
    assert.equal(rattacherCommune("LE PASSAGE D'AGEN"), 'Le Passage');
    assert.equal(rattacherCommune("MONTPEZAT D'AGENAIS"), 'Montpezat');
  });
  it('corrige une faute de frappe sur un nom assez long', () => {
    assert.equal(rattacherCommune('VILLLENEUVE-SUR-LOT'), 'Villeneuve-sur-Lot');
    assert.equal(rattacherCommune('ALLMANS DU DROPT'), 'Allemans-du-Dropt');
  });

  // Les garde-fous : ce que la fonction doit REFUSER de faire.
  it('ne confond pas deux communes proches du département', () => {
    assert.equal(rattacherCommune('BRAX'), 'Brax');
    assert.equal(rattacherCommune('BIAS'), 'Bias');
    assert.equal(rattacherCommune('LAYRAC'), 'Layrac');
    assert.equal(rattacherCommune('CLAIRAC'), 'Clairac');
  });
  it('ne rapproche pas un nom court d\'un voisin ressemblant', () => {
    assert.equal(rattacherCommune('VANNES'), null);   // à 1 lettre de Lannes
    assert.equal(rattacherCommune('DONZAC'), null);   // à 2 de Dondas, et du 82
    assert.equal(rattacherCommune('TOULON'), null);   // à 2 de Bouglon
  });
  it('ne rattache pas une commune d\'un autre département', () => {
    assert.equal(rattacherCommune('SOTURAC'), null);       // Lot
    assert.equal(rattacherCommune("VALENCE-D'AGEN"), null); // Tarn-et-Garonne
  });
  it('ne cherche le nom officiel qu\'en tête du libellé', () => {
    // « Agen » apparaît dans les deux, mais n'ouvre ni l'un ni l'autre.
    assert.equal(rattacherCommune("VALENCE-D'AGEN"), null);
    assert.equal(rattacherCommune('COMMUNE INCONNUE AGENAISE'), null);
  });
  it('rend null sur une saisie vide ou absurde', () => {
    assert.equal(rattacherCommune(''), null);
    assert.equal(rattacherCommune(')'), null);
    assert.equal(rattacherCommune('Inconnu'), null);
  });
});

// ─── normCms — collèges nommés le 20/09/2026 ──────────────────────────────
describe('normCms — collèges', () => {
  it('regroupe les trois graphies du micro-collège', () => {
    assert.equal(normCms('micro collège'), 'Micro-collège Saint-Pierre Casseneuil');
    assert.equal(normCms('Micro-collège Casseneuil'), 'Micro-collège Saint-Pierre Casseneuil');
    assert.equal(normCms('Micro-Collège Casseneuil'), 'Micro-collège Saint-Pierre Casseneuil');
  });
  it('regroupe le collège Germillac avec et sans la commune', () => {
    assert.equal(normCms('COLLEGE GERMILLAC TONNEINS'), 'Collège Germillac Tonneins');
    assert.equal(normCms('COLLEGE GERMILLAC'), 'Collège Germillac Tonneins');
    assert.equal(normCms('Collège Germillac'), 'Collège Germillac Tonneins');
  });
  it('nomme le collège Jasmin', () => {
    assert.equal(normCms('Collège Jasmin - Agen'), 'Collège Jasmin Agen');
  });
  it('ne confond pas deux collèges différents', () => {
    assert.equal(normCms('Collège Lucie AUBRAC'), 'Collège Lucie Aubrac');
    assert.notEqual(normCms('Collège Germillac'), normCms('Collège Lucie AUBRAC'));
  });
});

// ─── countEntries ─────────────────────────────────────────────────────────
// count() renvoie un objet, et JavaScript y replace les clés entières en tête
// quel que soit leur volume : « 47 » (2 lignes) passait devant « Agen »
// (4 791). Tout classement affiché doit passer par countEntries.
describe('countEntries', () => {
  const jeu = [{ c: 'Agen' }, { c: 'Agen' }, { c: 'Agen' }, { c: '47' }, { c: 'Fumel' }, { c: 'Fumel' }];
  it('classe du plus fréquent au moins fréquent', () => {
    assert.deepEqual(countEntries(jeu, 'c'), [['Agen', 3], ['Fumel', 2], ['47', 1]]);
  });
  it('ne laisse pas un libellé numérique passer devant', () => {
    assert.equal(countEntries(jeu, 'c')[0][0], 'Agen');
  });
  it('count() souffre du défaut que countEntries corrige', () => {
    // Vaut comme garde : si un jour count() est corrigé, ce test le signale.
    assert.equal(Object.keys(count(jeu, 'c'))[0], '47');
    assert.equal(countEntries(jeu, 'c')[0][0], 'Agen');
  });
  it('conserve les mêmes totaux que count()', () => {
    assert.deepEqual(Object.fromEntries(countEntries(jeu, 'c')), count(jeu, 'c'));
  });
  it('départage les ex æquo alphabétiquement', () => {
    const r = countEntries([{ c: 'Zèbre' }, { c: 'Agen' }], 'c');
    assert.deepEqual(r.map(e => e[0]), ['Agen', 'Zèbre']);
  });
  it('range les valeurs absentes sous « ? »', () => {
    assert.deepEqual(countEntries([{ c: '' }, { c: null }], 'c'), [['?', 2]]);
  });
  it('accepte une liste vide', () => {
    assert.deepEqual(countEntries([], 'c'), []);
  });
});

// ─── compterDoublons ──────────────────────────────────────────────────────
// Le comptage était quadratique : 1 547 ms sur 20 226 enregistrements contre
// 3 ms avec un Set, pour un résultat identique. Ne pas revenir à indexOf().
describe('compterDoublons', () => {
  const l = (o = {}) => Object.assign({
    date_demande: '2025-01-01', date_action: '2025-01-02', conum: 'MARTIN Paul',
    orienteur: 'CAF', motif: 'aide', id_demande: '', type_action: ['Accompagnement'],
  }, o);

  it('ne compte rien sur des lignes distinctes', () => {
    assert.equal(compterDoublons([l({ motif: 'a' }), l({ motif: 'b' })]), 0);
  });
  it('compte les occurrences au-delà de la première', () => {
    assert.equal(compterDoublons([l(), l(), l()]), 2);
  });
  it('distingue par numéro de demande quand il est présent', () => {
    const a = l({ id_demande: '1' }), b = l({ id_demande: '2' });
    assert.equal(compterDoublons([a, b]), 0);
  });
  it('ignore l\'ordre des types d\'action', () => {
    const a = l({ id_demande: '1', type_action: ['Prise de contact', 'Accompagnement'] });
    const b = l({ id_demande: '1', type_action: ['Accompagnement', 'Prise de contact'] });
    assert.equal(compterDoublons([a, b]), 1);
  });
  // Les participants d'une séance portent la même clé — le nom du
  // bénéficiaire n'entre pas dans l'application. Les compter faisait annoncer
  // 25 % de doublons là où il y en a 0,1 %.
  it('n\'accuse pas les participants d\'un même atelier', () => {
    const a = l({ id_demande: '7161', type_action: ['Atelier'] });
    assert.equal(compterDoublons([a, { ...a }, { ...a }]), 0);
  });
  it('un atelier n\'empêche pas de voir les autres doublons', () => {
    const atl = l({ id_demande: '7161', type_action: ['Atelier'] });
    const acc = l({ id_demande: '900' });
    assert.equal(compterDoublons([atl, { ...atl }, acc, { ...acc }]), 1);
  });
  it('une ligne mixte contenant Atelier est exclue elle aussi', () => {
    const m = l({ id_demande: '1', type_action: ['Accompagnement', 'Atelier'] });
    assert.equal(compterDoublons([m, { ...m }]), 0);
  });
  it('accepte une liste vide', () => {
    assert.equal(compterDoublons([]), 0);
    assert.equal(compterDoublons(null), 0);
  });
  it('donne le même résultat que le comptage quadratique d\'origine', () => {
    const jeu = [];
    for (let i = 0; i < 300; i++) jeu.push(l({ id_demande: String(i % 90) }));
    const cles = jeu.map(cleDoublon);
    const attendu = cles.filter((k, i) => cles.indexOf(k) !== i).length;
    assert.equal(compterDoublons(jeu), attendu);
  });
});

// ─── Sessions d'atelier ───────────────────────────────────────────────────
// Une ligne d'atelier est une participation, pas un atelier. Sur l'export de
// septembre 2026 : 5 478 lignes pour 596 sessions. Ne jamais afficher le
// nombre de lignes seul.
const atelier = (n, da) => ({ id_demande: n, date_action: da, type_action: ['Atelier'] });

describe('estAtelier', () => {
  it('ligne de type Atelier',        () => assert.equal(estAtelier(atelier('1', '2025-01-01')), true));
  it('accompagnement',               () => assert.equal(estAtelier({ type_action: ['Accompagnement'] }), false));
  it('type multiple incluant Atelier',() => assert.equal(estAtelier({ type_action: ['Accompagnement', 'Atelier'] }), true));
  it('sans type',                    () => assert.equal(estAtelier({}), false));
  it('null',                         () => assert.equal(estAtelier(null), false));
});

describe('compterSessionsAtelier', () => {
  it('10 participants, 1 séance', () => {
    const recs = Array.from({ length: 10 }, () => atelier('7161', '2025-03-12'));
    assert.equal(compterSessionsAtelier(recs), 1);
  });
  it('même N°, deux dates = deux séances', () => {
    assert.equal(compterSessionsAtelier([atelier('7161', '2025-03-12'), atelier('7161', '2025-04-02')]), 2);
  });
  it('deux N°, même date = deux séances', () => {
    assert.equal(compterSessionsAtelier([atelier('1', '2025-03-12'), atelier('2', '2025-03-12')]), 2);
  });
  it('ignore les lignes qui ne sont pas des ateliers', () => {
    const recs = [atelier('1', '2025-01-01'), { id_demande: '2', date_action: '2025-01-01', type_action: ['Accompagnement'] }];
    assert.equal(compterSessionsAtelier(recs), 1);
  });
  it('aucun atelier', () => assert.equal(compterSessionsAtelier([{ type_action: ['Accompagnement'] }]), 0));
  it('tableau vide',   () => assert.equal(compterSessionsAtelier([]), 0));
  it('null',           () => assert.equal(compterSessionsAtelier(null), 0));
});

describe('statsAteliers', () => {
  it('rend les deux chiffres ensemble', () => {
    const recs = [atelier('1', '2025-01-01'), atelier('1', '2025-01-01'), atelier('2', '2025-02-01')];
    assert.deepEqual(statsAteliers(recs), { sessions: 2, participations: 3 });
  });
  it('participations toujours >= sessions', () => {
    const recs = Array.from({ length: 20 }, (_, i) => atelier(String(i % 3), '2025-01-01'));
    const s = statsAteliers(recs);
    assert.ok(s.participations >= s.sessions, 'participations < sessions');
    assert.equal(s.sessions, 3);
    assert.equal(s.participations, 20);
  });
  it('jeu vide', () => assert.deepEqual(statsAteliers([]), { sessions: 0, participations: 0 }));
});

// ─── Rang de participant et clé de fusion ─────────────────────────────────
// Sans le rang, confirmImport() supprimait 78 % des participations aux
// ateliers : deux participants d'une même séance sont indistinguables sur
// les champs importés (le nom n'entre pas dans l'application).
describe('numeroterParticipants', () => {
  it('numérote dans l\'ordre du fichier', () => {
    const recs = [atelier('1', '2025-01-01'), atelier('1', '2025-01-01'), atelier('1', '2025-01-01')];
    numeroterParticipants(recs);
    assert.deepEqual(recs.map(r => r.rang_atelier), [1, 2, 3]);
  });
  it('recommence à 1 pour chaque séance', () => {
    const recs = [atelier('1', '2025-01-01'), atelier('2', '2025-01-01'), atelier('1', '2025-01-01')];
    numeroterParticipants(recs);
    assert.deepEqual(recs.map(r => r.rang_atelier), [1, 1, 2]);
  });
  it('ne touche pas aux lignes qui ne sont pas des ateliers', () => {
    const recs = [{ type_action: ['Accompagnement'], id_demande: '1', date_action: '2025-01-01' }];
    numeroterParticipants(recs);
    assert.equal(recs[0].rang_atelier, undefined);
  });
  it('rend le nombre de participations numérotées', () => {
    assert.equal(numeroterParticipants([atelier('1', '2025-01-01'), atelier('1', '2025-01-01')]), 2);
  });
  it('jeu vide', () => assert.equal(numeroterParticipants([]), 0));
  it('null',      () => assert.equal(numeroterParticipants(null), 0));
});

describe('cleFusion', () => {
  it('deux participants d\'une même séance ont des clés différentes', () => {
    const recs = [atelier('1', '2025-01-01'), atelier('1', '2025-01-01')];
    numeroterParticipants(recs);
    assert.notEqual(cleFusion(recs[0]), cleFusion(recs[1]));
  });
  it('deux séances distinctes ne se confondent pas', () => {
    const recs = [atelier('1', '2025-01-01'), atelier('2', '2025-01-01')];
    numeroterParticipants(recs);
    assert.notEqual(cleFusion(recs[0]), cleFusion(recs[1]));
  });
  it('aucune participation perdue à la fusion', () => {
    const recs = Array.from({ length: 12 }, () => atelier('7161', '2025-03-12'));
    numeroterParticipants(recs);
    assert.equal(new Set(recs.map(cleFusion)).size, 12);
  });
  it('idempotent : réimporter le même jeu n\'ajoute rien', () => {
    const recs = Array.from({ length: 5 }, () => atelier('1', '2025-01-01'));
    numeroterParticipants(recs);
    const base = new Set(recs.map(cleFusion));
    const rejoue = Array.from({ length: 5 }, () => atelier('1', '2025-01-01'));
    numeroterParticipants(rejoue);
    assert.equal(rejoue.filter(r => !base.has(cleFusion(r))).length, 0);
  });
  it('les non-ateliers restent dédupliqués sur les mêmes champs', () => {
    const a = { date_demande: '2025-01-01', date_action: '2025-01-02', conum: 'X', cms: 'CMS Agen Tapie', commune: 'Agen', orienteur: 'Y', themas: ['Logement'], type_action: ['Accompagnement'] };
    assert.equal(cleFusion(a), cleFusion({ ...a }));
  });
  it('un accompagnement et un atelier ne collisionnent pas', () => {
    const base = { date_demande: '2025-01-01', date_action: '2025-01-02', id_demande: '1', conum: '', cms: '', commune: '', orienteur: '', themas: [] };
    assert.notEqual(cleFusion({ ...base, type_action: ['Atelier'] }), cleFusion({ ...base, type_action: ['Accompagnement'] }));
  });
  it('null', () => assert.equal(cleFusion(null), ''));
});

// ─── Fiabilité des indicateurs ────────────────────────────────────────────
// Ne jamais afficher une marge qui ne soit pas calculée depuis le fichier
// réellement importé : un chiffre inventé ferait l'inverse du but recherché.
const ligneF = (o = {}) => Object.assign({
  date_demande: '2025-01-01', date_action: '2025-01-02', id_demande: '1',
  conum: 'MARTIN Paul', cms: 'CMS Marmande', commune: 'Agen', orienteur: 'CAF',
  themas: ['Logement'], type_action: ['Accompagnement'], motif: '',
}, o);

describe('niveauFiabilite', () => {
  it('moins de 1 % → solide',   () => assert.equal(niveauFiabilite(0.4), 'solide'));
  it('1 % → bonne',             () => assert.equal(niveauFiabilite(1), 'bonne'));
  it('7 % → moyenne',           () => assert.equal(niveauFiabilite(7), 'moyenne'));
  it('22 % → partielle',        () => assert.equal(niveauFiabilite(22), 'partielle'));
  it('43 % → faible',           () => assert.equal(niveauFiabilite(43), 'faible'));
});

describe('indicateursFiabilite', () => {
  it('jeu vide → aucun indicateur', () => assert.deepEqual(indicateursFiabilite([], {}), []));
  it('une marge est toujours calculée, jamais inventée', () => {
    const recs = [ligneF(), ligneF({ id_demande: '2' })];
    indicateursFiabilite(recs, {}).forEach(i => {
      assert.equal(typeof i.marge, 'number', i.cle + ' : marge non numérique');
      assert.ok(i.marge >= 0 && i.marge <= 100, i.cle + ' : marge hors bornes');
      assert.ok(i.fait && i.fait.length > 0, i.cle + ' : fait manquant');
    });
  });
  it('les thématiques manquantes remontent en marge', () => {
    const recs = [ligneF(), ligneF({ id_demande: '2', themas: [] })];
    const t = indicateursFiabilite(recs, {}).find(i => i.cle === 'themas');
    assert.equal(t.ecart, 1);
    assert.equal(t.marge, 50);
    assert.equal(t.niveau, 'faible');
  });
  it('conum_deduit pilote la marge du conseiller', () => {
    const recs = [ligneF({ conum_deduit: true }), ligneF({ id_demande: '2', conum_deduit: false })];
    const c = indicateursFiabilite(recs, {}).find(i => i.cle === 'conseiller');
    assert.equal(c.ecart, 1);
    assert.equal(c.marge, 50);
  });
  it('sans conum_deduit, retombe sur les lignes sans conseiller', () => {
    const recs = [ligneF({ conum: '' }), ligneF({ id_demande: '2' })];
    assert.equal(indicateursFiabilite(recs, {}).find(i => i.cle === 'conseiller').ecart, 1);
  });
  // AG-004 : 1 doublon sur 2 accompagnements, noyé dans 200 lignes, sortait à
  // 0,5 % « solide ».
  it('les doublons d\'un type se rapportent aux lignes de ce type', () => {
    const recs = [];
    for (let i = 0; i < 198; i++) recs.push(ligneF({ id_demande: 'N' + i, type_action: ['Prise de contact'] }));
    recs.push(ligneF({ id_demande: 'Z' }), ligneF({ id_demande: 'Z' }));
    const a = indicateursFiabilite(recs, {}).find(i => i.cle === 'accompagnements');
    assert.equal(a.ecart, 1);
    assert.equal(a.sur, 2);
    assert.equal(a.marge, 50);
    assert.equal(a.niveau, 'faible');
    assert.ok(a.fait.includes('1 doublon suspect sur 2 accompagnements'), a.fait);
  });
  it('les ateliers sont une reformulation, pas une marge', () => {
    const recs = [atelier('1', '2025-01-01'), atelier('1', '2025-01-01')];
    const a = indicateursFiabilite(recs, {}).find(i => i.cle === 'ateliers');
    assert.equal(a.valeur, 1);
    assert.equal(a.participations, 2);
    assert.equal(a.marge, 0);
  });
});

describe('defautsSaisie', () => {
  it('ne liste que ce qui est non nul', () => {
    assert.deepEqual(defautsSaisie([ligneF()], {}), []);
  });
  it('rapporte les défauts de base aux lignes en base', () => {
    const d = defautsSaisie([ligneF({ orienteur: '' }), ligneF({ id_demande: '2' })], {});
    const ref = d.find(x => x.libelle === 'Référent absent');
    assert.equal(ref.val, 1);
    assert.equal(ref.sur, 2);
    assert.equal(ref.part, 50);
  });
  it('rapporte les défauts d\'import aux lignes retenues, pas à la base', () => {
    const d = defautsSaisie([ligneF()], { retenues: 100, cellules_reparees: 100, lues: 120, ecartees: 20 });
    assert.equal(d.find(x => x.libelle.startsWith('Cellules')).part, 100);
    assert.equal(d.find(x => x.libelle.startsWith('Lignes écartées')).part, 16.7);
  });
});

describe('syntheseFiabilite', () => {
  it('jeu vide', () => assert.equal(syntheseFiabilite([]).texte, 'aucune donnée'));
  it('ne réduit pas l\'ensemble au pire indicateur', () => {
    const ind = [
      { cle: 'a', libelle: 'A', niveau: 'solide', marge: 0 },
      { cle: 'b', libelle: 'B', niveau: 'solide', marge: 0 },
      { cle: 'c', libelle: 'Par conseiller', niveau: 'faible', marge: 43.4 },
    ];
    const s = syntheseFiabilite(ind);
    assert.equal(s.solides, 2);
    assert.equal(s.vigilance, 1);
    assert.ok(s.texte.includes('2 contrôles sans défaut détecté'), s.texte);
    assert.ok(s.texte.includes('Par conseiller'), s.texte);
  });
  it('nomme le plus sensible, pas le premier venu', () => {
    const ind = [
      { cle: 'a', libelle: 'A', niveau: 'moyenne', marge: 7 },
      { cle: 'b', libelle: 'B', niveau: 'faible', marge: 40 },
    ];
    assert.equal(syntheseFiabilite(ind).plusFaible.libelle, 'B');
  });
  // AG-004 (Codex) : un indicateur « solide » avec un défaut détecté n'est pas
  // présenté comme sans défaut.
  it('un solide qui a des défauts n\'est pas « sans défaut détecté »', () => {
    const s = syntheseFiabilite([
      { cle: 'a', libelle: 'A', niveau: 'solide', marge: 0, ecart: 0 },
      { cle: 'b', libelle: 'B', niveau: 'solide', marge: 0.5, ecart: 1 },
    ]);
    assert.equal(s.sansDefaut, 1);
    assert.ok(s.texte.startsWith('1 contrôle sans défaut détecté · 1 avec moins de 1 % de défauts'), s.texte);
  });
  it('tout solide', () => {
    const s = syntheseFiabilite([{ cle: 'a', libelle: 'A', niveau: 'solide', marge: 0 }]);
    assert.equal(s.vigilance, 0);
    assert.ok(s.texte.includes('aucun point de vigilance'));
  });
});

describe('moisDeLaPeriode', () => {
  it('rend tous les mois de la période, bornes incluses', () => {
    assert.deepEqual(moisDeLaPeriode('2026-01-01', '2026-03-31'),
      ['2026-01', '2026-02', '2026-03']);
  });

  it('franchit les années', () => {
    assert.deepEqual(moisDeLaPeriode('2025-11-15', '2026-02-02'),
      ['2025-11', '2025-12', '2026-01', '2026-02']);
  });

  it('inclut les mois sans activité — c\'est sa raison d\'être', () => {
    // Le défaut corrigé : l'axe venait des données, un mois creux disparaissait.
    const mois = moisDeLaPeriode('2026-01-01', '2026-06-30');
    assert.equal(mois.length, 6);
    assert.ok(mois.includes('2026-04'));
  });

  it('restreint aux années sélectionnées', () => {
    assert.deepEqual(moisDeLaPeriode('2025-11-01', '2026-02-01', new Set(['2026'])),
      ['2026-01', '2026-02']);
    assert.deepEqual(moisDeLaPeriode('2025-11-01', '2026-02-01', ['2025']),
      ['2025-11', '2025-12']);
  });

  it('un Set vide ou absent ne filtre rien', () => {
    assert.equal(moisDeLaPeriode('2026-01-01', '2026-03-01', new Set()).length, 3);
    assert.equal(moisDeLaPeriode('2026-01-01', '2026-03-01').length, 3);
  });

  it('un même mois de début et de fin rend un seul mois', () => {
    assert.deepEqual(moisDeLaPeriode('2026-05-03', '2026-05-28'), ['2026-05']);
  });

  it('rend un tableau vide sur des bornes inversées ou illisibles', () => {
    assert.deepEqual(moisDeLaPeriode('2026-05-01', '2026-01-01'), []);
    assert.deepEqual(moisDeLaPeriode('', '2026-01-01'), []);
    assert.deepEqual(moisDeLaPeriode(null, undefined), []);
    assert.deepEqual(moisDeLaPeriode('n/a', 'n/a'), []);
  });
});


describe('libelleLignes', () => {
  it('nomme le type filtré au pluriel', () => {
    assert.equal(libelleLignes('Accompagnement'), 'Accompagnements');
    assert.equal(libelleLignes('Prise de contact'), 'Prises de contact');
  });

  it('dit « Participations » pour les ateliers — une ligne est un participant', () => {
    assert.equal(libelleLignes('Atelier'), 'Participations');
  });

  it('dit « Demandes » quand aucun type n\'est filtré', () => {
    assert.equal(libelleLignes(''), 'Demandes');
    assert.equal(libelleLignes(null), 'Demandes');
    assert.equal(libelleLignes(undefined), 'Demandes');
  });

  it('retombe sur « Demandes » devant un type inconnu plutôt que d\'affirmer faux', () => {
    assert.equal(libelleLignes('Type qui nexiste pas'), 'Demandes');
  });
});

// ─── Identité des lignes, fusion, provenance (20/10/2026) ─────────────────
// Audit Codex du 20/10/2026 : réimporter le même fichier ajoutait 7 977 lignes,
// et 76 demandes distinctes disparaissaient à la fusion.
const HDR_F = 'n° demande\tdate demande\tdate action\ttype action\tlieu / cms\tcommune\tconseiller num\tthematique\treferent\tlibelle de l\'etat';
const ligneF2 = (n, dd, da, type, conum = '', etat = 'Réalisée', ref = '') =>
  [n, dd, da, type, 'CMS Tonneins', 'Tonneins', conum, 'Internet', ref, etat].join('\t');
const importer = (lignes) => parseXlsText([HDR_F, ...lignes].join('\n')).records;

describe('identité des lignes', () => {
  it('deux demandes distinctes aux autres champs identiques ne se confondent pas', () => {
    const r = importer([
      ligneF2('100', '01/03/2025', '05/03/2025', 'Accompagnement', 'A B'),
      ligneF2('101', '01/03/2025', '05/03/2025', 'Accompagnement', 'A B'),
    ]);
    assert.equal(new Set(r.map(cleFusion)).size, 2);
    assert.equal(fusionnerImport([], r).records.length, 2);
  });
  it('plusieurs actions d\'une même demande sont toutes conservées', () => {
    const r = importer([
      ligneF2('100', '01/03/2025', '05/03/2025', 'Accompagnement', 'A B'),
      ligneF2('100', '01/03/2025', '09/03/2025', 'Accompagnement', 'A B'),
      ligneF2('100', '01/03/2025', '', 'Prise de contact', 'A B'),
    ]);
    assert.equal(fusionnerImport([], r).records.length, 3);
  });
  it('des lignes strictement identiques d\'un fichier restent distinctes (rang)', () => {
    const r = importer(Array.from({ length: 3 }, () => ligneF2('100', '01/03/2025', '05/03/2025', 'Accompagnement', 'A B')));
    assert.deepEqual(r.map(x => x.rang_ligne), [1, 2, 3]);
    assert.equal(fusionnerImport([], r).records.length, 3);
  });
  it('la clé ne dépend pas du conseiller', () => {
    const a = importer([ligneF2('100', '01/03/2025', '05/03/2025', 'Accompagnement', '')])[0];
    const b = { ...a, conum: 'Quelqu\'un', conum_origine: 'deduit' };
    assert.equal(cleFusion(a), cleFusion(b));
  });
  it('sans N° de demande : repli sur les champs source, sans conseiller', () => {
    const a = { date_demande: '2025-01-01', date_action: '2025-01-02', cms: 'CMS Tonneins', commune: 'Agen', orienteur: 'Y', themas: ['T'], type_action: ['Accompagnement'], conum: 'X' };
    assert.equal(cleFusion(a), cleFusion({ ...a, conum: 'Z' }));
    assert.notEqual(cleFusion(a), cleFusion({ ...a, commune: 'Nérac' }));
  });
});

describe('fusionnerImport', () => {
  const fichier = () => importer([
    ligneF2('1', '01/03/2025', '05/03/2025', 'Accompagnement', 'A B'),
    ligneF2('1', '01/03/2025', '09/03/2025', 'Accompagnement', ''),
    ligneF2('2', '02/03/2025', '06/03/2025', 'Accompagnement', ''),
    ligneF2('3', '03/03/2025', '', 'Prise de contact', 'A B'),
  ]);
  const parcours = (base, nouveaux) => {
    const f = fusionnerImport(base, nouveaux);
    attribuerConum(f.records);
    return f;
  };
  it('réimporter le même fichier deux fois n\'ajoute aucune ligne', () => {
    let base = parcours([], fichier()).records;
    const n = base.length;
    for (let i = 0; i < 2; i++) {
      const f = parcours(base, fichier());
      assert.equal(f.ajoutes, 0);
      assert.equal(f.records.length, n);
      base = f.records;
    }
  });
  it('le réimport survit à une sauvegarde JSON et à un rechargement', () => {
    const base = JSON.parse(JSON.stringify(parcours([], fichier()).records));
    attribuerConum(base);
    assert.equal(parcours(base, fichier()).ajoutes, 0);
  });
  it('un nouvel export corrige l\'état et les dates sans doubler la ligne', () => {
    const base = parcours([], importer([ligneF2('1', '01/03/2025', '05/03/2025', 'Accompagnement', 'A B', 'En cours')])).records;
    const f = parcours(base, importer([ligneF2('1', '01/03/2025', '05/03/2025', 'Accompagnement', 'A B', 'Réalisée')]));
    assert.equal(f.records.length, 1);
    assert.equal(f.misAJour, 1);
    assert.equal(f.records[0].etat, 'Réalisée');
  });
  it('une ligne mise à jour garde son enrichissement', () => {
    const base = parcours([], importer([
      ligneF2('1', '01/03/2025', '05/03/2025', 'Accompagnement', 'A B'),
      ligneF2('2', '01/03/2025', '05/03/2025', 'Accompagnement', '', 'En cours'),
    ])).records;
    assert.equal(base[1].conum, 'A B');
    const f = parcours(base, importer([
      ligneF2('1', '01/03/2025', '05/03/2025', 'Accompagnement', 'A B'),
      ligneF2('2', '01/03/2025', '05/03/2025', 'Accompagnement', '', 'Réalisée'),
    ]));
    assert.equal(f.records[1].conum, 'A B');
    assert.equal(f.records[1].conum_origine, 'deduit');
    assert.equal(f.records[1].etat, 'Réalisée');
  });
  it('ne modifie ni la base ni le nouveau fichier', () => {
    const base = parcours([], fichier()).records;
    const avant = JSON.stringify(base);
    const nouveaux = fichier();
    const avantN = JSON.stringify(nouveaux);
    fusionnerImport(base, nouveaux);
    assert.equal(JSON.stringify(base), avant);
    assert.equal(JSON.stringify(nouveaux), avantN);
  });
  it('un doublon interne au fichier est compté, pas ajouté', () => {
    const r = fichier();
    const f = fusionnerImport([], [...r, r[0]]);
    assert.equal(f.doublonsFichier, 1);
    assert.equal(f.records.length, r.length);
  });
  it('les participations d\'atelier gardent leur règle', () => {
    const at = importer(Array.from({ length: 4 }, () => ligneF2('9', '01/03/2025', '05/03/2025', 'Atelier', 'A B')));
    const base = fusionnerImport([], at).records;
    assert.equal(base.length, 4);
    assert.equal(fusionnerImport(base, importer(Array.from({ length: 4 }, () => ligneF2('9', '01/03/2025', '05/03/2025', 'Atelier', 'A B')))).ajoutes, 0);
  });
});

describe('provenance du conseiller', () => {
  const r0 = (o = {}) => Object.assign({ date_demande: '2025-01-01', cms: 'CMS Tonneins', conum: '', conum_origine: '', orienteur: '' }, o);
  it('parseRows pose source / referent', () => {
    const recs = importer([
      ligneF2('1', '01/03/2025', '05/03/2025', 'Accompagnement', 'A B'),
      ligneF2('2', '01/03/2025', '05/03/2025', 'Accompagnement', '', 'Réalisée', 'A B'),
      ligneF2('3', '01/03/2025', '05/03/2025', 'Accompagnement', ''),
    ]);
    assert.deepEqual(recs.map(r => r.conum_origine), ['source', 'referent', '']);
  });
  it('une valeur déduite le reste après retraitement', () => {
    const recs = [r0({ conum: 'A', conum_origine: 'source' }), r0()];
    attribuerConum(recs);
    assert.equal(recs[1].conum_origine, 'deduit');
    const rechargees = JSON.parse(JSON.stringify(recs));
    attribuerConum(rechargees);
    attribuerConum(rechargees);
    assert.equal(rechargees[1].conum_deduit, true);
    assert.equal(rechargees[1].conum_origine, 'deduit');
    assert.equal(rechargees[0].conum_deduit, false);
  });
  it('base d\'avant : déduction connue conservée, le reste d\'origine inconnue', () => {
    const recs = [r0({ conum: 'A', conum_deduit: true }), r0({ conum: 'B', conum_deduit: false })];
    attribuerConum(recs);
    assert.deepEqual(recs.map(r => r.conum_origine), ['deduit', 'inconnu']);
    assert.deepEqual(recs.map(r => r.conum_deduit), [true, false]);
  });
  it('le majoritaire ne s\'appuie que sur des attributions constatées', () => {
    const recs = [
      r0({ conum: 'A', conum_origine: 'source' }),
      r0({ conum: 'B', conum_origine: 'deduit' }), r0({ conum: 'B', conum_origine: 'deduit' }),
      r0({ conum: 'B', conum_origine: 'inconnu' }),
    ];
    assert.equal(deriverAttributionCms(recs).parAnnee['CMS Tonneins|2025'], 'A');
  });
  it('l\'origine inconnue apparaît dans la marge de fiabilité', () => {
    const recs = [r0({ id_demande: '1', conum: 'A', conum_origine: 'inconnu', conum_deduit: false }), r0({ id_demande: '2', conum: 'A', conum_origine: 'source', conum_deduit: false })];
    const c = indicateursFiabilite(recs).find(i => i.cle === 'conseiller');
    assert.equal(c.ecart, 1);
    assert.match(c.fait, /origine inconnue/);
  });
});

// ─── Populations des indicateurs (audit du 20/10/2026) ────────────────────
describe('états : une seule nomenclature', () => {
  it('« en cours » et « en attente » sont une même catégorie', () => {
    assert.equal(categorieEtat('En attente'), 'en_attente');
    assert.equal(categorieEtat('En cours'), 'en_attente');
  });
  it('« Non réalisée » n\'est pas « Réalisée »', () => {
    assert.equal(categorieEtat('Non réalisée'), 'non_realisee');
    assert.equal(categorieEtat('Réalisée'), 'realisee');
  });
  it('un autre état n\'est versé dans aucune colonne par défaut', () => {
    assert.equal(categorieEtat('Excusée'), 'autre');
    assert.equal(categorieEtat(null), 'autre');
  });
  it('la répartition somme au total, sans débordement', () => {
    const r = repartitionEtats([{ etat: 'Réalisée' }, { etat: 'En attente' }, { etat: 'Annulée' }, { etat: 'Non réalisée' }, {}]);
    assert.deepEqual(r, { realisee: 1, non_realisee: 1, en_attente: 1, autre: 2, total: 5 });
  });
});

describe('tauxRealisation', () => {
  it('mesure l\'état, pas la présence d\'une date', () => {
    const recs = [{ etat: 'Non réalisée', date_action: '2025-01-02' }, { etat: 'Réalisée', date_action: '2025-01-02' }];
    assert.equal(tauxRealisation(recs).taux, 50);
  });
  it('liste vide → 0', () => assert.equal(tauxRealisation([]).taux, 0));
});

describe('deriverActions : réactivité par demande', () => {
  const fin = new Date('2025-12-31');
  const contact = (id, dd, dr) => ({ id_demande: id, date_demande: dd, date_realisation: dr, date_planifiee: null, type_action: ['Prise de contact'], cms: 'CMS Tonneins', conum: 'A' });
  const accomp = (id, dd, etat = 'Réalisée') => ({ id_demande: id, date_demande: dd, date_realisation: dd, type_action: ['Accompagnement'], cms: 'CMS Tonneins', conum: 'A', etat });
  it('deux demandes du même jour ne partagent pas leur contact', () => {
    const recs = [
      contact('1', '2025-03-03', '2025-03-04'),   // 1 jour ouvré
      contact('2', '2025-03-03', '2025-03-17'),   // 10 jours ouvrés
      accomp('1', '2025-03-03'), accomp('2', '2025-03-03'),
    ];
    const a = deriverActions(recs, fin);
    assert.deepEqual(a.map(x => x.delai_reactivite), [1, 10]);
  });
  it('sans contact de la même demande : pas de délai emprunté', () => {
    const a = deriverActions([contact('9', '2025-03-03', '2025-03-04'), accomp('1', '2025-03-03')], fin);
    assert.equal(a[0].delai_reactivite, null);
  });
  it('sans N° de demande, aucun rapprochement', () => {
    const a = deriverActions([contact('', '2025-03-03', '2025-03-04'), accomp('', '2025-03-03')], fin);
    assert.equal(a[0].delai_reactivite, null);
  });
  it('conserve le jour ET le mois', () => {
    const a = deriverActions([accomp('1', '2025-03-03')], fin);
    assert.equal(a[0].jour, '2025-03-03');
    assert.equal(a[0].date, '2025-03');
  });
  it('un jeu sans accompagnement rend une liste vide (pas d\'ancien état)', () => {
    assert.deepEqual(deriverActions([contact('1', '2025-03-03', '2025-03-04')], fin), []);
  });
});

describe('reactivite48', () => {
  const act = (d) => ({ delai_reactivite: d });
  it('compte les cas calculables et les sans contact', () => {
    const r = reactivite48([act(1), act(3), act(null), act(null)], 1);
    assert.deepEqual(r, { calculables: 2, dans48: 1, sansContact: 2, taux: 50 });
  });
  it('pas de taux sous le seuil', () => assert.equal(reactivite48([act(1)]).taux, null));
  // AG-004 : une demande à 20 accompagnements pesait 20 fois (95 % au lieu de 50 %).
  it('compte chaque demande une seule fois', () => {
    const a = [];
    for (let i = 0; i < 20; i++) a.push({ id_demande: 'D1', delai_reactivite: 1 });
    a.push({ id_demande: 'D2', delai_reactivite: 5 }, { id_demande: 'D3', delai_reactivite: null });
    assert.deepEqual(reactivite48(a, 1), { calculables: 2, dans48: 1, sansContact: 1, taux: 50 });
    assert.equal(reactivite48(a).taux, null, 'le seuil de 20 porte sur les demandes');
    assert.deepEqual(delaisParDemande(a), [1, 5, null]);
  });
});

describe('dansPeriode : filtre au jour', () => {
  it('un seul jour ne reprend pas le mois', () => {
    assert.equal(dansPeriode('2026-09-10', '2026-09-16', '2026-09-16'), false);
    assert.equal(dansPeriode('2026-09-16', '2026-09-16', '2026-09-16'), true);
  });
  it('une date absente est exclue', () => assert.equal(dansPeriode(null, '2026-01-01', '2026-12-31'), false));
});

describe('comparaison annuelle', () => {
  const r = (d, t = 'Accompagnement') => ({ date_demande: d, type_action: [t] });
  it('filtrerParType applique le même type que le filtre d\'en-tête', () => {
    const recs = [r('2026-01-01'), r('2026-01-01', 'Atelier')];
    assert.equal(filtrerParType(recs, 'Accompagnement').length, 1);
    assert.equal(filtrerParType(recs, 'Accompagnements').length, 1);
    assert.equal(filtrerParType(recs, '').length, 2);
  });
  it('année partielle comparée à la même date de l\'année précédente', () => {
    const recs = [r('2025-02-01'), r('2025-08-01'), r('2025-11-01'), r('2026-02-01'), r('2026-03-01')];
    const e = evolutionAnnuelle(recs, '2026', '2026-04-15');
    assert.equal(e.partielle, true);
    assert.equal(e.nRec, 2);
    assert.equal(e.nPre, 1);
    assert.equal(e.coupure, '15/04');
    assert.equal(e.delta, 100);
  });
  it('année complète : coupure au 31/12, non partielle', () => {
    const recs = [r('2024-12-30'), r('2025-12-30')];
    const e = evolutionAnnuelle(recs, '2025', '2026-04-15');
    assert.equal(e.partielle, false);
    assert.equal(e.nPre, 1);
  });
  it('pas de référence N-1 → pas de pourcentage', () => {
    assert.equal(evolutionAnnuelle([r('2026-01-01')], '2026', '2026-02-01').delta, null);
  });
});

describe('export CSV : formules neutralisées', () => {
  it('préfixe =, +, -, @, tabulation', () => {
    ['=1+1', '+SUM(A1)', '-2+3', '@A1', '\tx'].forEach(v => assert.equal(neutraliserFormule(v)[0], "'"));
  });
  it('laisse le texte et les dates intacts', () => {
    assert.equal(neutraliserFormule('aide tablette'), 'aide tablette');
    assert.equal(neutraliserFormule('2025-01-02'), '2025-01-02');
  });
  it('cellule entre guillemets, guillemets doublés', () => {
    assert.equal(celluleCSV('=1+1'), '"\'=1+1"');
    assert.equal(celluleCSV('a"b'), '"a""b"');
  });
});

describe('validerSauvegardeJSON', () => {
  const ok = { date_demande: '2025-01-02', cms: 'CMS Tonneins', themas: ['A'], type_action: ['Accompagnement'], id_demande: 7 };
  const payload = (data, v = '2') => ({ version: v, type: 'gdin-data', data });
  it('reconstruit chaque ligne depuis les champs autorisés', () => {
    const [r] = validerSauvegardeJSON(payload([{ ...ok, nom_beneficiaire: 'X', telephone: '06' }]));
    assert.equal(r.nom_beneficiaire, undefined);
    assert.equal(r.telephone, undefined);
    assert.equal(r.id_demande, '7');
  });
  it('tronque le motif à 120 caractères', () => {
    assert.equal(validerSauvegardeJSON(payload([{ ...ok, motif: 'x'.repeat(500) }]))[0].motif.length, 120);
  });
  it('rejette une date invalide, un type erroné, une version inconnue', () => {
    assert.throws(() => validerSauvegardeJSON(payload([{ ...ok, date_demande: '31/02/2025' }])), /date/);
    assert.throws(() => validerSauvegardeJSON(payload([{ ...ok, themas: 'texte' }])), /liste/);
    assert.throws(() => validerSauvegardeJSON(payload([ok], '9')), /Version/);
    assert.throws(() => validerSauvegardeJSON(payload([])), /aucun/);
    assert.throws(() => validerSauvegardeJSON({ type: 'autre' }), /Format/);
  });
  it('une seule ligne invalide rejette tout le fichier', () => {
    assert.throws(() => validerSauvegardeJSON(payload([ok, { ...ok, cms: 5 }])), /Enregistrement 2/);
  });
  it('accepte un export sans numéro de version (anciens fichiers)', () => {
    const p = payload([ok]); delete p.version;
    assert.equal(validerSauvegardeJSON(p).length, 1);
  });
  it('conserve rangs et provenance', () => {
    const [r] = validerSauvegardeJSON(payload([{ ...ok, conum: 'A', conum_origine: 'source', rang_ligne: 2 }]));
    assert.equal(r.conum_origine, 'source');
    assert.equal(r.rang_ligne, 2);
  });
  it('un ancien export : conum_deduit devient une origine', () => {
    const [r] = validerSauvegardeJSON(payload([{ ...ok, conum: 'A', conum_deduit: true }]));
    assert.equal(r.conum_origine, 'deduit');
  });
});

describe('base enregistrée avant l\'identité par rang', () => {
  it('est reconnue et complétée sans rien supprimer', () => {
    const base = [{ id_demande: '1', type_action: ['Accompagnement'], date_action: '2025-01-01', cms: 'X' }, { id_demande: '1', type_action: ['Accompagnement'], date_action: '2025-01-01', cms: 'X' }];
    assert.equal(baseAncienne(base), true);
    assert.equal(completerRangs(base), true);
    assert.deepEqual(base.map(r => r.rang_ligne), [1, 2]);
    assert.equal(baseAncienne(base), false);
    assert.equal(base.length, 2);
  });
});

// ── Mention de révisabilité (AG-002) ──
// Le total d'un bilan déjà communiqué change au réimport suivant : la mention
// est le seul garde-fou posé côté affichage, et elle est lue par des élus.
describe('dateFr', () => {
  it('ISO vers jour/mois/année', () => assert.equal(dateFr('2026-10-22'), '22/10/2026'));
  it('conserve les zéros de tête',  () => assert.equal(dateFr('2024-01-05'), '05/01/2024'));
  it('refuse un format partiel',   () => assert.equal(dateFr('2026-10'), ''));
  it('refuse du texte',            () => assert.equal(dateFr('nawak'), ''));
  it('refuse vide, null, undefined', () => {
    assert.equal(dateFr(''), '');
    assert.equal(dateFr(null), '');
    assert.equal(dateFr(undefined), '');
  });
});

describe('mentionRevisabilite', () => {
  it('les deux bornes et la date d\'import', () => {
    assert.equal(
      mentionRevisabilite({ debut: '2024-01-01', fin: '2026-10-21', dateImport: '22/10/2026' }),
      "Période du 01/01/2024 au 21/10/2026 · données importées le 22/10/2026 · chiffres susceptibles d'être révisés");
  });
  it('sans aucune borne, dit « Toutes périodes » plutôt que de taire le filtre', () => {
    assert.match(mentionRevisabilite({ dateImport: '22/10/2026' }), /^Toutes périodes · données importées le 22\/10\/2026 · /);
  });
  it('borne de début seule', () => {
    assert.match(mentionRevisabilite({ debut: '2024-01-01' }), /^Période depuis le 01\/01\/2024 · /);
  });
  it('borne de fin seule', () => {
    assert.match(mentionRevisabilite({ fin: '2026-10-21' }), /^Période jusqu'au 21\/10\/2026 · /);
  });
  it('sans date d\'import, le dit au lieu de laisser un blanc', () => {
    assert.match(mentionRevisabilite({ debut: '2024-01-01', fin: '2026-10-21' }), / · source non datée · /);
  });
  it('une borne illisible est traitée comme absente, jamais recopiée telle quelle', () => {
    const m = mentionRevisabilite({ debut: 'nawak', fin: '2026-10-21', dateImport: '22/10/2026' });
    assert.ok(!m.includes('nawak'), m);
    assert.match(m, /^Période jusqu'au 21\/10\/2026 · /);
  });
  it('l\'avertissement est présent dans tous les cas', () => {
    for (const o of [{}, { debut: '2024-01-01' }, { fin: '2026-10-21' }, { dateImport: '22/10/2026' },
                     { debut: '2024-01-01', fin: '2026-10-21', dateImport: '22/10/2026' }]) {
      assert.match(mentionRevisabilite(o), /chiffres susceptibles d'être révisés$/);
    }
  });
  it('sans argument, ne lève pas', () => {
    assert.equal(typeof mentionRevisabilite(), 'string');
    assert.equal(typeof mentionRevisabilite(null), 'string');
  });
});

